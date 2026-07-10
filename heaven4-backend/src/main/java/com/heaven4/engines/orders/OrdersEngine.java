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
}
