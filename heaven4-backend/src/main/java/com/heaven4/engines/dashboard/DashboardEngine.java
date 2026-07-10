package com.heaven4.engines.dashboard;

import java.util.List;
import java.util.Map;

/**
 * Dashboard Engine — dynamic widget-based dashboards per workspace.
 *
 * <p>Provides configurable widgets with permission controls and
 * user preference storage. Each workspace has its own dashboard layout.
 */
public interface DashboardEngine {

    /** Returns all dashboard widgets configured for a workspace. */
    List<?> getWidgets(String workspace, Long userId);

    /** Returns live data for a specific widget. */
    Map<String, Object> getWidgetData(String widgetId, String workspace, Long branchId);

    /** Returns all KPI values for a workspace dashboard. */
    Map<String, Object> getKpiSummary(String workspace, Long branchId);

    /** Saves a user's widget layout preferences. */
    void saveUserLayout(Long userId, String workspace, List<String> widgetOrder);

    /** Returns workspace-specific real-time metrics for the live dashboard. */
    Map<String, Object> getLiveMetrics(String workspace, Long branchId);
}
