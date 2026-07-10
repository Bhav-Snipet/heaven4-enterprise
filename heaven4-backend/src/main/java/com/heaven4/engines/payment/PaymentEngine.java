package com.heaven4.engines.payment;

import java.math.BigDecimal;

/**
 * Payment Engine — handles all payment processing for Heaven4.
 *
 * <p>Supports: QR payment, cash (with employee confirmation), split payment,
 * payment retry, reconciliation, and refund processing.
 */
public interface PaymentEngine {

    /** Initiates a QR-based payment for a dining session bill. */
    PaymentResult initiateQrPayment(Long billId, BigDecimal amount);

    /** Records a cash payment (requires employee confirmation). */
    PaymentResult recordCashPayment(Long billId, BigDecimal amount, Long employeeId);

    /** Confirms a cash payment received by an employee. */
    PaymentResult confirmCashPayment(Long paymentId, Long employeeId);

    /** Retries a failed payment. */
    PaymentResult retryPayment(Long paymentId);

    /** Initiates a split payment for a bill between N people. */
    java.util.List<PaymentResult> initiateSplitPayment(Long billId, int splitCount);

    /** Processes a refund for a completed payment. Requires manager/admin approval. */
    PaymentResult initiateRefund(Long paymentId, BigDecimal amount, String reason);

    /** Returns the current payment status for a bill. */
    String getPaymentStatus(Long billId);
}
