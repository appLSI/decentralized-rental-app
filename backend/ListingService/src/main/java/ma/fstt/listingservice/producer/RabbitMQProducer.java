package ma.fstt.listingservice.producer;

import ma.fstt.listingservice.config.RabbitMQConfig;
import ma.fstt.listingservice.entities.PropertyEntity;
import ma.fstt.listingservice.entities.PropertyStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RabbitMQProducer {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQProducer.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * ✅ NOUVEAU: Publier événement User Type Upgraded (USER → HOST)
     * Appelé quand un user crée sa première property
     */
    public void publishUserTypeUpgraded(String userId, String newType) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("userId", userId);
            event.put("newType", newType);
            event.put("timestamp", System.currentTimeMillis());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.USER_EXCHANGE,
                    RabbitMQConfig.USER_TYPE_UPGRADED_ROUTING_KEY,
                    event
            );

            log.info("📤 Published user.type.upgraded: userId={}, newType={}", userId, newType);
        } catch (Exception e) {
            log.error("❌ Failed to publish user.type.upgraded: {}", e.getMessage(), e);
        }
    }

    /**
     * ✅ NOUVEAU: Publier événement Property Created
     * Utilisé pour notifier autres services (booking, analytics, etc.)
     */
    public void publishPropertyCreated(PropertyEntity property) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", property.getPropertyId());
            event.put("ownerId", property.getOwnerId());
            event.put("title", property.getTitle());
            event.put("type", property.getType());
            event.put("city", property.getCity());
            event.put("country", property.getCountry());
            event.put("pricePerNight", property.getPricePerNight());

            // ✅ NOUVEAU: Utiliser status ENUM au lieu de booléens
            event.put("status", property.getStatus().name()); // "DRAFT", "ACTIVE", etc.

            event.put("timestamp", System.currentTimeMillis());

            rabbitTemplate.convertAndSend(
                    "property.exchange", // Créer ce exchange si nécessaire
                    "property.created",
                    event
            );

            log.info("📤 Published property.created: propertyId={}, status={}",
                    property.getPropertyId(), property.getStatus());
        } catch (Exception e) {
            log.error("❌ Failed to publish property.created: {}", e.getMessage(), e);
        }
    }

    /**
     * ✅ NOUVEAU: Publier événement Property Status Changed
     * Utilisé pour notifier changements de statut (DRAFT → PENDING, PENDING → ACTIVE, etc.)
     */
    public void publishPropertyStatusChanged(String propertyId, PropertyStatus oldStatus, PropertyStatus newStatus) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", propertyId);
            event.put("oldStatus", oldStatus.name());
            event.put("newStatus", newStatus.name());
            event.put("timestamp", System.currentTimeMillis());

            rabbitTemplate.convertAndSend(
                    "property.exchange",
                    "property.status.changed",
                    event
            );

            log.info("📤 Published property.status.changed: propertyId={}, {} → {}",
                    propertyId, oldStatus, newStatus);
        } catch (Exception e) {
            log.error("❌ Failed to publish property.status.changed: {}", e.getMessage(), e);
        }
    }

    /**
     * ✅ NOUVEAU: Publier événement Property Validated
     * Utilisé pour notifier qu'une property a été validée par admin
     */
    public void publishPropertyValidated(PropertyEntity property) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", property.getPropertyId());
            event.put("ownerId", property.getOwnerId());
            event.put("title", property.getTitle());
            event.put("status", property.getStatus().name());
            event.put("timestamp", System.currentTimeMillis());

            rabbitTemplate.convertAndSend(
                    "property.exchange",
                    "property.validated",
                    event
            );

            log.info("📤 Published property.validated: propertyId={}", property.getPropertyId());
        } catch (Exception e) {
            log.error("❌ Failed to publish property.validated: {}", e.getMessage(), e);
        }
    }

    /**
     * ✅ NOUVEAU: Publier événement Property Deleted
     * Utilisé pour notifier suppression (soft delete)
     */
    public void publishPropertyDeleted(String propertyId, String ownerId) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("propertyId", propertyId);
            event.put("ownerId", ownerId);
            event.put("timestamp", System.currentTimeMillis());

            rabbitTemplate.convertAndSend(
                    "property.exchange",
                    "property.deleted",
                    event
            );

            log.info("📤 Published property.deleted: propertyId={}", propertyId);
        } catch (Exception e) {
            log.error("❌ Failed to publish property.deleted: {}", e.getMessage(), e);
        }
    }
}