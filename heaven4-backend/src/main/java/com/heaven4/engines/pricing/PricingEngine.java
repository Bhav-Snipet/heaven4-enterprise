package com.heaven4.engines.pricing;

import java.math.BigDecimal;

/**
 * Pricing Engine — calculates all monetary values for Heaven4.
 *
 * <p>Handles: base prices, tax, service charge, coupon discounts,
 * membership discounts, happy hour rates, and split payment calculations.
 *
 * <p>All pricing logic must go through this engine — never hardcode monetary calculations.
 */
public interface PricingEngine {

    /**
     * Calculates the subtotal for a dining session cart.
     */
    BigDecimal calculateSubtotal(Long sessionId);

    /**
     * Calculates applicable tax on a given amount.
     */
    BigDecimal calculateTax(BigDecimal subtotal, Long branchId);

    /**
     * Calculates the service charge on a given amount.
     */
    BigDecimal calculateServiceCharge(BigDecimal subtotal, Long branchId);

    /**
     * Applies a coupon code and returns the discount amount.
     * Validates: expiry, minimum order, usage limit, applicable items.
     */
    BigDecimal applyCoupon(String couponCode, BigDecimal subtotal, Long customerId, Long sessionId);

    /**
     * Calculates the membership discount for a customer.
     */
    BigDecimal applyMembershipDiscount(BigDecimal subtotal, Long customerId);

    /**
     * Calculates the Heaven Rewards points to be earned for a given amount.
     */
    int calculatePointsEarned(BigDecimal billAmount, Long customerId);

    /**
     * Calculates the rupee value of points being redeemed.
     */
    BigDecimal calculatePointsRedemptionValue(int points, Long customerId);

    /**
     * Calculates each party's share in a split payment.
     */
    java.util.List<BigDecimal> calculateSplitAmounts(BigDecimal total, int numberOfPeople);

    /**
     * Returns a complete price breakdown for a session (preview before payment).
     */
    PricingBreakdown previewBill(Long sessionId, String couponCode, int redeemPoints);
}
