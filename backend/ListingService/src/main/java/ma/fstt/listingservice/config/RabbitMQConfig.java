package ma.fstt.listingservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // User Exchange (pour recevoir les événements utilisateur)
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String USER_CREATED_QUEUE = "user.created.queue";
    public static final String USER_UPDATED_QUEUE = "user.updated.queue";
    public static final String USER_CREATED_ROUTING_KEY = "user.created";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    // Wallet Events
    public static final String WALLET_CONNECTED_QUEUE = "wallet.connected.queue";
    public static final String WALLET_DISCONNECTED_QUEUE = "wallet.disconnected.queue";
    public static final String WALLET_CONNECTED_ROUTING_KEY = "wallet.connected";
    public static final String WALLET_DISCONNECTED_ROUTING_KEY = "wallet.disconnected";

    // Property Exchange (pour publier les événements property)
    public static final String PROPERTY_EXCHANGE = "property.exchange";
    public static final String PROPERTY_CREATED_QUEUE = "property.created.queue";
    public static final String PROPERTY_VALIDATED_QUEUE = "property.validated.queue";
    public static final String PROPERTY_HIDDEN_QUEUE = "property.hidden.queue";
    public static final String PROPERTY_DELETED_QUEUE = "property.deleted.queue";
    public static final String PROPERTY_CREATED_ROUTING_KEY = "property.created";
    public static final String PROPERTY_VALIDATED_ROUTING_KEY = "property.validated";
    public static final String PROPERTY_HIDDEN_ROUTING_KEY = "property.hidden";
    public static final String PROPERTY_DELETED_ROUTING_KEY = "property.deleted";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange propertyExchange() {
        return new TopicExchange(PROPERTY_EXCHANGE);
    }

    // User Queues
    @Bean
    public Queue userCreatedQueue() {
        return new Queue(USER_CREATED_QUEUE, true);
    }

    @Bean
    public Queue userUpdatedQueue() {
        return new Queue(USER_UPDATED_QUEUE, true);
    }

    // Wallet Queues
    @Bean
    public Queue walletConnectedQueue() {
        return new Queue(WALLET_CONNECTED_QUEUE, true);
    }

    @Bean
    public Queue walletDisconnectedQueue() {
        return new Queue(WALLET_DISCONNECTED_QUEUE, true);
    }

    // Property Queues
    @Bean
    public Queue propertyCreatedQueue() {
        return new Queue(PROPERTY_CREATED_QUEUE, true);
    }

    @Bean
    public Queue propertyValidatedQueue() {
        return new Queue(PROPERTY_VALIDATED_QUEUE, true);
    }

    @Bean
    public Queue propertyHiddenQueue() {
        return new Queue(PROPERTY_HIDDEN_QUEUE, true);
    }

    @Bean
    public Queue propertyDeletedQueue() {
        return new Queue(PROPERTY_DELETED_QUEUE, true);
    }

    // User Bindings
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

    // Wallet Bindings
    @Bean
    public Binding walletConnectedBinding() {
        return BindingBuilder
                .bind(walletConnectedQueue())
                .to(userExchange())
                .with(WALLET_CONNECTED_ROUTING_KEY);
    }

    @Bean
    public Binding walletDisconnectedBinding() {
        return BindingBuilder
                .bind(walletDisconnectedQueue())
                .to(userExchange())
                .with(WALLET_DISCONNECTED_ROUTING_KEY);
    }

    // Property Bindings
    @Bean
    public Binding propertyCreatedBinding() {
        return BindingBuilder
                .bind(propertyCreatedQueue())
                .to(propertyExchange())
                .with(PROPERTY_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding propertyValidatedBinding() {
        return BindingBuilder
                .bind(propertyValidatedQueue())
                .to(propertyExchange())
                .with(PROPERTY_VALIDATED_ROUTING_KEY);
    }

    @Bean
    public Binding propertyHiddenBinding() {
        return BindingBuilder
                .bind(propertyHiddenQueue())
                .to(propertyExchange())
                .with(PROPERTY_HIDDEN_ROUTING_KEY);
    }

    @Bean
    public Binding propertyDeletedBinding() {
        return BindingBuilder
                .bind(propertyDeletedQueue())
                .to(propertyExchange())
                .with(PROPERTY_DELETED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}