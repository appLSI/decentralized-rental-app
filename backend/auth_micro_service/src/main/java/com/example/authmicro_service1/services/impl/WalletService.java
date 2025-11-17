package com.example.authmicro_service1.services;

import com.example.authmicro_service1.Producer.RabbitMQProducer;
import com.example.authmicro_service1.client.BookingServiceClient;
import com.example.authmicro_service1.client.ListingServiceClient;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class WalletService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @Autowired
    private ListingServiceClient listingServiceClient;

    @Autowired
    private BookingServiceClient bookingServiceClient;

    /**
     * Connecter un wallet à l'utilisateur
     */
    @Transactional
    public Map<String, Object> connectWallet(String userId, String walletAddress) {
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        // Vérifier que le wallet n'est pas déjà utilisé par un autre utilisateur
        UserEntity existingWallet = userRepository.findByWalletAddress(walletAddress);
        if (existingWallet != null && !existingWallet.getUserId().equals(userId)) {
            throw new RuntimeException("Cette adresse wallet est déjà utilisée par un autre compte");
        }

        // Connecter le wallet
        user.setWalletAddress(walletAddress);
        userRepository.save(user);

        // Publier l'événement
        rabbitMQProducer.publishWalletConnected(userId, walletAddress);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Wallet connecté avec succès");
        response.put("userId", userId);
        response.put("walletAddress", walletAddress);

        return response;
    }

    /**
     * Déconnecter le wallet de l'utilisateur avec vérifications
     */
    @Transactional
    public Map<String, Object> disconnectWallet(String userId) {
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        if (user.getWalletAddress() == null || user.getWalletAddress().trim().isEmpty()) {
            throw new RuntimeException("Aucun wallet connecté à ce compte");
        }

        Map<String, Object> validationResult = validateWalletDisconnection(userId);

        if (!(boolean) validationResult.get("canDisconnect")) {
            // Retourner les détails de blocage
            return validationResult;
        }

        // Tout est OK, on peut déconnecter
        String previousWallet = user.getWalletAddress();
        user.setWalletAddress(null);
        userRepository.save(user);

        // Publier l'événement de déconnexion
        rabbitMQProducer.publishWalletDisconnected(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Wallet déconnecté avec succès");
        response.put("userId", userId);
        response.put("previousWallet", previousWallet);
        response.put("canDisconnect", true);

        return response;
    }

    /**
     * Valider si l'utilisateur peut déconnecter son wallet
     * Effectue toutes les vérifications SYNC
     */
    public Map<String, Object> validateWalletDisconnection(String userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("canDisconnect", true);
        result.put("blockers", new HashMap<String, Object>());

        Map<String, Object> blockers = (Map<String, Object>) result.get("blockers");

        try {
            // 1. Vérifier les properties actives (SYNC avec Listing Service)
            int activePropertiesCount = listingServiceClient.getActivePropertiesCount(userId);

            if (activePropertiesCount > 0) {
                result.put("canDisconnect", false);
                blockers.put("activeProperties", Map.of(
                        "count", activePropertiesCount,
                        "message", "Masquez vos " + activePropertiesCount + " property(s) active(s) d'abord"
                ));
            }

            // 2. Vérifier les réservations futures en tant qu'host (SYNC avec Booking Service)
            int futureBookingsAsHost = bookingServiceClient.getFutureBookingsAsHost(userId);

            if (futureBookingsAsHost > 0) {
                result.put("canDisconnect", false);
                blockers.put("futureBookingsAsHost", Map.of(
                        "count", futureBookingsAsHost,
                        "message", "Annulez votre " + futureBookingsAsHost + " réservation(s) future(s) en tant qu'hôte d'abord"
                ));
            }

            // 3. Vérifier les réservations actives en tant que client (SYNC avec Booking Service)
            int activeBookingsAsClient = bookingServiceClient.getActiveBookingsAsClient(userId);

            if (activeBookingsAsClient > 0) {
                result.put("canDisconnect", false);
                blockers.put("activeBookingsAsClient", Map.of(
                        "count", activeBookingsAsClient,
                        "message", "Annulez votre " + activeBookingsAsClient + " réservation(s) active(s) en tant que client d'abord"
                ));
            }

        } catch (Exception e) {
            result.put("canDisconnect", false);
            result.put("error", "Erreur lors de la validation: " + e.getMessage());
        }

        return result;
    }

    /**
     * Vérifier le statut du wallet de l'utilisateur
     */
    public Map<String, Object> getWalletStatus(String userId) {
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new UsernameNotFoundException("Utilisateur non trouvé");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("hasWallet", user.getWalletAddress() != null && !user.getWalletAddress().trim().isEmpty());
        response.put("walletAddress", user.getWalletAddress());

        if (user.getWalletAddress() != null) {
            // Vérifier si l'utilisateur peut déconnecter
            Map<String, Object> validation = validateWalletDisconnection(userId);
            response.put("canDisconnect", validation.get("canDisconnect"));
            response.put("disconnectionBlockers", validation.get("blockers"));
        }

        return response;
    }
}