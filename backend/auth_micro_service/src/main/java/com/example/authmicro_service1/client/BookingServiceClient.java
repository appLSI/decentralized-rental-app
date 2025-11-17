package com.example.authmicro_service1.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

/**
 * Client REST pour communiquer avec le Booking Service (préparé pour future implémentation)
 */
@Service
public class BookingServiceClient {

    private final RestTemplate restTemplate;

    @Value("${booking.service.url:http://localhost:8083}")
    private String bookingServiceUrl;

    @Value("${booking.service.enabled:false}")
    private boolean bookingServiceEnabled;

    public BookingServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Vérifier si l'host a des réservations futures
     * GET /bookings/host/{userId}/future-count
     */
    public int getFutureBookingsAsHost(String userId) {
        if (!bookingServiceEnabled) {
            System.out.println("ℹ️ Booking Service non activé, skip vérification host bookings");
            return 0;
        }

        try {
            String url = bookingServiceUrl + "/bookings/host/" + userId + "/future-count";

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object count = response.getBody().get("count");
                if (count instanceof Integer) {
                    return (Integer) count;
                } else if (count instanceof Long) {
                    return ((Long) count).intValue();
                }
            }

            return 0;
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification des réservations host: " + e.getMessage());
            throw new RuntimeException("Impossible de vérifier les réservations. Service indisponible.");
        }
    }

    /**
     * Vérifier si le client a des réservations actives
     * GET /bookings/client/{userId}/active-count
     */
    public int getActiveBookingsAsClient(String userId) {
        if (!bookingServiceEnabled) {
            System.out.println("ℹ️ Booking Service non activé, skip vérification client bookings");
            return 0;
        }

        try {
            String url = bookingServiceUrl + "/bookings/client/" + userId + "/active-count";

            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object count = response.getBody().get("count");
                if (count instanceof Integer) {
                    return (Integer) count;
                } else if (count instanceof Long) {
                    return ((Long) count).intValue();
                }
            }

            return 0;
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification des réservations client: " + e.getMessage());
            throw new RuntimeException("Impossible de vérifier les réservations. Service indisponible.");
        }
    }
}