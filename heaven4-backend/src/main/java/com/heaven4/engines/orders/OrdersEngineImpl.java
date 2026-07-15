package com.heaven4.engines.orders;

import com.heaven4.core.exception.BusinessException;
import com.heaven4.core.exception.ResourceNotFoundException;
import com.heaven4.domain.catalog.entity.MenuItem;
import com.heaven4.domain.catalog.repository.MenuItemRepository;
import com.heaven4.domain.identity.entity.User;
import com.heaven4.domain.identity.repository.UserRepository;
import com.heaven4.domain.orders.entity.Order;
import com.heaven4.domain.orders.entity.OrderItem;
import com.heaven4.domain.orders.entity.OrderStatus;
import com.heaven4.domain.orders.repository.OrderRepository;
import com.heaven4.engines.orders.dto.CreateOrderItemRequest;
import com.heaven4.engines.orders.dto.CreateOrderRequest;
import com.heaven4.engines.orders.dto.OrderDto;
import com.heaven4.engines.orders.dto.OrderItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrdersEngineImpl implements OrdersEngine {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public OrderDto placeOrder(Long customerId, CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException("Order must contain at least one item.");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setBranchId(1L);
        order.setTableNumber(request.getTableNumber());

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CreateOrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", itemReq.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(menuItem.getBasePrice());
            
            BigDecimal subtotal = menuItem.getBasePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            orderItem.setSubtotal(subtotal);

            orderItems.add(orderItem);
            total = total.add(subtotal);
        }

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = mapToDto(savedOrder);
        
        // Broadcast new order to operations/kitchen
        messagingTemplate.convertAndSend("/topic/operations", orderDto);
        
        return orderDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getActiveOrders() {
        return orderRepository.findByStatusIn(List.of(OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY))
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = mapToDto(savedOrder);
        
        // Broadcast status update
        messagingTemplate.convertAndSend("/topic/operations", orderDto);
        
        return orderDto;
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItem().getId())
                        .menuItemName(item.getMenuItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? 
                    (order.getCustomer().getFirstName() != null ? order.getCustomer().getFirstName() : order.getCustomer().getPhoneNumber()) 
                    : "Guest")
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .tableNumber(order.getTableNumber())
                .items(itemDtos)
                .build();
    }
}
