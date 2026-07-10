package com.heaven4.engines.approval;

/**
 * Approval Engine — handles all actions requiring manager/admin authorization.
 *
 * <p>Use cases: discount approvals, refund approvals, order overrides,
 * manual membership adjustments, and all sensitive operations.
 */
public interface ApprovalEngine {

    /** Submits an action for manager approval. */
    Long requestApproval(String actionType, Long referenceId, String reason, Long requestedBy);

    /** Approves a pending request. Only MANAGER/ADMIN/OWNER roles. */
    void approve(Long approvalId, Long approvedBy, String comment);

    /** Rejects a pending request with a reason. */
    void reject(Long approvalId, Long rejectedBy, String reason);

    /** Returns the current status of an approval request. */
    String getApprovalStatus(Long approvalId);

    /** Returns all pending approvals for a given manager. */
    java.util.List<?> getPendingApprovals(Long managerId, int page, int size);
}
