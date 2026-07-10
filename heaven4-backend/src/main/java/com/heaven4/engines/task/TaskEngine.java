package com.heaven4.engines.task;

/**
 * Task Engine — converts every actionable event into a trackable task.
 *
 * <p>Examples: kitchen delay → task, customer complaint → task,
 * table cleaning → task, manager approval → task, low stock → task.
 *
 * <p>"Everything becomes a Task."
 */
public interface TaskEngine {

    /** Creates a new task and assigns it to the appropriate role. */
    Long createTask(String taskType, String title, String description,
                    String priority, Long assignedTo, Long referenceId, String referenceType);

    /** Marks a task as in progress. */
    void startTask(Long taskId, Long startedBy);

    /** Completes a task with an optional resolution note. */
    void completeTask(Long taskId, Long completedBy, String resolution);

    /** Cancels a task with a reason. */
    void cancelTask(Long taskId, Long cancelledBy, String reason);

    /** Escalates a task to a higher role (e.g., employee → manager). */
    void escalateTask(Long taskId, Long escalatedTo, String reason);

    /** Reassigns a task to a different user. */
    void reassignTask(Long taskId, Long newAssignee, Long reassignedBy);

    /** Returns all active tasks for a user. */
    java.util.List<?> getActiveTasks(Long userId, int page, int size);

    /** Returns overdue tasks for escalation processing. */
    java.util.List<?> getOverdueTasks();
}
