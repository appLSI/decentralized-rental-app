package ma.fstt.paymentservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment Entity - Représente un paiement blockchain validé
 * Chaque payment est lié à un booking et une transaction blockchain
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_transaction_hash", columnList = "transactionHash", unique = true),
        @Index(name = "idx_booking_id", columnList = "bookingId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID du booking associé (référence vers BookingService)
     */
    @Column(nullable = false)
    private Long bookingId;

    /**
     * Hash de la transaction blockchain (unique identifier)
     * Format: 0x[64 hexadecimal characters]
     */
    @Column(nullable = false, unique = true, length = 66)
    private String transactionHash;

    /**
     * Adresse du contrat RentalEscrow déployé pour ce booking
     * Chaque booking a son propre contrat
     */
    @Column(nullable = false, length = 42)
    private String contractAddress;

    /**
     * Montant payé (converti de Wei vers Ether)
     */
    @Column(nullable = false, precision = 19, scale = 8)
    private BigDecimal amount;

    /**
     * Devise utilisée (MATIC, USDC, etc.)
     */
    @Column(nullable = false, length = 10)
    private String currency;

    /**
     * Adresse wallet du tenant (payeur)
     */
    @Column(length = 42)
    private String fromAddress;

    /**
     * Statut du paiement
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    /**
     * Numéro du block où la transaction a été minée
     */
    @Column
    private Long blockNumber;

    /**
     * Date de validation du paiement
     */
    @Column
    private LocalDateTime validatedAt;

    /**
     * Message d'erreur si validation échouée
     */
    @Column(length = 500)
    private String errorMessage;

    /**
     * Date de création de l'enregistrement
     */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date de dernière modification
     */
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}