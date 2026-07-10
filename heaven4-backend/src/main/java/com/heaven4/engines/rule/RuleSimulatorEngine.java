package com.heaven4.engines.rule;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Rule Simulator Engine — preview impact of rule changes before publishing.
 *
 * <p>Admin changes coupon rule → Preview → Simulation → Expected Impact → Publish.
 * No surprises when rules change.
 */
public interface RuleSimulatorEngine {

    /** Simulates the impact of a coupon rule change on historical data. */
    Map<String, Object> simulateCouponRule(String couponCode, BigDecimal discount,
                                           BigDecimal minOrder, String fromDate, String toDate);

    /** Simulates the impact of a pricing change (tax, service charge). */
    Map<String, Object> simulatePricingChange(String changeType, BigDecimal newValue, Long branchId);

    /** Simulates membership tier threshold changes. */
    Map<String, Object> simulateTierChange(String tierName, BigDecimal newThreshold);

    /** Simulates reward point earn/redeem rate changes. */
    Map<String, Object> simulateRewardRateChange(int newEarnRate, int newRedeemRate);
}
