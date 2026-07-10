package com.heaven4.events;

import lombok.Getter;

/**
 * Domain event — emitted within a bounded context (e.g., ORDER_PLACED, SESSION_STARTED).
 *
 * <p>Consumed by listeners in the same application to trigger cross-domain side effects
 * like timeline recording, notification sending, and dashboard updates.
 */
@Getter
public class DomainEvent extends BaseEvent {

    private final String entityType;
    private final Long entityId;
    private final String action;
    private final Object payload;

    public DomainEvent(String entityType, Long entityId, String action,
                       String source, String triggeredBy, Object payload) {
        super("DOMAIN_EVENT", source, triggeredBy);
        this.entityType = entityType;
        this.entityId = entityId;
        this.action = action;
        this.payload = payload;
    }

    public DomainEvent(String entityType, Long entityId, String action,
                       String source, String triggeredBy) {
        this(entityType, entityId, action, source, triggeredBy, null);
    }
}
