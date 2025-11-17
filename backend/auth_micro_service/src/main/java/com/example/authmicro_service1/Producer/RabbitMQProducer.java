package com.example.authmicro_service1.Producer;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class RabbitMQProducer {

    private final RabbitTemplate rabbitTemplate;

    private static final String EXCHANGE = "user.exchange";
    private static final String USER_CREATED_ROUTING_KEY = "user.created";
    private static final String USER_UPDATED_ROUTING_KEY = "user.updated";
    private static final String WALLET_CONNECTED_ROUTING_KEY = "wallet.connected";
    private static final String WALLET_DISCONNECTED_ROUTING_KEY = "wallet.disconnected";

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
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(EXCHANGE, USER_CREATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserCreatedEvent: userId=" + userId);
    }

    /**
     * Publier un événement de mise à jour d'utilisateur (wallet address)
     */
    public void publishUserUpdated(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(EXCHANGE, USER_UPDATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserUpdatedEvent: userId=" + userId);
    }

    /**
     * Publier un événement de connexion de wallet
     */
    public void publishWalletConnected(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(EXCHANGE, WALLET_CONNECTED_ROUTING_KEY, event);
        System.out.println("✅ Published WalletConnectedEvent: userId=" + userId + ", wallet=" + walletAddress);
    }

    /**
     * Publier un événement de déconnexion de wallet
     */
    public void publishWalletDisconnected(String userId) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("timestamp", LocalDateTime.now().toString());

        rabbitTemplate.convertAndSend(EXCHANGE, WALLET_DISCONNECTED_ROUTING_KEY, event);
        System.out.println("✅ Published WalletDisconnectedEvent: userId=" + userId);
    }
}