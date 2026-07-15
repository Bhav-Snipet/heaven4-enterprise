package com.heaven4.engines.payment;

import com.heaven4.domain.billing.Invoice;
import java.math.BigDecimal;

/**
 * Billing Engine — handles Checkout logic, converting an Order to an Invoice.
 */
public interface BillingEngine {

    /**
     * Processes checkout for an active order, applies tax and tips, and generates an invoice.
     * Triggers Rewards logic internally if the user is a logged-in customer.
     */
    Invoice processCheckout(Long orderId, BigDecimal tipAmount, String paymentMethod);
    
    /** Retrieves an invoice by order ID */
    Invoice getInvoiceByOrderId(Long orderId);
}
