package ma.fstt.gateway.filter;



import ma.fstt.gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * Filtre pour vérifier les rôles requis pour accéder à une route
 */
public class RoleBasedAuthorizationFilter implements GatewayFilter {

    private final JwtUtil jwtUtil;
    private final List<String> requiredRoles;

    public RoleBasedAuthorizationFilter(JwtUtil jwtUtil, String... roles) {
        this.jwtUtil = jwtUtil;
        this.requiredRoles = Arrays.asList(roles);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // Extraire le token
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, "Token manquant", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            // Vérifier si l'utilisateur a au moins un des rôles requis
            boolean hasRequiredRole = requiredRoles.stream()
                    .anyMatch(role -> jwtUtil.hasRole(token, role));

            if (!hasRequiredRole) {
                System.err.println("❌ Accès refusé - Rôles requis: " + requiredRoles);
                return onError(exchange, "Accès refusé - Rôle insuffisant", HttpStatus.FORBIDDEN);
            }

            System.out.println("✅ Autorisation accordée pour les rôles: " + requiredRoles);
            return chain.filter(exchange);

        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la vérification des rôles: " + e.getMessage());
            return onError(exchange, "Erreur d'autorisation", HttpStatus.FORBIDDEN);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        System.err.println("❌ " + message);
        return response.setComplete();
    }
}