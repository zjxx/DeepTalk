package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Product;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CheckStockResponse {
    private List<Product> productList;
} 