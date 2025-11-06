package ma.fstt.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour vérifier le statut du Gateway
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "API Gateway");
        health.put("timestamp", LocalDateTime.now());
        health.put("version", "1.0.0");

        return ResponseEntity.ok(health);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "Real Estate Gateway");
        info.put("description", "API Gateway pour la plateforme de location immobilière");
        info.put("version", "1.0.0");
        info.put("timestamp", LocalDateTime.now());

        Map<String, String> services = new HashMap<>();
        services.put("auth-service", "Service d'authentification");
        services.put("listing-service", "Service de gestion des propriétés");

        info.put("services", services);

        return ResponseEntity.ok(info);
    }
}