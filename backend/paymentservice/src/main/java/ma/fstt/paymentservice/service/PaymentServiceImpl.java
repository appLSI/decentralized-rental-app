package ma.fstt.paymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.blockchain.ContractState;
import ma.fstt.paymentservice.blockchain.FundedEventData;
import ma.fstt.paymentservice.blockchain.RentalEscrowContract;
import ma.fstt.paymentservice.domain.Payment;
import ma.fstt.paymentservice.domain.PaymentStatus;
import ma.fstt.paymentservice.dto.PaymentResponseDTO;
import ma.fstt.paymentservice.dto.PaymentValidationRequestDTO;
import ma.fstt.paymentservice.exception.*;
import ma.fstt.paymentservice.messaging.RabbitMQProducer;
import ma.fstt.paymentservice.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implémentation du service de validation de paiements blockchain
 *
 * Architecture modernisée:
 * - Le FRONTEND déclenche le paiement via MetaMask
 * - Le BACKEND valide en lecture seule (read-only)
 * - Pas de private key stockée côté serveur
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalEscrowContract escrowContract;
    private final RabbitMQProducer rabbitMQProducer;

    /**
     * Tolérance pour la vérification du montant (0.01%)
     * Permet de gérer les variations minimes de gas/slippage
     */
    private static final BigDecimal AMOUNT_TOLERANCE_PERCENTAGE = new BigDecimal("0.0001");

    /**
     * Valide un paiement blockchain après que le tenant ait appelé fund()
     *
     * Workflow:
     * 1. User paie via MetaMask → Transaction minée
     * 2. Frontend envoie txHash au backend
     * 3. Backend lit la blockchain et vérifie:
     *    - Transaction existe et a réussi
     *    - Événement Funded émis
     *    - Montant correct
     *    - Contrat en état Funded
     * 4. Backend confirme le paiement en DB
     * 5. Backend notifie BookingService via RabbitMQ
     *
     * @param request Données de validation (bookingId, txHash, contractAddress, expectedAmount)
     * @return PaymentResponseDTO avec status CONFIRMED ou FAILED
     * @throws PaymentValidationException si validation échoue
     */
    @Override
    @Transactional
    public PaymentResponseDTO validatePayment(PaymentValidationRequestDTO request) {

        log.info("🔐 Validating payment for booking {} with tx {}",
                request.getBookingId(), request.getTransactionHash());

        // ==================== 1. IDEMPOTENCE CHECK ====================
        // Évite les doublons si le frontend renvoie la même requête
        Optional<Payment> existingPayment = paymentRepository
                .findByTransactionHash(request.getTransactionHash());

        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            log.info("⚡ Payment already validated (idempotent request). Status: {}",
                    payment.getStatus());
            return mapToDTO(payment);
        }

        // ==================== 2. CRÉER LE PAYMENT ====================
        // Créer l'entité Payment en status VALIDATING
        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .transactionHash(request.getTransactionHash())
                .contractAddress(request.getContractAddress())
                .status(PaymentStatus.VALIDATING)
                .currency("ETH") // Sera "MATIC" sur Polygon
                .amount(request.getExpectedAmount()) // 👈 AJOUT CRITIQUE
                .build();

        payment = paymentRepository.save(payment);
        log.debug("💾 Payment record created with ID: {}", payment.getId());

        try {
            // ==================== 3. VALIDER LA TRANSACTION ====================
            // Lire la blockchain et parser l'événement Funded
            log.info("🔍 Validating transaction on blockchain...");
            FundedEventData eventData = escrowContract.validateFundTransaction(
                    request.getContractAddress(),
                    request.getTransactionHash()
            );

            log.info("✅ Transaction found in block {}", eventData.getBlockNumber());
            log.info("   Tenant: {}", eventData.getTenantAddress());
            log.info("   Amount: {} ETH", eventData.getAmount());

            // ==================== 4. VÉRIFIER LE MONTANT ====================
            // Tolérance de 0.01% pour gérer les variations de gas
            BigDecimal tolerance = request.getExpectedAmount()
                    .multiply(AMOUNT_TOLERANCE_PERCENTAGE);
            BigDecimal minAcceptable = request.getExpectedAmount().subtract(tolerance);

            if (eventData.getAmount().compareTo(minAcceptable) < 0) {
                String errorMsg = String.format(
                        "Amount mismatch: expected %.4f ETH, got %.4f ETH",
                        request.getExpectedAmount(), eventData.getAmount()
                );
                log.error("❌ {}", errorMsg);
                throw new AmountMismatchException(errorMsg);
            }

            log.info("✅ Amount verified: {} ETH (expected: {} ETH)",
                    eventData.getAmount(), request.getExpectedAmount());

            // ==================== 5. VÉRIFIER L'ÉTAT DU CONTRAT ====================
            // Le contrat DOIT être en état Funded après l'appel à fund()
            ContractState state = escrowContract.getContractState(request.getContractAddress());

            if (state != ContractState.Funded) {
                String errorMsg = String.format(
                        "Contract must be in Funded state, but is: %s", state
                );
                log.error("❌ {}", errorMsg);
                throw new InvalidContractStateException(errorMsg);
            }

            log.info("✅ Contract state verified: {}", state);

            // ==================== 6. CONFIRMER LE PAIEMENT ====================
            // Mettre à jour le Payment → CONFIRMED
            payment.setStatus(PaymentStatus.CONFIRMED);
            payment.setAmount(eventData.getAmount());
            payment.setFromAddress(eventData.getTenantAddress());
            payment.setBlockNumber(eventData.getBlockNumber().longValue());
            payment.setValidatedAt(LocalDateTime.now());

            Payment confirmedPayment = paymentRepository.save(payment);

            log.info("✅ Payment validated successfully for booking {}. Payment ID: {}",
                    request.getBookingId(), confirmedPayment.getId());

            // ==================== 7. NOTIFIER BOOKINGSERVICE ====================
            // Publier l'événement RabbitMQ → BookingService écoute et confirme le booking
            rabbitMQProducer.publishPaymentConfirmed(confirmedPayment);

            return mapToDTO(confirmedPayment);

        } catch (TransactionNotFoundException
                 | TransactionFailedException
                 | InvalidContractException
                 | EventNotFoundException
                 | AmountMismatchException
                 | InvalidContractStateException e) {

            // ==================== ERREURS MÉTIER ATTENDUES ====================
            // Transaction non trouvée, montant incorrect, etc.
            log.error("❌ Payment validation failed: {}", e.getMessage());

            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage(e.getMessage());
            payment.setValidatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Publier l'échec
            rabbitMQProducer.publishPaymentFailed(payment, e.getMessage());

            throw new PaymentValidationException("Payment validation failed: " + e.getMessage(), e);

        } catch (Exception e) {

            // ==================== ERREURS TECHNIQUES INATTENDUES ====================
            // Problème de connexion blockchain, parsing JSON, etc.
            log.error("❌ Unexpected error during payment validation", e);

            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorMessage("Internal error: " + e.getMessage());
            payment.setValidatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            rabbitMQProducer.publishPaymentFailed(payment, "Internal error");

            throw new PaymentValidationException("Unexpected error during validation", e);
        }
    }

    /**
     * Récupère le dernier paiement d'un booking
     *
     * @param bookingId ID du booking
     * @return PaymentResponseDTO le plus récent
     * @throws PaymentNotFoundException si aucun paiement trouvé
     */
    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByBookingId(Long bookingId) {

        log.debug("Fetching latest payment for booking {}", bookingId);

        List<Payment> payments = paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);

        if (payments.isEmpty()) {
            throw new PaymentNotFoundException(
                    String.format("No payment found for booking %d", bookingId)
            );
        }

        // Retourner le plus récent
        return mapToDTO(payments.get(0));
    }

    /**
     * Récupère tous les paiements (tentatives) d'un booking
     * Utile pour voir l'historique (tentatives échouées puis réussie)
     *
     * @param bookingId ID du booking
     * @return Liste des paiements (ordre chronologique décroissant)
     */
    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPaymentsByBookingId(Long bookingId) {

        log.debug("Fetching all payments for booking {}", bookingId);

        List<Payment> payments = paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);

        return payments.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mapper Payment entity → PaymentResponseDTO
     */
    private PaymentResponseDTO mapToDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .paymentId(payment.getId())
                .bookingId(payment.getBookingId())
                .transactionHash(payment.getTransactionHash())
                .contractAddress(payment.getContractAddress())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .fromAddress(payment.getFromAddress())
                .blockNumber(payment.getBlockNumber())
                .validatedAt(payment.getValidatedAt())
                .createdAt(payment.getCreatedAt())
                .errorMessage(payment.getErrorMessage())
                .build();
    }
}