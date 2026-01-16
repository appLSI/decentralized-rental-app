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

/**
 * ✅ NOUVEAU : Écoute les événements de transformation CLIENT → HOST
 */
@Component
public class UserTypeListener {

    private static final Logger log = LoggerFactory.getLogger(UserTypeListener.class);

    @Autowired
    private UserRepository userRepository;

    @RabbitListener(queues = "user.type.upgraded.queue")
    @Transactional
    public void handleUserTypeUpgraded(Map<String, Object> event) {
        try {
            String userId = (String) event.get("userId");
            String newType = (String) event.get("newType");

            log.info("📢 [USER TYPE UPGRADED] Received event: userId={}, type={}", userId, newType);

            // Rechercher l'utilisateur
            UserEntity user = userRepository.findByUserId(userId);
            if (user == null) {
                log.error("❌ User not found: {}", userId);
                return;
            }

            // Ajouter HOST aux types si pas déjà présent
            if ("HOST".equals(newType)) {
                if (user.getTypes().contains(UserType.HOST)) {
                    log.info("ℹ️ User {} already has HOST type", userId);
                    return;
                }

                user.getTypes().add(UserType.HOST);
                userRepository.save(user);

                log.info("✅ User upgraded to HOST: {}", userId);
                log.info("   Types: {}", user.getTypes());
            }

        } catch (Exception e) {
            log.error("❌ [USER TYPE UPGRADED] Error processing event: {}", event, e);
            throw new RuntimeException("Failed to process user type upgraded event", e);
        }
    }
}