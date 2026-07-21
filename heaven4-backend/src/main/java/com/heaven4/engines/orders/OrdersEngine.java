package com.heaven4.engines.orders;

import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.engines.orders.dto.CreateOrderRequest;
import com.heaven4.engines.orders.dto.OrderDto;

import java.util.List;

public interface OrdersEngine {
    OrderDto placeOrder(Long customerId, CreateOrderRequest request);
    List<OrderDto> getActiveOrders();
    List<OrderDto> getCustomerOrders(Long customerId);
    OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus);
    OrderDto getOrderById(Long orderId);
    List<OrderDto> getAllOrders();
    OrderDto addItemsToOrder(Long orderId, CreateOrderRequest request);
    OrderDto applyDiscount(Long orderId, java.math.BigDecimal discountAmount);
    OrderDto removeItemFromOrder(Long orderId, Long orderItemId);
}
