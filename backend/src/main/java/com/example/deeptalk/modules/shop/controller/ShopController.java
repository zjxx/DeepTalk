package com.example.deeptalk.modules.shop.controller;

import com.example.deeptalk.modules.shop.dto.*;
import com.example.deeptalk.modules.shop.entity.Order;
import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.entity.UserModel;
import com.example.deeptalk.modules.shop.repository.OrderRepository;
import com.example.deeptalk.modules.shop.repository.ProductRepository;
import com.example.deeptalk.modules.shop.repository.UserModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/shop")
@CrossOrigin(origins = "*")
public class ShopController {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserModelRepository userModelRepository;

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

    @PostMapping(value = "/product/use", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<String> useProduct(@RequestBody UseRequest request) {
        System.out.println("useProduct: " + request);
        System.out.println("useProduct: " + request.getUserId());
        System.out.println("useProduct: " + request.getProductId());
        // 查找是否已存在该用户的记录
        List<UserModel> existingModels = userModelRepository.findByUserId(request.getUserId());
        
        UserModel userModel;
        if (!existingModels.isEmpty()) {
            // 如果已存在，更新第一条记录的modelId
            userModel = existingModels.get(0);
            userModel.setModelId(request.getProductId());
        } else {
            // 如果不存在，创建新记录
            userModel = new UserModel();
            userModel.setUserId(request.getUserId());
            userModel.setModelId(request.getProductId());
        }
        
        userModelRepository.save(userModel);
        
        return ResponseEntity.ok("ok");
    }

    @PostMapping(value = "/product/getused", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<HashMap<String, Object>> getUserModels(@RequestBody GetUsedRequest request) {
        List<UserModel> userModels = userModelRepository.findByUserId(request.getUserId());
        HashMap<String, Object> response = new HashMap<>();
        
        if (!userModels.isEmpty()) {
            System.out.println("getProductId " + userModels.get(0).getModelId());
            response.put("success", true);
            response.put("message", "获取成功");
            response.put("productId", userModels.get(0).getModelId());
        } else {
            response.put("success", true);
            response.put("message", "用户暂无使用记录");
            // productId字段不设置，前端会收到undefined
        }
        
        return ResponseEntity.ok().body(response);
    }
}
