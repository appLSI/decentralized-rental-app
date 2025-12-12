package ma.fstt.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.fstt.paymentservice.domain.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de réponse contenant les informations d'un paiement
 * Retourné par l'API après validation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponseDTO {

    /**
     * ID unique du paiement (auto-généré)
     */
    private Long paymentId;

    /**
     * ID du booking associé
     */
    private Long bookingId;

    /**
     * Hash de la transaction blockchain
     */
    private String transactionHash;

    /**
     * Adresse du contrat RentalEscrow
     */
    private String contractAddress;

    /**
     * Statut actuel du paiement
     */
    private PaymentStatus status;

    /**
     * Montant validé (en unité de la devise)
     */
    private BigDecimal amount;

    /**
     * Devise utilisée (MATIC, USDC, etc.)
     */
    private String currency;

    /**
     * Adresse wallet du payeur (tenant)
     */
    private String fromAddress;

    /**
     * Numéro du block blockchain
     */
    private Long blockNumber;

    /**
     * Date de validation du paiement
     */
    private LocalDateTime validatedAt;

    /**
     * Date de création de l'enregistrement
     */
    private LocalDateTime createdAt;

    /**
     * Message d'erreur (si status = FAILED)
     * Non inclus dans la réponse si null
     */
    private String errorMessage;
}