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
import com.heaven4.engines.membership.MembershipEngine;
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
    private final MembershipEngine membershipEngine;

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
        
        // Award points immediately upon ordering as per user request
        try {
            int points = savedOrder.getTotalAmount().intValue() * 10;
            if (points > 0) {
                membershipEngine.awardPoints(customer.getId(), points, "Order placed", null);
            }
        } catch (Exception e) {
            log.error("Failed to award points for order placement {}", savedOrder.getId(), e);
        }

        // Broadcast to operations dashboard
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
        
        // Award points if completed
        // Points are now awarded at order placement
        
        // Broadcast status update
        messagingTemplate.convertAndSend("/topic/operations", orderDto);
        
        return orderDto;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return mapToDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto addItemsToOrder(Long orderId, CreateOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        BigDecimal additionalTotal = BigDecimal.ZERO;
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
            order.getItems().add(orderItem);
            additionalTotal = additionalTotal.add(subtotal);
        }
        // Recalculate total from scratch
        BigDecimal newTotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (order.getDiscountAmount() != null) {
            newTotal = newTotal.subtract(order.getDiscountAmount());
        }

        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }
        order.setTotalAmount(newTotal);
        
        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = mapToDto(savedOrder);
        messagingTemplate.convertAndSend("/topic/operations", orderDto);
        return orderDto;
    }

    @Override
    @Transactional
    public OrderDto applyDiscount(Long orderId, BigDecimal discountAmount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        order.setDiscountAmount(discountAmount);
        
        // Recalculate total
        BigDecimal newTotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .subtract(discountAmount);
        
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }
        order.setTotalAmount(newTotal);

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = mapToDto(savedOrder);
        messagingTemplate.convertAndSend("/topic/operations", orderDto);
        return orderDto;
    }

    @Override
    @Transactional
    public OrderDto removeItemFromOrder(Long orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        
        OrderItem itemToRemove = order.getItems().stream()
                .filter(item -> item.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", orderItemId));

        order.getItems().remove(itemToRemove);

        // Recalculate total
        BigDecimal newTotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        if (order.getDiscountAmount() != null) {
            newTotal = newTotal.subtract(order.getDiscountAmount());
        }

        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }
        order.setTotalAmount(newTotal);

        Order savedOrder = orderRepository.save(order);
        OrderDto orderDto = mapToDto(savedOrder);
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

        String tier = order.getCustomer() != null ? membershipEngine.getCurrentTier(order.getCustomer().getId()) : null;

        return OrderDto.builder()
                .id(order.getId())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? 
                    (order.getCustomer().getFirstName() != null ? order.getCustomer().getFirstName() : order.getCustomer().getPhoneNumber()) 
                    : "Guest")
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .createdAt(order.getCreatedAt())
                .tableNumber(order.getTableNumber())
                .membershipTier(tier)
                .items(itemDtos)
                .build();
    }
}
