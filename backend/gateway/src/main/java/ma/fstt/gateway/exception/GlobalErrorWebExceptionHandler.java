package ma.fstt.gateway.exception;

import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Gestionnaire global des exceptions pour le Gateway
 * Capture toutes les exceptions non gérées et retourne des réponses JSON formatées
 */
@Component
@Order(-2) // Priorité élevée pour intercepter avant le DefaultErrorWebExceptionHandler
public class GlobalErrorWebExceptionHandler implements ErrorWebExceptionHandler {

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        HttpStatus status;
        String message;

        // Déterminer le type d'erreur et le statut HTTP approprié
        if (ex instanceof ResponseStatusException) {
            ResponseStatusException rse = (ResponseStatusException) ex;
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            message = rse.getReason() != null ? rse.getReason() : "Erreur de traitement";
        } else if (ex instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
            message = "Requête invalide: " + ex.getMessage();
        } else if (ex instanceof io.jsonwebtoken.JwtException) {
            status = HttpStatus.UNAUTHORIZED;
            message = "Erreur d'authentification JWT: " + ex.getMessage();
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Erreur interne du serveur";

            // Logger l'exception complète pour le débogage
            System.err.println("❌ Erreur non gérée dans le Gateway:");
            ex.printStackTrace();
        }

        // Construire la réponse JSON
        String errorResponse = buildErrorResponse(
                status,
                message,
                exchange.getRequest().getURI().getPath()
        );

        // Configurer la réponse
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        DataBuffer buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(errorResponse.getBytes(StandardCharsets.UTF_8));

        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    /**
     * Construit une réponse d'erreur JSON formatée
     */
    private String buildErrorResponse(HttpStatus status, String message, String path) {
        return String.format(
                "{" +
                        "\"timestamp\":\"%s\"," +
                        "\"status\":%d," +
                        "\"error\":\"%s\"," +
                        "\"message\":\"%s\"," +
                        "\"path\":\"%s\"" +
                        "}",
                LocalDateTime.now().toString(),
                status.value(),
                status.getReasonPhrase(),
                message.replace("\"", "\\\""), // Échapper les guillemets
                path
        );
    }
}