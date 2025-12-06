package ma.fstt.bookingservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key.cancelled}")
    private String cancelledRoutingKey;

    @Value("${rabbitmq.routing-key.confirmed}")
    private String confirmedRoutingKey;

    // Nouvelle Routing Key pour l'expiration
    @Value("${rabbitmq.routing-key.expired:booking.expired}")
    private String expiredRoutingKey;

    @Bean
    public TopicExchange bookingExchange() {
        return new TopicExchange(exchange);
    }

    // --- Queues ---

    @Bean
    public Queue bookingCancelledQueue() {
        return new Queue("booking.cancelled.queue", true);
    }

    @Bean
    public Queue bookingConfirmedQueue() {
        return new Queue("booking.confirmed.queue", true);
    }

    @Bean
    public Queue bookingExpiredQueue() {
        return new Queue("booking.expired.queue", true);
    }

    // --- Bindings ---

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

    // --- Converters ---

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}