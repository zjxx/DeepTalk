package com.example.deeptalk.modules.shop.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Product {
    private String id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
} 