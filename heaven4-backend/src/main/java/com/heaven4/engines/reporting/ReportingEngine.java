package com.heaven4.engines.reporting;

import java.util.Map;

/**
 * Reporting Engine — all reports from one engine. No duplicate SQL.
 */
public interface ReportingEngine {

    /** Generates a daily report for a branch. */
    Map<String, Object> generateDailyReport(Long branchId, String date);

    /** Generates a weekly report for a branch. */
    Map<String, Object> generateWeeklyReport(Long branchId, String weekStartDate);

    /** Generates a monthly report for a branch. */
    Map<String, Object> generateMonthlyReport(Long branchId, int year, int month);

    /** Generates a custom date-range report. */
    Map<String, Object> generateCustomReport(Long branchId, String fromDate, String toDate,
                                              java.util.List<String> includeMetrics);

    /** Returns all scheduled report definitions. */
    java.util.List<?> getScheduledReports(Long branchId);

    /** Schedules a recurring report (daily/weekly/monthly). */
    Long scheduleReport(String reportType, String frequency, Long branchId, String deliveryEmail);
}
