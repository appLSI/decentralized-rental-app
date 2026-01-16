package ma.fstt.bookingservice.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ✅ Configuration Feign pour les appels inter-services
 * Configure le niveau de logging et d'autres paramètres Feign
 */
@Configuration
public class FeignConfig {

    /**
     * Active les logs Feign pour debugging
     * FULL = Log headers, body, metadata pour toutes les requêtes/réponses
     */
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
}