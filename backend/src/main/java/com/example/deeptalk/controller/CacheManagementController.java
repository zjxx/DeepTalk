package com.example.deeptalk.controller;

import com.example.deeptalk.service.CacheManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 全局缓存管理控制器
 * 提供统一的缓存管理接口
 */
@RestController
@RequestMapping("/api/cache")
@CrossOrigin(origins = "*")
public class CacheManagementController {

    @Autowired
    private CacheManagementService cacheManagementService;

    /**
     * 全局缓存预热
     * POST /api/cache/warmup-all
     */
    @PostMapping("/warmup-all")
    public ResponseEntity<Map<String, Object>> warmUpAllCaches() {
        long startTime = System.currentTimeMillis();
        
        cacheManagementService.warmUpAllCaches();
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "全局缓存预热完成");
        response.put("duration", duration + "ms");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 清除所有缓存
     * DELETE /api/cache/clear-all
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCaches() {
        cacheManagementService.clearAllCaches();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "所有缓存已清除");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取缓存统计信息
     * GET /api/cache/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        String stats = cacheManagementService.getCacheStats();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);
        response.put("message", "缓存统计信息");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 健康检查
     * GET /api/cache/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "缓存服务运行正常");
        response.put("modules", Map.of(
            "post", "enabled",
            "product", "enabled",
            "user", "enabled",
            "reply", "enabled"
        ));
        
        return ResponseEntity.ok(response);
    }
}
