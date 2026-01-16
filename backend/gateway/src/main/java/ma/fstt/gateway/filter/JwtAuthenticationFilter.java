package ma.fstt.gateway.filter;

import io.jsonwebtoken.*;
import ma.fstt.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GatewayFilter {

    @Autowired
    private JwtUtil jwtUtil;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/auth/users",
            "/api/auth/users/login",
            "/api/auth/users/verify-otp",
            "/api/auth/users/resend-otp",
            "/api/auth/users/forgot-password",
            "/api/auth/users/reset-password"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith)) {
            return chain.filter(exchange);
        }

        if (!request.getHeaders().containsKey(AUTHORIZATION_HEADER)) {
            return onError(exchange, "Token d'autorisation manquant", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().getFirst(AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return onError(exchange, "Format du token invalide. Utilisez 'Bearer <token>'", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        try {
            if (!jwtUtil.validateToken(token)) {
                return onError(exchange, "Token expiré ou invalide", HttpStatus.UNAUTHORIZED);
            }

            // ✅ FIX: userId est un String UUID, pas un Long !
            String userId = jwtUtil.getUserIdFromToken(token);
            String username = jwtUtil.getUsernameFromToken(token);
            List<String> roles = jwtUtil.getRolesFromToken(token);
            List<String> types = jwtUtil.getTypesFromToken(token);

            // ✅ Ajouter les informations dans les headers
            ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId)  // ✅ String, pas Long
                    .header("X-Username", username)
                    .header("X-Roles", String.join(",", roles))  // ✅ AJOUTÉ: Header pour les endpoints admin
                    .header("X-User-Roles", String.join(",", roles))
                    .header("X-User-Types", String.join(",", types))
                    .build();

            System.out.println("✅ Token validé avec succès");
            System.out.println("✅ Token validé pour l'utilisateur: " + username +
                    " | ID: " + userId +
                    " | Roles: " + roles +
                    " | Types: " + types);

            return chain.filter(exchange.mutate().request(modifiedRequest).build());

        } catch (ExpiredJwtException e) {
            System.err.println("❌ Token expiré: " + e.getMessage());
            return onError(exchange, "Token expiré. Veuillez vous reconnecter", HttpStatus.UNAUTHORIZED);

        } catch (UnsupportedJwtException e) {
            System.err.println("❌ Token non supporté: " + e.getMessage());
            return onError(exchange, "Format de token non supporté", HttpStatus.BAD_REQUEST);

        } catch (MalformedJwtException e) {
            System.err.println("❌ Token malformé: " + e.getMessage());
            return onError(exchange, "Token malformé ou corrompu", HttpStatus.BAD_REQUEST);

        } catch (SignatureException e) {
            System.err.println("❌ Signature invalide: " + e.getMessage());
            return onError(exchange, "Signature du token invalide", HttpStatus.UNAUTHORIZED);

        } catch (IllegalArgumentException e) {
            System.err.println("❌ Argument invalide: " + e.getMessage());
            return onError(exchange, "Token invalide ou vide", HttpStatus.BAD_REQUEST);

        } catch (JwtException e) {
            System.err.println("❌ Erreur JWT générique: " + e.getMessage());
            return onError(exchange, "Erreur lors du traitement du token", HttpStatus.UNAUTHORIZED);

        } catch (Exception e) {
            System.err.println("❌ Erreur inattendue: " + e.getMessage());
            e.printStackTrace();
            return onError(exchange, "Erreur interne lors de la validation", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        String errorResponse = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                java.time.LocalDateTime.now().toString(),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                message,
                exchange.getRequest().getURI().getPath()
        );

        System.err.println("❌ Erreur Gateway [" + httpStatus + "]: " + message +
                " | Path: " + exchange.getRequest().getURI().getPath());

        return response.writeWith(Mono.just(
                response.bufferFactory().wrap(errorResponse.getBytes(StandardCharsets.UTF_8))
        ));
    }
}