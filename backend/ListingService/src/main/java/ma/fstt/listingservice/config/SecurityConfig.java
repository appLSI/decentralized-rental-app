package ma.fstt.listingservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Désactiver CSRF pour API REST
                .csrf(csrf -> csrf.disable())

                // ✅ Configuration des autorisations
                .authorizeHttpRequests(auth -> auth
                        // ========== ROUTES PUBLIQUES (Pas d'authentification) ==========

                        // Properties - Lecture publique
                        .requestMatchers("/properties").permitAll()                    // GET all properties
                        .requestMatchers("/properties/{id}").permitAll()               // GET property by ID
                        .requestMatchers("/properties/{id}/public").permitAll()        // GET public details
                        .requestMatchers("/properties/search").permitAll()             // Search properties
                        .requestMatchers("/properties/nearby").permitAll()             // Nearby properties
                        .requestMatchers("/properties/owner/{ownerId}/active-count").permitAll() // Active count
                        .requestMatchers("/properties/owner/{ownerId}/property-ids").permitAll() // Property IDs for host dashboard

                        // ✅ NEW: Wallet address endpoint (for Payment Service)
                        .requestMatchers(HttpMethod.GET, "/properties/*/wallet-address").permitAll() // Get wallet for payment


                        // Characteristics - Lecture publique
                        .requestMatchers("/characteristics").permitAll()               // GET all characteristics
                        .requestMatchers("/characteristics/{id}").permitAll()          // GET characteristic by ID

                        // Type Caracteristiques - Lecture publique
                        .requestMatchers("/type-caracteristiques").permitAll()         // GET all types
                        .requestMatchers("/type-caracteristiques/{id}").permitAll()    // GET type by ID

                        // ✅ Owners - Vérification publique + Protected par Gateway
                        .requestMatchers("/owners/check/{userId}").permitAll()         // Check owner status (public)
                        .requestMatchers("/owners/{userId}").permitAll()               // Get owner (JWT via Gateway)
                        .requestMatchers("/owners").permitAll()                        // Get all owners (ADMIN via Gateway)

                        // Properties - Admin actions (Protected par RBAC Gateway)
                        .requestMatchers(HttpMethod.PATCH, "/properties/*/validate").permitAll()
                        .requestMatchers(HttpMethod.POST, "/properties/*/reject").permitAll()
                        .requestMatchers(HttpMethod.GET, "/properties/pending").permitAll()

                        // Properties - Owner actions (Protected par JWT Gateway)
                        .requestMatchers(HttpMethod.POST, "/properties/*/submit").permitAll()
                        .requestMatchers("/properties/my-properties").permitAll()

                        // ========== IMAGES - UPLOAD ET GESTION ==========
                        .requestMatchers(HttpMethod.POST, "/properties/*/images").permitAll()    // Upload images
                        .requestMatchers(HttpMethod.DELETE, "/properties/*/images").permitAll()  // Delete images
                        .requestMatchers(HttpMethod.GET, "/properties/*/images").permitAll()     // Get images

                        // ========== COUNT ==========
                        .requestMatchers("/properties/owner/*/count").permitAll()                // Count properties by owner


                        // ========== ROUTES PROTÉGÉES (Authentification JWT requise) ==========
                        // Toutes les autres routes nécessitent authentification
                        .anyRequest().authenticated()
                )

                // ✅ Désactiver HTTP Basic (pas besoin pour service-to-service via Gateway)
                .httpBasic(basic -> basic.disable())

                // ✅ Session stateless pour API REST
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}