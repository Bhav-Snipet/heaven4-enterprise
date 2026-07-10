package com.heaven4.events;

import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * Base event for all Heaven4 domain and integration events.
 *
 * <p>Every event is immutable and contains a unique ID, timestamp,
 * source, and the actor who triggered it.
 */
@Getter
public abstract class BaseEvent {

    private final String eventId;
    private final String eventType;
    private final Instant timestamp;
    private final String source;
    private final String triggeredBy;

    protected BaseEvent(String eventType, String source, String triggeredBy) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.timestamp = Instant.now();
        this.source = source;
        this.triggeredBy = triggeredBy;
    }
}
