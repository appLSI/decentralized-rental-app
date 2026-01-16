package ma.fstt.bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.cancelled}")
    private String cancelledRoutingKey;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    @Value("${rabbitmq.routing-key.expired:booking.expired}")
    private String expiredRoutingKey;

    // Exchange pour les événements utilisateur
    public static final String USER_EXCHANGE = "user.exchange";

    // Queues pour la synchronisation des utilisateurs
    public static final String USER_CREATED_QUEUE = "user.created.queue";
    public static final String USER_UPDATED_QUEUE = "user.updated.queue";

    // Routing keys
    public static final String USER_CREATED_ROUTING_KEY = "user.created";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public Queue userCreatedQueue() {
        return new Queue(USER_CREATED_QUEUE, true);
    }

    @Bean
    public Queue userUpdatedQueue() {
        return new Queue(USER_UPDATED_QUEUE, true);
    }

    @Bean
    public Binding userCreatedBinding() {
        return BindingBuilder
                .bind(userCreatedQueue())
                .to(userExchange())
                .with(USER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding userUpdatedBinding() {
        return BindingBuilder
                .bind(userUpdatedQueue())
                .to(userExchange())
                .with(USER_UPDATED_ROUTING_KEY);
    }

    // ========== EXCHANGES ==========

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(exchange);
    }

    // ========== Dead Letter Exchange ==========

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange("rental.dlx");
    }

    @Bean
    public Queue deadLetterQueue() {
        return new Queue("rental.dlq", true);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder
                .bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with("*.dead");
    }

    // ========== Queues avec DLX ==========

    @Bean
    public Queue bookingCancelledQueue() {
        return QueueBuilder.durable("booking.cancelled.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.cancelled.dead")
                .build();
    }

    @Bean
    public Queue bookingConfirmedQueue() {
        return QueueBuilder.durable("booking.confirmed.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.confirmed.dead")
                .withArgument("x-message-ttl", 300000)
                .build();
    }

    @Bean
    public Queue bookingExpiredQueue() {
        return QueueBuilder.durable("booking.expired.queue")
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "booking.expired.dead")
                .build();
    }

    // ========== BINDINGS ==========

    @Bean
    public Binding bookingCancelledBinding() {
        return BindingBuilder
                .bind(bookingCancelledQueue())
                .to(bookingExchange())
                .with(cancelledRoutingKey);
    }

    @Bean
    public Binding bookingConfirmedBinding() {
        return BindingBuilder
                .bind(bookingConfirmedQueue())
                .to(bookingExchange())
                .with(confirmedRoutingKey);
    }

    @Bean
    public Binding bookingExpiredBinding() {
        return BindingBuilder
                .bind(bookingExpiredQueue())
                .to(bookingExchange())
                .with(expiredRoutingKey);
    }

    // ========== PAYMENT QUEUES ==========

    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String PAYMENT_CONFIRMED_QUEUE = "payment.confirmed.queue";
    public static final String PAYMENT_FAILED_QUEUE = "payment.failed.queue";
    public static final String PAYMENT_CONFIRMED_ROUTING_KEY = "payment.confirmed";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";

    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public Queue paymentConfirmedQueue() {
        return QueueBuilder.durable(PAYMENT_CONFIRMED_QUEUE)
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "payment.confirmed.dead")
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    @Bean
    public Queue paymentFailedQueue() {
        return QueueBuilder.durable(PAYMENT_FAILED_QUEUE)
                .withArgument("x-dead-letter-exchange", "rental.dlx")
                .withArgument("x-dead-letter-routing-key", "payment.failed.dead")
                .withArgument("x-message-ttl", 86400000)
                .build();
    }

    @Bean
    public Binding paymentConfirmedBinding() {
        return BindingBuilder
                .bind(paymentConfirmedQueue())
                .to(paymentExchange())
                .with(PAYMENT_CONFIRMED_ROUTING_KEY);
    }

    @Bean
    public Binding paymentFailedBinding() {
        return BindingBuilder
                .bind(paymentFailedQueue())
                .to(paymentExchange())
                .with(PAYMENT_FAILED_ROUTING_KEY);
    }

    // ========== CONVERTERS (LA PARTIE CORRIGÉE) ==========

    // ✅ UNE SEULE DÉFINITION DE CE BEAN (CELLE AVEC JAVATIMEMODULE)
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Gestion des LocalDate
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}