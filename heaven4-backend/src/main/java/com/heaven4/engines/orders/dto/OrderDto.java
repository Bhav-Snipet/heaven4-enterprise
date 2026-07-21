package com.heaven4.engines.orders.dto;

import com.heaven4.domain.orders.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class OrderDto {
    private Long id;
    private Long customerId;
    private String customerName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private Instant createdAt;
    private String tableNumber;
    private List<OrderItemDto> items;
}
