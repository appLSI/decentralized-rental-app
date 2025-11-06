package ma.fstt.listingservice.listeners;

import ma.fstt.listingservice.config.RabbitMQConfig;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.repositories.OwnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserEventListener {

    private static final Logger logger = LoggerFactory.getLogger(UserEventListener.class);

    @Autowired
    private OwnerRepository ownerRepository;

    /**
     * Écouter les événements de création d'utilisateur
     */
    @RabbitListener(queues = RabbitMQConfig.USER_CREATED_QUEUE)
    public void handleUserCreated(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String walletAddress = (String) event.get("walletAddress");

            logger.info("🔔 Received UserCreatedEvent: userId={}, walletAddress={}", userId, walletAddress);

            // Vérifier si l'owner existe déjà
            if (ownerRepository.existsByUserId(userId)) {
                logger.warn("⚠️ Owner with userId {} already exists", userId);
                return;
            }

            // Créer un nouvel Owner
            Owner owner = new Owner();
            owner.setUserId(userId);
            owner.setWalletAddress(walletAddress);

            ownerRepository.save(owner);

            logger.info("✅ Owner created successfully with userId: {} and walletAddress: {}", userId, walletAddress);

        } catch (Exception e) {
            logger.error("❌ Error handling UserCreatedEvent: {}", e.getMessage(), e);
        }
    }

    /**
     * Écouter les événements de mise à jour d'utilisateur
     * (Uniquement pour walletAddress)
     */
    @RabbitListener(queues = RabbitMQConfig.USER_UPDATED_QUEUE)
    public void handleUserUpdated(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String walletAddress = (String) event.get("walletAddress");

            logger.info("🔔 Received UserUpdatedEvent: userId={}, walletAddress={}", userId, walletAddress);

            // Rechercher l'owner existant
            Owner owner = ownerRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Owner not found with userId: " + userId));

            // Mettre à jour le walletAddress
            if (walletAddress != null) {
                String oldWallet = owner.getWalletAddress();
                owner.setWalletAddress(walletAddress);
                ownerRepository.save(owner);

                logger.info("✅ Owner wallet updated successfully: userId={}, old={}, new={}",
                        userId, oldWallet, walletAddress);
            } else {
                logger.warn("⚠️ Received null walletAddress for userId: {}", userId);
            }

        } catch (Exception e) {
            logger.error("❌ Error handling UserUpdatedEvent: {}", e.getMessage(), e);
        }
    }
}