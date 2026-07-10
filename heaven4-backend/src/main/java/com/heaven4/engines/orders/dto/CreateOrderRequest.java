package com.heaven4.engines.orders.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private List<CreateOrderItemRequest> items;
}
