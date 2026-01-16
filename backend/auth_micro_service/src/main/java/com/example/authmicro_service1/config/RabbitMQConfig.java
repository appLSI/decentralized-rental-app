package com.example.authmicro_service1.config;

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

    // Exchange principal
    public static final String EXCHANGE_NAME = "user.exchange";

    // ✅ Queues et routing keys existantes
    public static final String USER_CREATED_QUEUE = "user.created.queue";
    public static final String USER_UPDATED_QUEUE = "user.updated.queue";
    public static final String USER_CREATED_ROUTING_KEY = "user.created";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    // ========== NOUVELLE QUEUE USER TYPE ==========
    public static final String USER_TYPE_UPGRADED_QUEUE = "user.type.upgraded.queue";
    public static final String USER_TYPE_UPGRADED_ROUTING_KEY = "user.type.upgraded";

    // ✅ NOUVELLES QUEUES pour les événements wallet
    public static final String WALLET_CONNECTED_QUEUE = "user.wallet.connected.queue";
    public static final String WALLET_UPDATED_QUEUE = "user.wallet.updated.queue";
    public static final String WALLET_DISCONNECTED_QUEUE = "user.wallet.disconnected.queue";

    public static final String WALLET_CONNECTED_ROUTING_KEY = "user.wallet.connected";
    public static final String WALLET_UPDATED_ROUTING_KEY = "user.wallet.updated";
    public static final String WALLET_DISCONNECTED_ROUTING_KEY = "user.wallet.disconnected";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // ========== QUEUES EXISTANTES ==========

    @Bean
    public Queue userCreatedQueue() {
        return new Queue(USER_CREATED_QUEUE, true);
    }

    @Bean
    public Queue userUpdatedQueue() {
        return new Queue(USER_UPDATED_QUEUE, true);
    }

    @Bean
    public Binding userCreatedBinding(Queue userCreatedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userCreatedQueue)
                .to(userExchange)
                .with(USER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding userUpdatedBinding(Queue userUpdatedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userUpdatedQueue)
                .to(userExchange)
                .with(USER_UPDATED_ROUTING_KEY);
    }

    // ========== NOUVELLES QUEUES WALLET ==========

    /**
     * ✅ Queue pour les événements de connexion de wallet
     * Écoutée par: Listing Service, Booking Service, Payment Service
     */
    @Bean
    public Queue walletConnectedQueue() {
        return new Queue(WALLET_CONNECTED_QUEUE, true);
    }

    @Bean
    public Binding walletConnectedBinding(Queue walletConnectedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(walletConnectedQueue)
                .to(userExchange)
                .with(WALLET_CONNECTED_ROUTING_KEY);
    }

    /**
     * ✅ Queue pour les événements de mise à jour de wallet
     * Écoutée par: Listing Service, Booking Service, Payment Service
     */
    @Bean
    public Queue walletUpdatedQueue() {
        return new Queue(WALLET_UPDATED_QUEUE, true);
    }

    @Bean
    public Binding walletUpdatedBinding(Queue walletUpdatedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(walletUpdatedQueue)
                .to(userExchange)
                .with(WALLET_UPDATED_ROUTING_KEY);
    }

    /**
     * ✅ Queue pour les événements de déconnexion de wallet
     * Écoutée par: Listing Service, Booking Service, Payment Service
     */
    @Bean
    public Queue walletDisconnectedQueue() {
        return new Queue(WALLET_DISCONNECTED_QUEUE, true);
    }

    @Bean
    public Binding walletDisconnectedBinding(Queue walletDisconnectedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(walletDisconnectedQueue)
                .to(userExchange)
                .with(WALLET_DISCONNECTED_ROUTING_KEY);
    }

    // ========== CONFIGURATION GÉNÉRALE ==========

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public Queue userTypeUpgradedQueue() {
        return new Queue(USER_TYPE_UPGRADED_QUEUE, true);
    }

    @Bean
    public Binding userTypeUpgradedBinding(Queue userTypeUpgradedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userTypeUpgradedQueue)
                .to(userExchange)
                .with(USER_TYPE_UPGRADED_ROUTING_KEY);
    }
}