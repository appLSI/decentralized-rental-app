package ma.fstt.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import ma.fstt.gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.Collections;
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
            System.err.println("❌ RoleBasedAuthorizationFilter: Token manquant");
            return onError(exchange, "Token manquant", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        try {
            // Valider le token
            if (!jwtUtil.validateToken(token)) {
                System.err.println("❌ RoleBasedAuthorizationFilter: Token invalide");
                return onError(exchange, "Token invalide", HttpStatus.UNAUTHORIZED);
            }

            // ✅ Extraire les rôles du token en utilisant la méthode dédiée
            List<String> userRoles;
            try {
                userRoles = jwtUtil.getRolesFromToken(token);
                if (userRoles == null || userRoles.isEmpty()) {
                    System.err.println("❌ RoleBasedAuthorizationFilter: Aucun rôle trouvé dans le JWT");
                    Claims claims = jwtUtil.getAllClaims(token);
                    System.err.println("📋 Claims disponibles: " + claims.keySet());
                    return onError(exchange, "Aucun rôle trouvé dans le token", HttpStatus.FORBIDDEN);
                }
            } catch (JwtException e) {
                System.err.println("❌ RoleBasedAuthorizationFilter: Erreur lors de l'extraction des rôles: " + e.getMessage());
                return onError(exchange, "Erreur lors de l'extraction des rôles", HttpStatus.FORBIDDEN);
            }

            // ✅ Vérifier si l'utilisateur a au moins un des rôles requis
            // Chercher directement "ADMIN" (pas "ROLE_ADMIN")
            boolean hasRequiredRole = requiredRoles.stream()
                    .anyMatch(userRoles::contains);

            if (!hasRequiredRole) {
                System.err.println("❌ Accès refusé - Rôles requis: " + requiredRoles + " | Rôles utilisateur: " + userRoles);
                return onError(exchange, "Accès refusé - Rôle insuffisant", HttpStatus.FORBIDDEN);
            }

            System.out.println("✅ Autorisation accordée - Rôles requis: " + requiredRoles + " | Rôles utilisateur: " + userRoles);

            // ✅ CRITIQUE: Injecter le header X-Roles dans la requête
            // Les services backend ont besoin de ce header pour leurs contrôles d'autorisation
            String rolesString = String.join(",", userRoles);

            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(builder -> builder.header("X-Roles", rolesString))
                    .build();

            System.out.println("✅ Header X-Roles injecté: " + rolesString);

            // Transmettre la requête MODIFIÉE avec le header X-Roles
            return chain.filter(mutatedExchange);

        } catch (JwtException e) {
            System.err.println("❌ Erreur JWT lors de la vérification des rôles: " + e.getMessage());
            e.printStackTrace();
            return onError(exchange, "Token invalide ou expiré", HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue lors de la vérification des rôles: " + e.getMessage());
            e.printStackTrace();
            return onError(exchange, "Erreur d'autorisation", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        System.err.println("❌ RoleBasedAuthorizationFilter: " + message);
        return response.setComplete();
    }
}