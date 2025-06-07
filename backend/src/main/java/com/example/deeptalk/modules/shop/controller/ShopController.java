package com.example.deeptalk.modules.shop.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = "*")
public class ShopController {
    @PostMapping("/search")
    public static String searchShop(String query) {
        // 这里可以添加搜索逻辑
        return null;
    }

    @PostMapping("/shop/check-stock")
    public synchronized static String checkStock(Long productId) {
        // 这里可以添加检查库存逻辑
        return null;
    }

    @PostMapping("/shop/product/purchase")
    public synchronized static String purchaseProduct(Long productId, Integer quantity) {
        // 这里可以添加购买逻辑
        return null;
    }

    @PostMapping("/shop/product/order")
    public synchronized static String orderProduct(Long productId, Integer quantity) {
        // 这里可以添加下单逻辑
        return null;
    }
}
