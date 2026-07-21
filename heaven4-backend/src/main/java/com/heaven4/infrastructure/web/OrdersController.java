package com.heaven4.infrastructure.web;

import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.engines.orders.OrdersEngine;
import com.heaven4.engines.orders.dto.CreateOrderRequest;
import com.heaven4.engines.orders.dto.OrderDto;
import com.heaven4.security.HeavenUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrdersController {

    private final OrdersEngine ordersEngine;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderDto> placeOrder(
            @AuthenticationPrincipal HeavenUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = ordersEngine.placeOrder(userDetails.getUserId(), request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDto>> getMyOrders(
            @AuthenticationPrincipal HeavenUserDetails userDetails) {
        return ResponseEntity.ok(ordersEngine.getCustomerOrders(userDetails.getUserId()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'EMPLOYEE')")
    public ResponseEntity<List<OrderDto>> getActiveOrders() {
        return ResponseEntity.ok(ordersEngine.getActiveOrders());
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('KITCHEN', 'MANAGER', 'ADMIN', 'OWNER', 'EMPLOYEE')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(ordersEngine.updateOrderStatus(orderId, status));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'KITCHEN', 'EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(ordersEngine.getOrderById(orderId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('KITCHEN', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(ordersEngine.getAllOrders());
    }

    @PostMapping("/{orderId}/add-items")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderDto> addItemsToOrder(
            @PathVariable Long orderId,
            @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(ordersEngine.addItemsToOrder(orderId, request));
    }

    @PutMapping("/{orderId}/discount")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderDto> applyDiscount(
            @PathVariable Long orderId,
            @RequestBody Map<String, java.math.BigDecimal> body) {
        return ResponseEntity.ok(ordersEngine.applyDiscount(orderId, body.get("discountAmount")));
    }

    @DeleteMapping("/{orderId}/items/{orderItemId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'OWNER')")
    public ResponseEntity<OrderDto> removeItemFromOrder(
            @PathVariable Long orderId,
            @PathVariable Long orderItemId) {
        return ResponseEntity.ok(ordersEngine.removeItemFromOrder(orderId, orderItemId));
    }
}
