package ma.fstt.bookingservice.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * ✅ Entité Tenant - Représente un utilisateur dans le BookingService
 * Synchronisée avec AuthService via RabbitMQ
 */
@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ⚠️ IMPORTANT: userId est le String UUID venant d'AuthService
     * C'est LA clé de synchronisation entre les services
     */
    @Column(nullable = false, unique = true, length = 255)
    private String userId;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(length = 100)
    private String firstname;

    @Column(length = 100)
    private String lastname;

    /**
     * Wallet Ethereum address (0x...)
     * Peut être null si l'utilisateur n'a pas connecté son wallet
     */
    @Column(length = 42)
    private String walletAddress;
}