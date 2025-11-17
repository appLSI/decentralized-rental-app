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

    // ✅ UTILISER LES MÊMES NOMS QUE LE LISTING SERVICE
    public static final String EXCHANGE_NAME = "user.exchange";
    public static final String USER_CREATED_QUEUE = "user.created.queue";
    public static final String USER_UPDATED_QUEUE = "user.updated.queue";
    public static final String USER_CREATED_ROUTING_KEY = "user.created";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    // Exchange property (pour écouter les événements property)
    public static final String PROPERTY_EXCHANGE = "property.exchange";
    public static final String PROPERTY_CREATED_QUEUE = "property.created.queue";
    public static final String PROPERTY_CREATED_ROUTING_KEY = "property.created";

    // Événements wallet
    public static final String WALLET_CONNECTED_QUEUE = "wallet.connected.queue";
    public static final String WALLET_DISCONNECTED_QUEUE = "wallet.disconnected.queue";
    public static final String WALLET_CONNECTED_ROUTING_KEY = "wallet.connected";
    public static final String WALLET_DISCONNECTED_ROUTING_KEY = "wallet.disconnected";

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_NAME);
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
    public TopicExchange propertyExchange() {
        return new TopicExchange(PROPERTY_EXCHANGE);
    }

    @Bean
    public Queue propertyCreatedQueue() {
        return new Queue(PROPERTY_CREATED_QUEUE, true);
    }

    @Bean
    public Binding propertyCreatedBinding() {
        return BindingBuilder
                .bind(propertyCreatedQueue())
                .to(propertyExchange())
                .with(PROPERTY_CREATED_ROUTING_KEY);
    }


    @Bean
    public Queue walletConnectedQueue() {
        return new Queue(WALLET_CONNECTED_QUEUE, true);
    }

    @Bean
    public Queue walletDisconnectedQueue() {
        return new Queue(WALLET_DISCONNECTED_QUEUE, true);
    }


    @Bean
    public Binding walletConnectedBinding(Queue walletConnectedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(walletConnectedQueue)
                .to(userExchange)
                .with(WALLET_CONNECTED_ROUTING_KEY);
    }

    @Bean
    public Binding walletDisconnectedBinding(Queue walletDisconnectedQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(walletDisconnectedQueue)
                .to(userExchange)
                .with(WALLET_DISCONNECTED_ROUTING_KEY);
    }






}