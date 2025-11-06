package com.example.authmicro_service1.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Autoriser les origines frontend
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost",
                "http://localhost:3000",      // React
                "http://localhost:8082",
                "http://localhost:5173"       // Vite
        ));

        // ✅ Méthodes HTTP autorisées
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // ✅ Headers autorisés (IMPORTANT pour JWT)
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        // ✅ CRITIQUE : Exposer les headers personnalisés au frontend
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "user_id"
        ));

        // ✅ Autoriser l'envoi de credentials (cookies, auth)
        configuration.setAllowCredentials(true);

        // ✅ Durée de cache des requêtes préliminaires (OPTIONS)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}