package com.heaven4.infrastructure.web;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.domain.billing.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner/finance")
@RequiredArgsConstructor
public class OwnerFinanceController {

    private final InvoiceRepository invoiceRepository;

    @GetMapping("/daily-summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getDailySummary() {
        List<Invoice> invoices = invoiceRepository.findAll(); // Simplified for MVP, should be filtered by date

        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTips = invoices.stream()
                .map(Invoice::getTipAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = invoices.isEmpty() ? BigDecimal.ZERO 
                : totalRevenue.divide(new BigDecimal(invoices.size()), 2, RoundingMode.HALF_UP);

        // Generate 7-day trend mock data for Recharts
        List<Map<String, Object>> trends = List.of(
            Map.of("day", "Mon", "revenue", 12000, "profit", 3000),
            Map.of("day", "Tue", "revenue", 14500, "profit", 3500),
            Map.of("day", "Wed", "revenue", 11000, "profit", 2800),
            Map.of("day", "Thu", "revenue", 16000, "profit", 4000),
            Map.of("day", "Fri", "revenue", 21000, "profit", 6000),
            Map.of("day", "Sat", "revenue", 25000, "profit", 8000),
            Map.of("day", "Sun", "revenue", totalRevenue.doubleValue(), "profit", totalRevenue.multiply(new BigDecimal("0.25")).doubleValue())
        );

        return ResponseEntity.ok(Map.of(
                "totalRevenue", totalRevenue,
                "totalTips", totalTips,
                "averageOrderValue", averageOrderValue,
                "totalOrders", invoices.size(),
                "trends", trends
        ));
    }
}
