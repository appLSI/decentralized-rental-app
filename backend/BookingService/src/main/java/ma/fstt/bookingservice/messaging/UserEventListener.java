package ma.fstt.bookingservice.messaging;

import ma.fstt.bookingservice.entities.Tenant;
import ma.fstt.bookingservice.repository.TenantRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;


import java.util.Optional;

@Component
@Slf4j
public class UserEventListener {

    @Autowired
    private TenantRepository tenantRepository;

    /**
     * ✅ Écouter les événements de création d'utilisateur
     */
    @RabbitListener(queues = "user.created.queue")
    public void handleUserCreated(UserCreatedEvent event) {
        try {
            log.info("📩 Événement reçu: Création d'utilisateur → " + event);

            // Vérifier si le tenant existe déjà (éviter les doublons)
            Optional<Tenant> existingTenant = tenantRepository.findByUserId(event.getUserId());

            if (existingTenant.isPresent()) {
                System.out.println("⚠️ Tenant déjà existant: " + event.getUserId());
                return;
            }

            // Créer le tenant
            Tenant tenant = new Tenant();
            tenant.setUserId(event.getUserId());
            tenant.setEmail(event.getEmail());
            tenant.setFirstname(event.getFirstname());
            tenant.setLastname(event.getLastname());
            tenant.setWalletAddress(event.getWalletAddress());

            tenantRepository.save(tenant);
            System.out.println("✅ Tenant créé avec succès: " + tenant.getUserId());

        } catch (Exception e) {
            log.error("❌ Erreur lors de la création du tenant: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw pour que RabbitMQ puisse retry si configuré
        }
    }

    /**
     * ✅ Écouter les événements de mise à jour d'utilisateur
     */
    @RabbitListener(queues = "user.updated.queue")
    public void handleUserUpdated(UserUpdatedEvent event) {
        try {
            System.out.println("📩 Événement reçu: Mise à jour d'utilisateur → " + event);

            // Trouver le tenant
            Optional<Tenant> tenantOpt = tenantRepository.findByUserId(event.getUserId());

            if (!tenantOpt.isPresent()) {
                System.err.println("⚠️ Tenant non trouvé pour mise à jour: " + event.getUserId());
                // Créer le tenant si il n'existe pas
                Tenant newTenant = new Tenant();
                newTenant.setUserId(event.getUserId());
                newTenant.setEmail(event.getEmail());
                newTenant.setFirstname(event.getFirstname());
                newTenant.setLastname(event.getLastname());
                newTenant.setWalletAddress(event.getWalletAddress());
                tenantRepository.save(newTenant);
                System.out.println("✅ Tenant créé (via update event): " + newTenant.getUserId());
                return;
            }

            // Mettre à jour le tenant
            Tenant tenant = tenantOpt.get();
            tenant.setEmail(event.getEmail());
            tenant.setFirstname(event.getFirstname());
            tenant.setLastname(event.getLastname());
            tenant.setWalletAddress(event.getWalletAddress());

            tenantRepository.save(tenant);
            System.out.println("✅ Tenant mis à jour avec succès: " + tenant.getUserId());

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la mise à jour du tenant: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}