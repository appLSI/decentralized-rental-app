package com.example.authmicro_service1.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
public class ListingServiceClient {

    private final RestTemplate restTemplate;

    // ✅ FIX: Appeler le service directement, pas via le Gateway
    @Value("${listing.service.url:http://listing-service:8081}")
    private String listingServiceUrl;

    public ListingServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Vérifier si l'owner a des properties actives
     */
    public int getActivePropertiesCount(String userId) {
        try {
            // ✅ FIX: Pas de /api/listings, juste /properties
            String url = listingServiceUrl + "/properties/owner/" + userId + "/active-count";

            System.out.println("🔍 Calling Listing Service: " + url);

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object count = response.getBody().get("count");
                if (count instanceof Integer) {
                    return (Integer) count;
                } else if (count instanceof Long) {
                    return ((Long) count).intValue();
                } else if (count instanceof String) {
                    return Integer.parseInt((String) count);
                }
            }

            return 0;
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification des properties actives: " + e.getMessage());
            e.printStackTrace(); // ✅ Afficher la stack trace complète
            throw new RuntimeException("Impossible de vérifier les properties actives. Service indisponible.");
        }
    }
}