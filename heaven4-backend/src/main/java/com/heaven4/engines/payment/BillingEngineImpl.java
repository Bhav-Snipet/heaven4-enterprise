package com.heaven4.engines.payment;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.domain.orders.entity.Order;
import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.engines.membership.MembershipEngine;
import com.heaven4.domain.billing.repository.InvoiceRepository;
import com.heaven4.domain.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class BillingEngineImpl implements BillingEngine {

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final MembershipEngine membershipEngine;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public Invoice processCheckout(Long orderId, BigDecimal tipAmount, String paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.READY && order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PREPARING) {
            throw new RuntimeException("Order is in invalid state for checkout: " + order.getStatus());
        }

        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
        
        if (tipAmount == null) {
            tipAmount = BigDecimal.ZERO;
        }
        
        BigDecimal totalAmount = subtotal.add(taxAmount).add(tipAmount);

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setSubtotal(subtotal);
        invoice.setTaxAmount(taxAmount);
        invoice.setTipAmount(tipAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setStatus("PAID");

        invoice = invoiceRepository.save(invoice);
        
        // We do NOT set order to COMPLETED here. 
        // Paying upfront doesn't mean the food is cooked or served.
        // The order remains in its current state (e.g. PENDING) until the kitchen/employee completes it.

        if (order.getCustomer() != null) {
            // Award 10 points for every $1 spent
            int points = totalAmount.intValue() * 10;
            membershipEngine.awardPoints(order.getCustomer().getId(), points, "Order #" + order.getId() + " checkout", invoice.getId());
        }

        // Broadcast to operations that payment occurred
        messagingTemplate.convertAndSend("/topic/operations", "Order Paid");

        return invoice;
    }

    @Override
    @Transactional(readOnly = true)
    public Invoice getInvoiceByOrderId(Long orderId) {
        return invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for order"));
    }
}
