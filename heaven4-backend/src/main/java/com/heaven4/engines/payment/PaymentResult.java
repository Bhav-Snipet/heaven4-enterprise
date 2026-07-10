package com.heaven4.engines.payment;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * Result returned by payment operations.
 */
@Getter
@Builder
public class PaymentResult {

    private Long paymentId;
    private String status;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionReference;
    private String errorMessage;
    private boolean requiresConfirmation;
}
