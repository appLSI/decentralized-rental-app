package ma.fstt.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour la requête de validation de paiement blockchain
 * Envoyé par le Frontend après que l'utilisateur ait appelé fund()
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentValidationRequestDTO {

    /**
     * ID du booking à valider
     */
    @NotNull(message = "Booking ID is required")
    @Positive(message = "Booking ID must be positive")
    private Long bookingId;

    /**
     * Hash de la transaction blockchain
     * Format: 0x[64 hex characters]
     * Exemple: 0x1234567890abcdef...
     */
    @NotBlank(message = "Transaction hash is required")
    @Pattern(
            regexp = "^0x[a-fA-F0-9]{64}$",
            message = "Invalid transaction hash format. Expected: 0x[64 hex characters]"
    )
    private String transactionHash;

    /**
     * Adresse du contrat RentalEscrow déployé pour ce booking
     * Format: 0x[40 hex characters]
     * Exemple: 0x1234567890AbCdEf1234567890aBcDeF12345678
     */
    @NotBlank(message = "Contract address is required")
    @Pattern(
            regexp = "^0x[a-fA-F0-9]{40}$",
            message = "Invalid contract address format. Expected: 0x[40 hex characters]"
    )
    private String contractAddress;

    /**
     * Montant attendu (en MATIC ou autre token)
     * Utilisé pour double-check avec l'événement Funded
     * Tolérance de 0.01% appliquée côté service
     */
    @NotNull(message = "Expected amount is required")
    @Positive(message = "Expected amount must be positive")
    private BigDecimal expectedAmount;
}