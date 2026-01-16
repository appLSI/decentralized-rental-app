package ma.fstt.bookingservice.messaging;

import lombok.*;

import java.io.Serializable;

/**
 * Event publié par AuthService quand un utilisateur est mis à jour
 * Reçu par BookingService pour synchroniser la table Tenants
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdatedEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * UUID de l'utilisateur (clé primaire dans AuthService)
     */
    private String userId;

    /**
     * Email de l'utilisateur
     */
    private String email;

    /**
     * Prénom de l'utilisateur
     */
    private String firstname;

    /**
     * Nom de famille de l'utilisateur
     */
    private String lastname;

    /**
     * Adresse du wallet Ethereum (optionnel)
     */
    private String walletAddress;
}