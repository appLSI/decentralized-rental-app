package ma.fstt.paymentservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration RabbitMQ pour les événements de paiement
 *
 * Architecture:
 * - 1 Exchange (Topic): payment.exchange
 * - 2 Queues: payment.confirmed.queue, payment.failed.queue
 * - 2 Bindings avec routing keys: payment.confirmed, payment.failed
 *
 * BookingService écoutera ces queues via @RabbitListener
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.failed}")
    private String failedRoutingKey;

    /**
     * Exchange principal pour les événements de paiement
     * Type: Topic (permet le pattern matching sur routing keys)
     */
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(exchange, true, false);
    }

    /**
     * Queue pour les paiements confirmés
     * Durable: true (survit aux redémarrages RabbitMQ)
     */
    @Bean
    public Queue paymentConfirmedQueue() {
        return QueueBuilder.durable("payment.confirmed.queue")
                .withArgument("x-message-ttl", 86400000) // 24h TTL
                .build();
    }

    /**
     * Queue pour les paiements échoués
     */
    @Bean
    public Queue paymentFailedQueue() {
        return QueueBuilder.durable("payment.failed.queue")
                .withArgument("x-message-ttl", 86400000) // 24h TTL
                .build();
    }

    /**
     * Binding: payment.confirmed.queue ← payment.confirmed
     */
    @Bean
    public Binding paymentConfirmedBinding(
            Queue paymentConfirmedQueue,
            TopicExchange paymentExchange
    ) {
        return BindingBuilder
                .bind(paymentConfirmedQueue)
                .to(paymentExchange)
                .with(confirmedRoutingKey);
    }

    /**
     * Binding: payment.failed.queue ← payment.failed
     */
    @Bean
    public Binding paymentFailedBinding(
            Queue paymentFailedQueue,
            TopicExchange paymentExchange
    ) {
        return BindingBuilder
                .bind(paymentFailedQueue)
                .to(paymentExchange)
                .with(failedRoutingKey);
    }

    /**
     * Converter JSON pour sérialiser/désérialiser les messages
     * Utilise Jackson pour convertir Map<String, Object> ↔ JSON
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate configuré avec le converter JSON
     */
    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            MessageConverter jsonMessageConverter
    ) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}