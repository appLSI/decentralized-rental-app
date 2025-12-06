package ma.fstt.paymentservice.repository;

import ma.fstt.paymentservice.domain.Payment;
import ma.fstt.paymentservice.domain.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour l'accès aux données Payment
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Recherche un paiement par son hash de transaction
     * Utilisé pour l'idempotence et éviter les doublons
     *
     * @param transactionHash Hash unique de la transaction (0x...)
     * @return Payment si trouvé
     */
    Optional<Payment> findByTransactionHash(String transactionHash);

    /**
     * Récupère tous les paiements d'un booking
     * Peut y avoir plusieurs tentatives (FAILED puis CONFIRMED)
     *
     * @param bookingId ID du booking
     * @return Liste des paiements (chronologique)
     */
    List<Payment> findByBookingIdOrderByCreatedAtDesc(Long bookingId);

    /**
     * Vérifie si une transaction a déjà été validée
     * Optimisation pour l'idempotence (évite de charger l'entité complète)
     *
     * @param transactionHash Hash de la transaction
     * @return true si la transaction existe déjà
     */
    boolean existsByTransactionHash(String transactionHash);

    /**
     * Recherche un paiement par booking et statut spécifique
     * Utile pour vérifier si un booking a déjà un paiement CONFIRMED
     *
     * @param bookingId ID du booking
     * @param status Statut recherché
     * @return Payment si trouvé
     */
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    /**
     * Compte le nombre de tentatives de validation pour un booking
     * Peut servir pour le rate limiting
     *
     * @param bookingId ID du booking
     * @return Nombre de tentatives
     */
    long countByBookingId(Long bookingId);
}