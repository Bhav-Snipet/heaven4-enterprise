package com.heaven4.engines.pricing;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Complete price breakdown returned by PricingEngine.previewBill().
 *
 * <p>Displayed to the customer on the Bill page before payment confirmation.
 */
@Getter
@Builder
public class PricingBreakdown {

    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal taxPercent;
    private BigDecimal serviceCharge;
    private BigDecimal serviceChargePercent;
    private BigDecimal couponDiscount;
    private String couponCode;
    private BigDecimal membershipDiscount;
    private BigDecimal pointsRedeemed;
    private int pointsUsed;
    private BigDecimal totalAmount;
    private BigDecimal roundingAdjustment;
    private BigDecimal finalAmount;
    private int pointsEarned;
}
