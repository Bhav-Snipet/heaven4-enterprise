package com.heaven4.engines.timeline;

import java.util.List;

/**
 * Timeline Engine — every important business object has a timeline.
 *
 * <p>Universal timeline: Order → Payment → Customer → Employee → Complaint →
 * Membership → Admin actions → Configuration changes → Reports.
 */
public interface TimelineEngine {

    /** Records a timeline event for any business entity. */
    Long recordEvent(String entityType, Long entityId, String action,
                     String description, String performedBy, String metadata);

    /** Returns the complete timeline for a specific entity. */
    List<?> getTimeline(String entityType, Long entityId);

    /** Returns a filtered timeline across all entities (for admin/owner). */
    List<?> getGlobalTimeline(String filterAction, String filterEntityType,
                              int page, int size);

    /** Returns timeline events for a specific dining session (all related activity). */
    List<?> getSessionTimeline(Long sessionId);
}
