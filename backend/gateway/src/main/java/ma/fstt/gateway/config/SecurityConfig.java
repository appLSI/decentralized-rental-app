package ma.fstt.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // ✅ Désactiver CORS (on utilise CorsConfig.java)
                .cors(ServerHttpSecurity.CorsSpec::disable)

                // ✅ Désactiver CSRF pour les APIs REST
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // ✅ IMPORTANT: Désactiver toute la sécurité Spring Security
                // Le JWT sera géré par JwtAuthenticationFilter dans les routes
                .authorizeExchange(exchange -> exchange
                        .anyExchange().permitAll()  // ← TOUT est permis!
                )

                // Désactiver HTTP Basic et Form Login
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)

                .build();
    }
}