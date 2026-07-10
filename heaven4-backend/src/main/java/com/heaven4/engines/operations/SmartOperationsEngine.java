package com.heaven4.engines.operations;

import java.util.List;

/**
 * Smart Operations Assistant — proactive business intelligence for managers.
 *
 * <p>"Not AI. Business Intelligence." Rule-based operational awareness that
 * proactively helps the manager instead of waiting to be asked.
 *
 * <p>Examples:
 * <ul>
 *   <li>"Table 4 has been waiting 18 minutes without service."</li>
 *   <li>"Kitchen Grill Station has exceeded its average preparation time."</li>
 *   <li>"Three Gold members are currently dining."</li>
 *   <li>"Happy Hour begins in 20 minutes."</li>
 * </ul>
 */
public interface SmartOperationsEngine {

    /** Returns all current operational alerts for a branch. */
    List<OperationalAlert> getCurrentAlerts(Long branchId);

    /** Returns proactive recommendations for the manager. */
    List<OperationalAlert> getRecommendations(Long branchId);

    /** Evaluates current restaurant state and generates alerts/recommendations. */
    void evaluateOperationalState(Long branchId);

    /** Returns the operational summary for the current shift. */
    java.util.Map<String, Object> getShiftSummary(Long branchId);
}
