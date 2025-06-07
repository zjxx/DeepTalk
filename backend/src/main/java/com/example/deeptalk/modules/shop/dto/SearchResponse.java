package com.example.deeptalk.modules.shop.dto;

import com.example.deeptalk.modules.shop.entity.Product;
import lombok.Data;
import java.util.List;

@Data
public class SearchResponse {
    private List<Product> products;
} 