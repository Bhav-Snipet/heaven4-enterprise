package com.heaven4.engines.metrics;

import java.util.Map;

/**
 * Business Metrics Engine — enterprise-level KPI tracking from one place.
 *
 * <p>Tracks: avg dining time, customer LTV, avg wait time, top items,
 * conversion rate, coupon usage, reward usage, revenue, employee productivity,
 * kitchen efficiency, manager resolution time.
 */
public interface MetricsEngine {

    /** Returns all KPIs for a branch for a given date range. */
    Map<String, Object> getBranchMetrics(Long branchId, String fromDate, String toDate);

    /** Returns employee performance metrics. */
    Map<String, Object> getEmployeeMetrics(Long employeeId, String fromDate, String toDate);

    /** Returns kitchen/chef performance metrics. */
    Map<String, Object> getKitchenMetrics(Long branchId, String fromDate, String toDate);

    /** Returns revenue metrics. */
    Map<String, Object> getRevenueMetrics(Long branchId, String period);

    /** Returns customer analytics (LTV, visit frequency, spend patterns). */
    Map<String, Object> getCustomerAnalytics(Long customerId);

    /** Returns menu item performance (top sellers, ratings, conversion). */
    Map<String, Object> getMenuItemMetrics(Long branchId, String fromDate, String toDate);

    /** Snapshots today's metrics for historical reporting. */
    void snapshotDailyMetrics(Long branchId);
}
