package ma.fstt.bookingservice.repository;

import ma.fstt.bookingservice.entities.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ✅ Repository pour l'entité Tenant
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Trouver un tenant par son userId (String UUID d'AuthService)
     * Utilisé pour la synchronisation RabbitMQ
     */
    Optional<Tenant> findByUserId(String userId);

    /**
     * Vérifier si un tenant existe par son userId
     */
    boolean existsByUserId(String userId);

    /**
     * Trouver un tenant par son email
     */
    Optional<Tenant> findByEmail(String email);

}