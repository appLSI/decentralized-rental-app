package com.example.authmicro_service1.listeners;

import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.entities.UserType;
import com.example.authmicro_service1.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
public class PropertyEventListener {

    private static final Logger logger = LoggerFactory.getLogger(PropertyEventListener.class);

    @Autowired
    private UserRepository userRepository;

    /**
     * Écouter les événements de création de propriété
     * Si l'utilisateur n'est pas HOST, on l'ajoute automatiquement
     */
    @RabbitListener(queues = "property.created.queue")
    @Transactional // ✅ AJOUT: Assure l'atomicité de l'opération
    public void handlePropertyCreated(Map<String, Object> event) {
        try {
            // ✅ VALIDATION: Vérifier que les champs obligatoires existent
            if (event == null || !event.containsKey("ownerId")) {
                logger.error("❌ Invalid PropertyCreatedEvent: missing ownerId");
                return;
            }

            String ownerId = (String) event.get("ownerId");
            String propertyId = (String) event.get("propertyId");
            String status = (String) event.get("status");

            // ✅ VALIDATION: Vérifier que ownerId n'est pas null ou vide
            if (ownerId == null || ownerId.trim().isEmpty()) {
                logger.error("❌ Invalid PropertyCreatedEvent: ownerId is null or empty");
                return;
            }

            logger.info("📩 Received PropertyCreatedEvent: propertyId={}, ownerId={}, status={}",
                    propertyId, ownerId, status);

            // Récupérer l'utilisateur
            UserEntity user = userRepository.findByUserId(ownerId);

            if (user == null) {
                logger.error("❌ User not found with userId: {}", ownerId);
                return;
            }

            // ✅ AJOUTER le type HOST si l'utilisateur ne l'a pas déjà
            if (!user.getTypes().contains(UserType.HOST)) {
                user.getTypes().add(UserType.HOST);
                userRepository.save(user);

                logger.info("✅ User {} upgraded to HOST after creating property {}",
                        ownerId, propertyId);
            } else {
                logger.info("ℹ️ User {} already has HOST type", ownerId);
            }

        } catch (RuntimeException e) {
            // ✅ Gestion spécifique des erreurs métier (ex: user not found)
            logger.error("❌ Business error handling PropertyCreatedEvent: {}", e.getMessage());
            // Ne pas relancer l'exception pour éviter un requeue infini
        } catch (Exception e) {
            // ✅ Gestion des erreurs inattendues
            logger.error("❌ Unexpected error handling PropertyCreatedEvent: {}", e.getMessage(), e);
            // Option: vous pouvez relancer l'exception pour permettre un retry
            // throw new AmqpRejectAndDontRequeueException("Failed to process event", e);
        }
    }
}