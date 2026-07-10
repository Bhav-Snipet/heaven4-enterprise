package com.heaven4.engines.feature;

/**
 * Feature Configuration Engine — manages the Feature Registry.
 *
 * <p>Replaces hardcoded if(featureEnabled) checks with a configurable system:
 * Feature Registry → Configuration → Workspace → Branch → User Type → Availability.
 */
public interface FeatureConfigEngine {

    /** Checks if a feature is enabled for a specific workspace and branch. */
    boolean isFeatureEnabled(String featureId, String workspace, Long branchId);

    /** Checks if a feature is enabled for a specific user role. */
    boolean isFeatureEnabledForRole(String featureId, String role);

    /** Returns all enabled features for a workspace. */
    java.util.List<String> getEnabledFeatures(String workspace, Long branchId);

    /** Enables a feature for a workspace/branch. Admin only. */
    void enableFeature(String featureId, String workspace, Long branchId);

    /** Disables a feature for a workspace/branch. Admin only. */
    void disableFeature(String featureId, String workspace, Long branchId);

    /** Returns the full feature registry with current states. */
    java.util.List<?> getFeatureRegistry();
}
