package com.example.authmicro_service1.services.impl;

import com.example.authmicro_service1.Producer.RabbitMQProducer;
import com.example.authmicro_service1.entities.UserEntity;
import com.example.authmicro_service1.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * ✅ Service dédié à la gestion des wallets
 * Gère la logique métier de connexion/déconnexion des wallets
 */
@Service
public class WalletService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RabbitMQProducer rabbitMQProducer;

    @Autowired
    private RestTemplate restTemplate;

    // ✅ Regex pour valider une adresse Ethereum (0x suivi de 40 caractères hexadécimaux)
    private static final Pattern ETHEREUM_ADDRESS_PATTERN =
            Pattern.compile("^0x[a-fA-F0-9]{40}$");

    // URLs des autres microservices (à configurer dans application.properties)
    private static final String LISTING_SERVICE_URL = "http://listing-service:8081";
    private static final String BOOKING_SERVICE_URL = "http://booking-service:8083";

    /**
     * 🔌 Connecter un wallet à un utilisateur
     *
     * Validations:
     * 1. Format de l'adresse Ethereum valide ⚠️ DÉSACTIVÉE
     * 2. Utilisateur existe
     * 3. Wallet pas déjà utilisé par un autre utilisateur
     * 4. Vérification de propriété (currentUser = userId)
     *
     * @param userId ID de l'utilisateur
     * @param walletAddress Adresse du wallet (0x...)
     * @param currentUserEmail Email de l'utilisateur connecté
     * @throws IllegalArgumentException si les validations échouent
     */
    @Transactional
    public void connectWallet(String userId, String walletAddress, String currentUserEmail) {
        // ⚠️ VALIDATION DÉSACTIVÉE - Vous pouvez maintenant utiliser n'importe quelle adresse
        // Laissez cette ligne commentée pour réactiver la validation :
        // if (!isValidEthereumAddress(walletAddress)) {
        //     throw new IllegalArgumentException("Format d'adresse Ethereum invalide. Attendu: 0x suivi de 40 caractères hexadécimaux");
        // }

        // ✅ Validation minimale : l'adresse ne doit pas être vide
        if (walletAddress == null || walletAddress.trim().isEmpty()) {
            throw new IllegalArgumentException("L'adresse du wallet ne peut pas être vide");
        }

        // ✅ 2. Récupérer l'utilisateur
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }

        // ✅ 3. Vérifier la propriété
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new IllegalArgumentException("Vous ne pouvez connecter un wallet qu'à votre propre compte");
        }

        // ✅ 4. Vérifier l'unicité du wallet
        UserEntity existingWalletUser = userRepository.findByWalletAddress(walletAddress);
        if (existingWalletUser != null && !existingWalletUser.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Ce wallet est déjà utilisé par un autre compte");
        }

        // ✅ 5. Vérifier si l'utilisateur a déjà un wallet
        boolean isFirstConnection = (user.getWalletAddress() == null || user.getWalletAddress().trim().isEmpty());

        // ✅ 6. Mettre à jour le wallet
        String oldWalletAddress = user.getWalletAddress();
        user.setWalletAddress(walletAddress);
        userRepository.save(user);

        // ✅ 7. Publier l'événement approprié
        if (isFirstConnection) {
            // 🆕 Première connexion → WalletConnectedEvent
            rabbitMQProducer.publishWalletConnected(userId, walletAddress);
            System.out.println("✅ Wallet connecté pour la première fois: " + userId);
        } else {
            // 🔄 Changement de wallet → WalletUpdatedEvent
            rabbitMQProducer.publishWalletUpdated(userId, walletAddress, oldWalletAddress);
            System.out.println("✅ Wallet mis à jour: " + userId + " (ancien: " + oldWalletAddress + ")");
        }
    }

    /**
     * 🔓 Déconnecter le wallet d'un utilisateur
     *
     * Validations SYNCHRONES avant déconnexion:
     * 1. Pas de properties actives (ACTIVE status)
     * 2. Pas de réservations futures en tant que host
     * 3. Pas de réservations actives en tant que client
     *
     * @param userId ID de l'utilisateur
     * @param currentUserEmail Email de l'utilisateur connecté
     * @throws IllegalStateException si des contraintes métier bloquent la déconnexion
     */
    @Transactional
    public void disconnectWallet(String userId, String currentUserEmail) {
        // ✅ 1. Récupérer l'utilisateur
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }

        // ✅ 2. Vérifier la propriété
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new IllegalArgumentException("Vous ne pouvez déconnecter que votre propre wallet");
        }

        // ✅ 3. Vérifier qu'un wallet est connecté
        if (user.getWalletAddress() == null || user.getWalletAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("Aucun wallet n'est connecté à ce compte");
        }

        // ✅ 4. VÉRIFICATIONS MÉTIER SYNCHRONES

        // 🏠 4.1. Vérifier les properties actives
        try {
            String url = LISTING_SERVICE_URL + "/properties/owner/" + userId + "/active-count";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("count")) {
                int activePropertiesCount = (Integer) response.get("count");
                if (activePropertiesCount > 0) {
                    throw new IllegalStateException(
                            "Impossible de déconnecter le wallet : vous avez " + activePropertiesCount +
                                    " propriété(s) active(s). Masquez-les d'abord (statut HIDDEN)."
                    );
                }
            }
        } catch (IllegalStateException e) {
            throw e; // Propager l'erreur métier
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors de la vérification des properties actives: " + e.getMessage());
            // En cas d'erreur technique, on bloque par sécurité
            throw new IllegalStateException("Impossible de vérifier vos propriétés actives. Réessayez plus tard.");
        }

        // 📅 4.2. Vérifier les réservations futures en tant que HOST
        try {
            String url = BOOKING_SERVICE_URL + "/bookings/host/" + userId + "/future-count";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("count")) {
                int futureBookingsCount = (Integer) response.get("count");
                if (futureBookingsCount > 0) {
                    throw new IllegalStateException(
                            "Impossible de déconnecter le wallet : vous avez " + futureBookingsCount +
                                    " réservation(s) future(s) en tant qu'hôte. Annulez-les d'abord."
                    );
                }
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors de la vérification des réservations host: " + e.getMessage());
            throw new IllegalStateException("Impossible de vérifier vos réservations en tant qu'hôte. Réessayez plus tard.");
        }

        // 🧳 4.3. Vérifier les réservations actives en tant que CLIENT
        try {
            String url = BOOKING_SERVICE_URL + "/bookings/client/" + userId + "/active-count";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("count")) {
                int activeBookingsCount = (Integer) response.get("count");
                if (activeBookingsCount > 0) {
                    throw new IllegalStateException(
                            "Impossible de déconnecter le wallet : vous avez " + activeBookingsCount +
                                    " réservation(s) active(s) en tant que client. Annulez-les d'abord."
                    );
                }
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("⚠️ Erreur lors de la vérification des réservations client: " + e.getMessage());
            throw new IllegalStateException("Impossible de vérifier vos réservations en tant que client. Réessayez plus tard.");
        }

        // ✅ 5. Toutes les validations sont passées → Déconnecter le wallet
        String disconnectedWalletAddress = user.getWalletAddress();
        user.setWalletAddress(null);
        userRepository.save(user);

        // ✅ 6. Publier l'événement de déconnexion
        rabbitMQProducer.publishWalletDisconnected(userId, disconnectedWalletAddress);
        System.out.println("✅ Wallet déconnecté: " + userId + " (adresse: " + disconnectedWalletAddress + ")");
    }

    /**
     * 📊 Récupérer le statut du wallet d'un utilisateur
     *
     * @param userId ID de l'utilisateur
     * @return Map contenant { userId, walletAddress, exists }
     */
    public Map<String, Object> getWalletStatus(String userId) {
        UserEntity user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }

        Map<String, Object> status = new HashMap<>();
        status.put("userId", user.getUserId());
        status.put("walletAddress", user.getWalletAddress());
        status.put("exists", user.getWalletAddress() != null && !user.getWalletAddress().trim().isEmpty());

        return status;
    }

    /**
     * ✅ Valider le format d'une adresse Ethereum
     *
     * @param address Adresse à valider
     * @return true si valide, false sinon
     */
    private boolean isValidEthereumAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return false;
        }
        return ETHEREUM_ADDRESS_PATTERN.matcher(address.trim()).matches();
    }
}