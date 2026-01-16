package ma.fstt.listingservice.listeners;

import com.fasterxml.jackson.databind.ObjectMapper;
import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.repositories.OwnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * ✅ Listener pour les événements wallet du Auth Service
 */
@Component
public class WalletEventListener {

    private static final Logger log = LoggerFactory.getLogger(WalletEventListener.class);
    private final OwnerRepository ownerRepository;
    private final ObjectMapper objectMapper;

    public WalletEventListener(OwnerRepository ownerRepository, ObjectMapper objectMapper) {
        this.ownerRepository = ownerRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * ✅ Écoute les événements de CONNEXION de wallet
     * Routing key: user.wallet.connected
     */
    @RabbitListener(queues = "user.wallet.connected.queue")
    @Transactional
    public void handleWalletConnected(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String walletAddress = (String) event.get("walletAddress");

            log.info("📥 [WALLET CONNECTED] Received event: userId={}, wallet={}", userId, walletAddress);

            // Chercher ou créer l'owner
            Owner owner = ownerRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        log.info("🆕 Creating new owner for userId={}", userId);
                        Owner newOwner = new Owner();
                        newOwner.setUserId(userId);
                        return newOwner;
                    });

            // Mettre à jour l'adresse wallet
            owner.setWalletAddress(walletAddress);
            ownerRepository.save(owner);

            log.info("✅ [WALLET CONNECTED] Owner updated: userId={}, wallet={}", userId, walletAddress);

        } catch (Exception e) {
            log.error("❌ [WALLET CONNECTED] Error processing event: {}", event, e);
            throw new RuntimeException("Failed to process wallet connected event", e);
        }
    }

    /**
     * ✅ Écoute les événements de MISE À JOUR de wallet
     * Routing key: user.wallet.updated
     */
    @RabbitListener(queues = "user.wallet.updated.queue")
    @Transactional
    public void handleWalletUpdated(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String oldWallet = (String) event.get("oldWalletAddress");
            String newWallet = (String) event.get("newWalletAddress");

            log.info("📥 [WALLET UPDATED] Received event: userId={}, old={}, new={}",
                    userId, oldWallet, newWallet);

            Owner owner = ownerRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Owner not found: " + userId));

            owner.setWalletAddress(newWallet);
            ownerRepository.save(owner);

            log.info("✅ [WALLET UPDATED] Owner updated: userId={}, wallet={}", userId, newWallet);

        } catch (Exception e) {
            log.error("❌ [WALLET UPDATED] Error processing event: {}", event, e);
            throw new RuntimeException("Failed to process wallet updated event", e);
        }
    }

    /**
     * ✅ Écoute les événements de DÉCONNEXION de wallet
     * Routing key: user.wallet.disconnected
     */
    @RabbitListener(queues = "user.wallet.disconnected.queue")
    @Transactional
    public void handleWalletDisconnected(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String walletAddress = (String) event.get("walletAddress");

            log.info("📥 [WALLET DISCONNECTED] Received event: userId={}, wallet={}", userId, walletAddress);

            Owner owner = ownerRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Owner not found: " + userId));

            owner.setWalletAddress(null);
            ownerRepository.save(owner);

            log.info("✅ [WALLET DISCONNECTED] Wallet removed from owner: userId={}", userId);

        } catch (Exception e) {
            log.error("❌ [WALLET DISCONNECTED] Error processing event: {}", event, e);
            throw new RuntimeException("Failed to process wallet disconnected event", e);
        }
    }
}