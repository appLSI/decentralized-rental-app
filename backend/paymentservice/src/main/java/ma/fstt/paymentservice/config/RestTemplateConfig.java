package ma.fstt.paymentservice.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration pour RestTemplate
 *
 * ✅ CE FICHIER EST OBLIGATOIRE
 * Sans ce fichier → Erreur: "Could not autowire. No beans of 'RestTemplate' type found"
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Bean RestTemplate avec configuration timeout
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
}