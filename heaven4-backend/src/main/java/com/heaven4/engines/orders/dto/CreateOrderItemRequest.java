package com.heaven4.engines.orders.dto;

import lombok.Data;

@Data
public class CreateOrderItemRequest {
    private Long menuItemId;
    private Integer quantity;
}
