package com.heaven4.events;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Central event publisher for all Heaven4 events.
 *
 * <p>All domain services must publish events through this component.
 * Never use ApplicationEventPublisher directly — always use this wrapper
 * so we can add logging, metrics, and future message broker integration.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HeavenEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * Publishes a domain event to all registered listeners.
     */
    public void publish(DomainEvent event) {
        log.debug("Publishing domain event [{}] for entity [{}:{}] — action: {}",
                event.getEventId(), event.getEntityType(), event.getEntityId(), event.getAction());
        applicationEventPublisher.publishEvent(event);
    }

    /**
     * Publishes any base event.
     */
    public void publish(BaseEvent event) {
        log.debug("Publishing event [{}] of type [{}]", event.getEventId(), event.getEventType());
        applicationEventPublisher.publishEvent(event);
    }
}
