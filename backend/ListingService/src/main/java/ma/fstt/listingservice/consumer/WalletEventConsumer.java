package ma.fstt.listingservice.consumer;

import ma.fstt.listingservice.entities.Owner;
import ma.fstt.listingservice.repositories.OwnerRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Consumer pour les événements wallet (connexion/déconnexion)
 */
@Service
public class WalletEventConsumer {

    @Autowired
    private OwnerRepository ownerRepository;

    /**
     * Écouter l'événement WalletConnectedEvent
     */
    @RabbitListener(queues = "wallet.connected.queue")
    public void handleWalletConnected(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String walletAddress = (String) event.get("walletAddress");

            System.out.println("📩 Received WalletConnectedEvent: userId=" + userId + ", wallet=" + walletAddress);

            Owner owner = ownerRepository.findByUserId(userId).orElse(null);

            if (owner != null) {
                owner.setWalletAddress(walletAddress);
                ownerRepository.save(owner);
                System.out.println("✅ Owner wallet updated: " + userId);
            } else {
                System.out.println("⚠️ Owner not found for userId: " + userId + " - will be created on property creation");
            }

        } catch (Exception e) {
            System.err.println("❌ Error handling WalletConnectedEvent: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Écouter l'événement WalletDisconnectedEvent
     */
    @RabbitListener(queues = "wallet.disconnected.queue")
    public void handleWalletDisconnected(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");

            System.out.println("📩 Received WalletDisconnectedEvent: userId=" + userId);

            Owner owner = ownerRepository.findByUserId(userId).orElse(null);

            if (owner != null) {
                owner.setWalletAddress(null);
                ownerRepository.save(owner);
                System.out.println("✅ Owner wallet removed: " + userId);
            } else {
                System.out.println("⚠️ Owner not found for userId: " + userId);
            }

        } catch (Exception e) {
            System.err.println("❌ Error handling WalletDisconnectedEvent: " + e.getMessage());
            e.printStackTrace();
        }
    }
}