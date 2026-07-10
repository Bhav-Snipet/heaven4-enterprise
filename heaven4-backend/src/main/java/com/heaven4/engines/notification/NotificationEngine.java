package com.heaven4.engines.notification;

/**
 * Notification Engine — manages the Business Notification Center.
 *
 * <p>Every notification contains: priority, category, deep link, expiry,
 * related entity, read state, action button, delivery channel, and audit trail.
 */
public interface NotificationEngine {

    /** Sends a notification to a specific user. */
    Long notify(Long userId, String title, String message, String category,
                String priority, String deepLink, Long referenceId, String referenceType);

    /** Sends a notification to all users with a specific role. */
    void notifyRole(String role, String title, String message, String category, String priority);

    /** Broadcasts a notification to all users in a workspace. */
    void notifyWorkspace(String workspace, String title, String message, String category);

    /** Marks a single notification as read. */
    void markAsRead(Long notificationId, Long userId);

    /** Marks all notifications for a user as read. */
    void markAllAsRead(Long userId);

    /** Returns unread notifications for a user. */
    java.util.List<?> getUnreadNotifications(Long userId);

    /** Returns the unread notification count for a user. */
    int getUnreadCount(Long userId);

    /** Delivers real-time notification via WebSocket. */
    void pushRealTime(Long userId, String title, String message, String deepLink);
}
