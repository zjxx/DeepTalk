package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Product;
import lombok.Data;
import java.util.List;

@Data
public class CheckStockResponse {
    private List<Product> productList;
} 