package com.heaven4.engines.health;

import java.util.Map;

/**
 * Health Engine — monitors business and technical health (Owner/Admin only).
 *
 * <p>Monitors: Database, API, WebSocket, OTP service, Scheduler,
 * Payment Gateway, Storage, Memory, CPU, Disk, Background Jobs.
 */
public interface HealthEngine {

    /** Returns the overall system health status. */
    Map<String, Object> getSystemHealth();

    /** Returns health status of a specific component. */
    Map<String, Object> getComponentHealth(String componentName);

    /** Returns business health metrics (queue sizes, response times, error rates). */
    Map<String, Object> getBusinessHealth(Long branchId);

    /** Returns a list of all health check components and their current status. */
    java.util.List<?> getAllComponentStatuses();
}
