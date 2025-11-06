package com.example.authmicro_service1.Producer;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    private static final String EXCHANGE = "user.exchange";
    private static final String USER_CREATED_ROUTING_KEY = "user.created";
    private static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    public RabbitMQProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Publier un événement de création d'utilisateur
     */
    public void publishUserCreated(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);

        rabbitTemplate.convertAndSend(EXCHANGE, USER_CREATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserCreatedEvent: userId=" + userId + ", walletAddress=" + walletAddress);
    }

    /**
     * Publier un événement de mise à jour d'utilisateur (wallet address)
     */
    public void publishUserUpdated(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);

        rabbitTemplate.convertAndSend(EXCHANGE, USER_UPDATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserUpdatedEvent: userId=" + userId + ", walletAddress=" + walletAddress);
    }
}