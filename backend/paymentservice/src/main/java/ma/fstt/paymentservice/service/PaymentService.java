package ma.fstt.paymentservice.service;

import ma.fstt.paymentservice.dto.PaymentResponseDTO;
import ma.fstt.paymentservice.dto.PaymentValidationRequestDTO;

import java.util.List;

/**
 * Service de gestion des paiements blockchain
 */
public interface PaymentService {

    /**
     * Valide un paiement blockchain après que le tenant ait appelé fund()
     *
     * Étapes:
     * 1. Vérifier l'idempotence (transaction déjà validée?)
     * 2. Récupérer et valider le receipt de la transaction
     * 3. Parser l'événement Funded
     * 4. Vérifier le montant et l'état du contrat
     * 5. Persister le paiement en status CONFIRMED
     * 6. Publier l'événement RabbitMQ payment.confirmed
     *
     * @param request Données de validation (bookingId, txHash, contractAddress, expectedAmount)
     * @return PaymentResponseDTO avec status CONFIRMED ou FAILED
     * @throws ma.fstt.paymentservice.exception.PaymentValidationException si validation échoue
     */
    PaymentResponseDTO validatePayment(PaymentValidationRequestDTO request);

    /**
     * Récupère le dernier paiement d'un booking
     *
     * @param bookingId ID du booking
     * @return PaymentResponseDTO le plus récent
     * @throws ma.fstt.paymentservice.exception.PaymentNotFoundException si aucun paiement trouvé
     */
    PaymentResponseDTO getPaymentByBookingId(Long bookingId);

    /**
     * Récupère tous les paiements (tentatives) d'un booking
     * Utile pour voir l'historique (tentatives échouées puis réussie)
     *
     * @param bookingId ID du booking
     * @return Liste des paiements (ordre chronologique décroissant)
     */
    List<PaymentResponseDTO> getAllPaymentsByBookingId(Long bookingId);
}