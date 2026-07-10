package com.heaven4.engines.automation;

/**
 * Automation Engine — background workers and scheduled jobs.
 *
 * <p>Responsible for: point expiry, reminders, membership renewal,
 * scheduled offers (Happy Hour), daily/weekly/monthly reports,
 * cleanup jobs, auto-notifications, auto session close.
 */
public interface AutomationEngine {

    /** Executes scheduled point expiry using FIFO. */
    void runPointExpiryJob();

    /** Sends expiry reminder notifications to customers with expiring points. */
    void runPointExpiryReminders(int withinDays);

    /** Auto-closes dining sessions that have been idle beyond threshold. */
    void runAutoSessionClose();

    /** Triggers scheduled offer activation/deactivation (e.g., Happy Hour). */
    void runScheduledOffers();

    /** Generates and dispatches daily summary reports. */
    void runDailyReports();

    /** Generates and dispatches weekly summary reports. */
    void runWeeklyReports();

    /** Generates and dispatches monthly summary reports. */
    void runMonthlyReports();

    /** Runs database cleanup jobs (purge expired OTPs, old sessions, etc.). */
    void runCleanupJobs();

    /** Processes membership tier evaluation for all active customers. */
    void runTierEvaluation();
}
