package com.example.deeptalk.modules.shop.controller;

import com.example.deeptalk.modules.shop.dto.*;
import com.example.deeptalk.modules.shop.entity.Order;
import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.repository.OrderRepository;
import com.example.deeptalk.modules.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = "*")
public class ShopController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    @PostMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SearchResponse> searchShop(@RequestBody SearchRequest request) {
        List<Product> products;
        if (request.getQuery() == null || request.getQuery().trim().isEmpty()) {
            products = productRepository.findAll();
        } else {
            products = productRepository.searchProducts(request.getQuery());
        }
        
        SearchResponse response = new SearchResponse();
        response.setProducts(products);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/check-stock", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<CheckStockResponse> checkStock(@RequestBody CheckStockRequest request) {
        List<Order> orders = orderRepository.findByUserId(request.getUserId());
        List<Product> products = orders.stream()
                .map(Order::getProduct)
                .toList();
        
        CheckStockResponse response = new CheckStockResponse();
        response.setProductList(products);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/purchase", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<PurchaseResponse> purchaseProduct(@RequestBody PurchaseRequest request) {
        Order order = orderRepository.save(request.getOrder());
        
        PurchaseResponse response = new PurchaseResponse();
        response.setOrder(order);
        response.setUserId(order.getUserId());
        response.setProduct(order.getProduct());
        response.setStatus("completed"); // 这里可以根据实际业务逻辑设置状态
        
        return ResponseEntity.ok(response);
    }
}
