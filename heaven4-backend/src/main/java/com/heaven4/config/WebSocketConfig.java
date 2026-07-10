package com.heaven4.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for Heaven4 real-time features.
 *
 * <p>Used for:
 * <ul>
 *   <li>Live order status updates (Customer workspace)</li>
 *   <li>Kitchen queue real-time updates</li>
 *   <li>Employee notification delivery</li>
 *   <li>Manager dashboard live metrics</li>
 *   <li>Digital Twin table status updates</li>
 * </ul>
 *
 * <p>STOMP protocol over WebSocket with SockJS fallback.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Topics for broadcast messages (e.g. kitchen updates)
        registry.enableSimpleBroker("/topic", "/queue");
        // Application destination prefix for client-to-server messages
        registry.setApplicationDestinationPrefixes("/app");
        // User-specific destinations
        registry.setUserDestinationPrefix("/user");
    }
}
