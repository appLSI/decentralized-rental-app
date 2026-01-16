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

    // ✅ NOUVELLES ROUTING KEYS pour les événements wallet
    private static final String WALLET_CONNECTED_ROUTING_KEY = "user.wallet.connected";
    private static final String WALLET_UPDATED_ROUTING_KEY = "user.wallet.updated";
    private static final String WALLET_DISCONNECTED_ROUTING_KEY = "user.wallet.disconnected";

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
        event.put("timestamp", System.currentTimeMillis());

        rabbitTemplate.convertAndSend(EXCHANGE, USER_CREATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserCreatedEvent: userId=" + userId);
    }

    /**
     * Publier un événement de mise à jour d'utilisateur
     */
    public void publishUserUpdated(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);
        event.put("timestamp", System.currentTimeMillis());

        rabbitTemplate.convertAndSend(EXCHANGE, USER_UPDATED_ROUTING_KEY, event);
        System.out.println("✅ Published UserUpdatedEvent: userId=" + userId);
    }

    /**
     * ✅ NOUVEAU: Publier un événement de connexion de wallet (première fois)
     *
     * Cet événement est émis lorsqu'un utilisateur connecte un wallet pour la première fois.
     * Les services consommateurs (Listing, Booking, Payment) doivent enregistrer cette association.
     *
     * @param userId ID de l'utilisateur
     * @param walletAddress Adresse du wallet connecté
     */
    public void publishWalletConnected(String userId, String walletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("walletAddress", walletAddress);
        event.put("timestamp", System.currentTimeMillis());
        event.put("eventType", "WALLET_CONNECTED");

        rabbitTemplate.convertAndSend(EXCHANGE, WALLET_CONNECTED_ROUTING_KEY, event);
        System.out.println("✅ Published WalletConnectedEvent: userId=" + userId + ", wallet=" + walletAddress);
    }

    /**
     * ✅ NOUVEAU: Publier un événement de mise à jour de wallet
     *
     * Cet événement est émis lorsqu'un utilisateur change son wallet (remplace l'ancien).
     * Les services doivent mettre à jour l'association userId → walletAddress.
     *
     * @param userId ID de l'utilisateur
     * @param newWalletAddress Nouvelle adresse du wallet
     * @param oldWalletAddress Ancienne adresse du wallet
     */
    public void publishWalletUpdated(String userId, String newWalletAddress, String oldWalletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("newWalletAddress", newWalletAddress);
        event.put("oldWalletAddress", oldWalletAddress);
        event.put("timestamp", System.currentTimeMillis());
        event.put("eventType", "WALLET_UPDATED");

        rabbitTemplate.convertAndSend(EXCHANGE, WALLET_UPDATED_ROUTING_KEY, event);
        System.out.println("✅ Published WalletUpdatedEvent: userId=" + userId +
                ", old=" + oldWalletAddress + " → new=" + newWalletAddress);
    }

    /**
     * ✅ NOUVEAU: Publier un événement de déconnexion de wallet
     *
     * Cet événement est émis lorsqu'un utilisateur déconnecte son wallet.
     * Les services doivent supprimer l'association userId → walletAddress.
     *
     * IMPORTANT: Cet événement n'est publié QUE si toutes les validations métier ont réussi:
     * - Pas de properties actives
     * - Pas de réservations futures (host)
     * - Pas de réservations actives (client)
     *
     * @param userId ID de l'utilisateur
     * @param disconnectedWalletAddress Adresse du wallet déconnecté (pour logs/audit)
     */
    public void publishWalletDisconnected(String userId, String disconnectedWalletAddress) {
        Map<String, Object> event = new HashMap<>();
        event.put("userId", userId);
        event.put("disconnectedWalletAddress", disconnectedWalletAddress); // Pour audit
        event.put("timestamp", System.currentTimeMillis());
        event.put("eventType", "WALLET_DISCONNECTED");

        rabbitTemplate.convertAndSend(EXCHANGE, WALLET_DISCONNECTED_ROUTING_KEY, event);
        System.out.println("✅ Published WalletDisconnectedEvent: userId=" + userId +
                ", wallet=" + disconnectedWalletAddress);
    }
}