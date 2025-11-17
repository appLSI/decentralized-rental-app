package ma.fstt.gateway.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();

        // Autoriser toutes les origines (à restreindre en production)
        corsConfig.setAllowedOriginPatterns(Collections.singletonList("*"));

        // Autoriser les méthodes HTTP
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Autoriser les headers
        corsConfig.setAllowedHeaders(Arrays.asList("*"));

        // Autoriser les credentials
        corsConfig.setAllowCredentials(true);

        // Exposer certains headers
        corsConfig.setExposedHeaders(Arrays.asList("Authorization", "user_id"));

        // Durée de cache pour les requêtes preflight
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}