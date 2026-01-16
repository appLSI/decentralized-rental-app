package ma.fstt.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        org.springframework.web.cors.CorsConfiguration corsConfig = new org.springframework.web.cors.CorsConfiguration();

        // ========== APRÈS (SÉCURISÉ) ==========
        // Remplacer "*" par des origines spécifiques pour permettre les credentials
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",           // React dev
                "http://localhost:5173"  ,        // Vite dev
                "http://aa246fc51bf7244c5b132e933e81cb0f-1780957586.eu-west-3.elb.amazonaws.com"
        ));

        // Autoriser les credentials - ✅ OK maintenant (pas de conflit)
        corsConfig.setAllowCredentials(true);

        // Autoriser les méthodes HTTP
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Autoriser les headers spécifiques (plus sécurisé que "*")
        corsConfig.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With"
        ));

        // Exposer certains headers
        corsConfig.setExposedHeaders(Arrays.asList(
                "Authorization",
                "X-User-Id",
                "X-Username"
        ));

        // Durée de cache pour les requêtes preflight
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}