package com.heaven4.infrastructure.web;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.engines.payment.BillingEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingEngine billingEngine;

    @PostMapping("/checkout/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Invoice> processCheckout(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> payload) {
        
        BigDecimal tipAmount = new BigDecimal(payload.getOrDefault("tipAmount", "0").toString());
        String paymentMethod = payload.getOrDefault("paymentMethod", "CARD").toString();
        
        Invoice invoice = billingEngine.processCheckout(orderId, tipAmount, paymentMethod);
        return ResponseEntity.ok(invoice);
    }
}
