package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Order;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseRequest {
    private Order order;
} 