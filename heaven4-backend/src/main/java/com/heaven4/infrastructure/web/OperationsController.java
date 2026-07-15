package com.heaven4.infrastructure.web;

import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.domain.orders.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/manager/operations")
@RequiredArgsConstructor
public class OperationsController {

    private final OrderRepository orderRepository;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getOperationsSummary() {
        long activeOrders = orderRepository.findByStatusIn(List.of(
            OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY
        )).size();

        return ResponseEntity.ok(Map.of(
                "activeOrders", activeOrders,
                "staffOnShift", 8, // Mocked for now until Staff engine exists
                "lowStockItems", 2, // Mocked until Inventory engine exists
                "tableTurnaroundMins", 35 // Mocked
        ));
    }
}
