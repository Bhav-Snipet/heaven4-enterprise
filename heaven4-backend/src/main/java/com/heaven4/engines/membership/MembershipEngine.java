package com.heaven4.engines.membership;

import java.util.List;

/**
 * Membership Engine — manages Heaven Rewards, point wallets, tiers, and challenges.
 *
 * <p>Features: points earn/redeem with FIFO expiry, configurable tiers,
 * challenges, progress tracking, membership history.
 */
public interface MembershipEngine {

    /** Awards points to a customer after payment. */
    void awardPoints(Long customerId, int points, String reason, Long referenceId);

    /** Redeems points from a customer's wallet (FIFO expiry order). */
    void redeemPoints(Long customerId, int points, Long sessionId);

    /** Returns the current point balance for a customer. */
    int getPointBalance(Long customerId);

    /** Returns the customer's current membership tier name. */
    String getCurrentTier(Long customerId);

    /** Checks and triggers any tier upgrades/downgrades based on lifetime spend. */
    void evaluateTierStatus(Long customerId);

    /** Returns the point transaction history for a customer. */
    List<?> getPointHistory(Long customerId, int page, int size);

    /** Checks for points that will expire within the given days and triggers notifications. */
    void notifyExpiringPoints(int withinDays);

    /** Executes the scheduled FIFO point expiry job. */
    void expirePoints();
}
