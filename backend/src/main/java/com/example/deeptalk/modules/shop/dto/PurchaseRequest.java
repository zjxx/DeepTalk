package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Order;
import lombok.Data;

@Data
public class PurchaseRequest {
    private Order order;
} 