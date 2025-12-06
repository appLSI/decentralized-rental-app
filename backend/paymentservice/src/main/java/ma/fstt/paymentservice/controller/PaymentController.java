package ma.fstt.paymentservice.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.dto.PaymentResponseDTO;
import ma.fstt.paymentservice.dto.PaymentValidationRequestDTO;
import ma.fstt.paymentservice.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller pour la gestion des paiements blockchain
 *
 * Endpoints:
 * - POST /payments/validate : Valider un paiement après fund()
 * - GET /payments/booking/{bookingId} : Historique des paiements
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Valider un paiement blockchain
     *
     * Appelé par le Frontend après que l'utilisateur ait :
     * 1. Appelé fund() sur le Smart Contract via MetaMask
     * 2. Attendu la confirmation de la transaction
     *
     * Headers requis:
     * - X-User-Id: ID de l'utilisateur (pour vérification tenant)
     *
     * @param request Données de validation (bookingId, txHash, contractAddress, expectedAmount)
     * @param userId ID de l'utilisateur (extrait du header)
     * @return PaymentResponseDTO avec status CONFIRMED ou erreur
     */
    @PostMapping("/validate")
    public ResponseEntity<PaymentResponseDTO> validatePayment(
            @Valid @RequestBody PaymentValidationRequestDTO request,
            @RequestHeader(value = "X-User-Id", required = true) Long userId
    ) {
        log.info("📥 Received payment validation request:");
        log.info("   User ID: {}", userId);
        log.info("   Booking ID: {}", request.getBookingId());
        log.info("   Transaction: {}", request.getTransactionHash());
        log.info("   Contract: {}", request.getContractAddress());

        // TODO: Vérifier que userId est bien le tenant du booking
        // Appel à BookingService via REST ou RabbitMQ pour validation
        // if (!bookingService.isTenantOfBooking(userId, request.getBookingId())) {
        //     throw new UnauthorizedException("User is not the tenant of this booking");
        // }

        PaymentResponseDTO response = paymentService.validatePayment(request);

        log.info("✅ Payment validation completed with status: {}", response.getStatus());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    /**
     * Récupérer l'historique des paiements pour un booking
     *
     * Utile pour voir :
     * - Les tentatives échouées
     * - Le paiement confirmé final
     *
     * @param bookingId ID du booking
     * @param userId ID de l'utilisateur (pour vérification propriétaire/tenant)
     * @return Liste des paiements (ordre chronologique décroissant)
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByBooking(
            @PathVariable Long bookingId,
            @RequestHeader(value = "X-User-Id", required = true) Long userId
    ) {
        log.info("📥 Fetching payments for booking {} (user: {})", bookingId, userId);

        // TODO: Vérifier que userId est owner ou tenant du booking

        List<PaymentResponseDTO> payments = paymentService.getAllPaymentsByBookingId(bookingId);

        log.info("✅ Found {} payment(s) for booking {}", payments.size(), bookingId);

        return ResponseEntity.ok(payments);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("PaymentService is running");
    }
}