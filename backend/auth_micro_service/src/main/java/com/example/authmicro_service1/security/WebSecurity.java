package com.example.authmicro_service1.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class WebSecurity {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {

        // Configuration du filtre d'authentification pour utiliser l'URL /users/login
        AuthenticationFilter authenticationFilter = new AuthenticationFilter(authenticationManager);
        authenticationFilter.setFilterProcessesUrl("/users/login");

        http
                // ✅ 1. Activation de la configuration CORS définie plus bas
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Désactivation CSRF (inutile pour les API Stateless avec JWT)
                .csrf(csrf -> csrf.disable())

                // 3. Gestion des autorisations d'URL
                .authorizeHttpRequests(auth -> auth
                        // Autoriser l'accès public au login et à l'inscription (POST)
                        .requestMatchers(HttpMethod.POST, "/users/login", "/users").permitAll()
                        // Autoriser les requêtes OPTIONS (CORS pre-flight) pour tout le monde
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Tout le reste nécessite une authentification
                        .anyRequest().authenticated()
                )

                // 4. Ajout des filtres personnalisés
                .addFilter(authenticationFilter)
                // Assurez-vous que vous avez bien la classe AuthorizationFilter, sinon commentez la ligne suivante
                .addFilter(new AuthorizationFilter(authenticationManager))

                // 5. Gestion de session Stateless (pas de cookies de session)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    /**
     * ✅ CONFIGURATION CORS SPÉCIFIQUE
     * C'est ici que l'on autorise http://localhost:3000
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Autoriser spécifiquement votre Frontend React
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Autoriser les méthodes HTTP courantes
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Autoriser tous les headers (Content-Type, Authorization, etc.)
        configuration.setAllowedHeaders(List.of("*"));

        // ⚠️ TRÈS IMPORTANT : Permet au frontend de lire le header "Authorization" et "user_id"
        // Sans ça, votre frontend ne pourra pas récupérer le token JWT après le login
        configuration.setExposedHeaders(Arrays.asList("Authorization", "user_id"));

        // Autoriser les cookies/credentials si besoin (optionnel selon votre architecture)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}