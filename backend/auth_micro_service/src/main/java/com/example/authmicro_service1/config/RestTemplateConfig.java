package com.example.authmicro_service1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * ✅ Configuration pour les appels REST synchrones vers d'autres microservices
 *
 * RestTemplate est utilisé pour les validations métier lors de la déconnexion du wallet:
 * - Vérifier les properties actives (Listing Service)
 * - Vérifier les réservations futures/actives (Booking Service)
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}