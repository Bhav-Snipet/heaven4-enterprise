package com.heaven4.engines.finance;

import com.heaven4.domain.billing.Invoice;
import com.heaven4.domain.billing.repository.InvoiceRepository;
import com.heaven4.domain.catalog.entity.Category;
import com.heaven4.domain.catalog.repository.CategoryRepository;
import com.heaven4.domain.orders.entity.Order;
import com.heaven4.domain.orders.entity.OrderItem;
import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.domain.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceEngineImpl implements FinanceEngine {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDailySummary() {
        List<Invoice> invoices = invoiceRepository.findAll();

        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTips = invoices.stream()
                .map(Invoice::getTipAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = invoices.isEmpty() ? BigDecimal.ZERO 
                : totalRevenue.divide(new BigDecimal(invoices.size()), 2, RoundingMode.HALF_UP);

        // Generate dynamic 7-day trend
        Map<String, BigDecimal> revenueByDay = new HashMap<>();
        Map<String, BigDecimal> profitByDay = new HashMap<>();
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");
        
        // Initialize last 7 days with 0
        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            String dayName = today.minusDays(i).format(formatter);
            revenueByDay.put(dayName, BigDecimal.ZERO);
            profitByDay.put(dayName, BigDecimal.ZERO);
        }

        for (Invoice invoice : invoices) {
            LocalDate invoiceDate = invoice.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
            if (invoiceDate.isAfter(today.minusDays(7))) {
                String dayName = invoiceDate.format(formatter);
                revenueByDay.put(dayName, revenueByDay.getOrDefault(dayName, BigDecimal.ZERO).add(invoice.getTotalAmount()));
                profitByDay.put(dayName, profitByDay.getOrDefault(dayName, BigDecimal.ZERO).add(invoice.getTotalAmount().multiply(new BigDecimal("0.25"))));
            }
        }

        List<Map<String, Object>> trends = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            String dayName = today.minusDays(i).format(formatter);
            trends.add(Map.of(
                "day", dayName,
                "revenue", revenueByDay.get(dayName).doubleValue(),
                "profit", profitByDay.get(dayName).doubleValue()
            ));
        }

        // Generate category distribution
        List<Category> allCategories = categoryRepository.findAll();
        Map<Long, String> categoryNames = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
                
        List<Order> completedOrders = orderRepository.findByStatusIn(List.of(OrderStatus.COMPLETED));
        Map<String, BigDecimal> categorySales = new HashMap<>();
        
        for (Order order : completedOrders) {
            for (OrderItem item : order.getItems()) {
                Long catId = item.getMenuItem().getCategoryId();
                String catName = categoryNames.getOrDefault(catId, "Uncategorized");
                categorySales.put(catName, categorySales.getOrDefault(catName, BigDecimal.ZERO).add(item.getSubtotal()));
            }
        }

        List<Map<String, Object>> categoryDistribution = categorySales.entrySet().stream()
                .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue().doubleValue()))
                .collect(Collectors.toList());

        return Map.of(
                "totalRevenue", totalRevenue,
                "totalTips", totalTips,
                "averageOrderValue", averageOrderValue,
                "totalOrders", invoices.size(),
                "trends", trends,
                "categories", categoryDistribution
        );
    }
}
