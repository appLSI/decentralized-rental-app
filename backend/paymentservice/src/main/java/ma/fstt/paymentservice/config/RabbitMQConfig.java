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
 * - 3 Queues:
 *   1. payment.booking-created.queue (écoute BookingService)
 *   2. payment.confirmed.queue (envoie vers BookingService)
 *   3. payment.failed.queue (envoie vers BookingService)
 *
 * Flow:
 * BookingService → booking.created → PaymentService (écoute)
 * PaymentService → payment.confirmed/failed → BookingService (écoute)
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
     * Exchange principal pour les événements
     * Type: Topic (permet le pattern matching sur routing keys)
     */
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(exchange, true, false);
    }

    // ========== NOUVEAU : Queue pour écouter booking.created ==========

    /**
     * Queue pour recevoir les événements de création de booking
     * PaymentService écoute cette queue pour démarrer le processus de paiement
     */
    @Bean
    public Queue bookingCreatedQueue() {
        return QueueBuilder.durable("payment.booking-created.queue")
                .withArgument("x-message-ttl", 86400000) // 24h TTL
                .build();
    }

    /**
     * Binding: payment.booking-created.queue ← booking.created
     */
    @Bean
    public Binding bookingCreatedBinding(
            Queue bookingCreatedQueue,
            TopicExchange paymentExchange
    ) {
        return BindingBuilder
                .bind(bookingCreatedQueue)
                .to(paymentExchange)
                .with("booking.created");  // ✅ Écoute les bookings créées
    }

    // ========== Queues pour envoyer les résultats de paiement ==========

    /**
     * Queue pour les paiements confirmés
     * Durable: true (survit aux redémarrages RabbitMQ)
     *
     * ✅ FIX: Ajout du DLX pour matcher BookingService
     */
    @Bean
    public Queue paymentConfirmedQueue() {
        return QueueBuilder.durable("payment.confirmed.queue")
                .withArgument("x-message-ttl", 86400000) // 24h TTL
                .withArgument("x-dead-letter-exchange", "rental.dlx")  // ✅ AJOUTÉ !
                .withArgument("x-dead-letter-routing-key", "payment.confirmed.dead")  // ✅ AJOUTÉ !
                .build();
    }

    /**
     * Queue pour les paiements échoués
     *
     * ✅ FIX: Ajout du DLX pour matcher BookingService
     */
    @Bean
    public Queue paymentFailedQueue() {
        return QueueBuilder.durable("payment.failed.queue")
                .withArgument("x-message-ttl", 86400000) // 24h TTL
                .withArgument("x-dead-letter-exchange", "rental.dlx")  // ✅ AJOUTÉ !
                .withArgument("x-dead-letter-routing-key", "payment.failed.dead")  // ✅ AJOUTÉ !
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