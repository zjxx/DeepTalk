package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Order;
import com.example.deeptalk.modules.shop.entity.Product;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PurchaseResponse {
    private Order order;
    private String userId;
    private Product product;
    private String status; // "pending", "completed", "failed"
} 