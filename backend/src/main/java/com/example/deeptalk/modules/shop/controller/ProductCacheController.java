package com.example.deeptalk.modules.shop.controller;

import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.service.ProductCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品缓存测试控制器
 * 提供商品缓存相关的测试接口
 */
@RestController
@RequestMapping("/api/shop/cache")
@CrossOrigin(origins = "*")
public class ProductCacheController {

    @Autowired
    private ProductCacheService productCacheService;

    /**
     * 获取所有商品（带缓存）
     * GET /api/shop/cache/products/all
     */
    @GetMapping("/products/all")
    public ResponseEntity<Map<String, Object>> getAllProducts() {
        long startTime = System.currentTimeMillis();
        
        List<Product> products = productCacheService.getAllProducts();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", products.size());
        response.put("products", products);
        response.put("queryTime", duration + "ms");
        response.put("message", "查询成功");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 根据 ID 获取商品详情（带缓存）
     * GET /api/shop/cache/product/{id}
     */
    @GetMapping("/product/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        long startTime = System.currentTimeMillis();
        
        Product product = productCacheService.getProductById(id);
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        Map<String, Object> response = new HashMap<>();
        if (product != null) {
            response.put("success", true);
            response.put("product", product);
            response.put("queryTime", duration + "ms");
            response.put("message", "查询成功");
        } else {
            response.put("success", false);
            response.put("message", "商品不存在");
        }
        
        return ResponseEntity.ok(response);
    }

    /**
     * 搜索商品（带缓存）
     * GET /api/shop/cache/products/search?keyword=xxx
     */
    @GetMapping("/products/search")
    public ResponseEntity<Map<String, Object>> searchProducts(@RequestParam(required = false) String keyword) {
        long startTime = System.currentTimeMillis();
        
        List<Product> products = productCacheService.searchProducts(keyword);
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("keyword", keyword);
        response.put("count", products.size());
        response.put("products", products);
        response.put("queryTime", duration + "ms");
        response.put("message", "搜索成功");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 清除所有商品缓存
     * DELETE /api/shop/cache/clear-all
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCache() {
        productCacheService.clearAllCache();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "已清除所有商品缓存");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 清除单个商品缓存
     * DELETE /api/shop/cache/product/{id}
     */
    @DeleteMapping("/product/{id}")
    public ResponseEntity<Map<String, Object>> clearProductCache(@PathVariable Long id) {
        productCacheService.clearProductCache(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "已清除商品缓存: " + id);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 缓存预热
     * POST /api/shop/cache/warmup
     */
    @PostMapping("/warmup")
    public ResponseEntity<Map<String, Object>> warmUpCache() {
        long startTime = System.currentTimeMillis();
        
        productCacheService.warmUpCache();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "缓存预热完成");
        response.put("duration", duration + "ms");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 性能对比测试
     * GET /api/shop/cache/performance-test
     */
    @GetMapping("/performance-test")
    public ResponseEntity<Map<String, Object>> performanceTest() {
        Map<String, Object> response = new HashMap<>();
        
        // 清除缓存
        productCacheService.clearAllCache();
        
        // 第一次查询（无缓存）
        long start1 = System.currentTimeMillis();
        List<Product> products1 = productCacheService.getAllProducts();
        long time1 = System.currentTimeMillis() - start1;
        
        // 第二次查询（有缓存）
        long start2 = System.currentTimeMillis();
        List<Product> products2 = productCacheService.getAllProducts();
        long time2 = System.currentTimeMillis() - start2;
        
        // 计算性能提升
        double improvement = time1 > 0 ? ((double)(time1 - time2) / time1 * 100) : 0;
        
        response.put("success", true);
        response.put("productCount", products1.size());
        response.put("noCacheTime", time1 + "ms");
        response.put("cachedTime", time2 + "ms");
        response.put("improvement", String.format("%.2f%%", improvement));
        response.put("speedup", time1 > 0 ? String.format("%.2fx", (double)time1 / time2) : "N/A");
        response.put("message", "性能测试完成");
        
        return ResponseEntity.ok(response);
    }
}
