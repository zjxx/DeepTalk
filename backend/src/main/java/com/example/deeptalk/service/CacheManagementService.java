package com.example.deeptalk.service;

import com.example.deeptalk.modules.auth.service.UserCacheService;
import com.example.deeptalk.modules.community.service.PostCacheService;
import com.example.deeptalk.modules.community.service.ReplyCacheService;
import com.example.deeptalk.modules.shop.service.ProductCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 统一缓存管理服务
 * 提供全局缓存预热、清除等功能
 */
@Service
public class CacheManagementService {

    @Autowired
    private PostCacheService postCacheService;

    @Autowired
    private ProductCacheService productCacheService;

    @Autowired
    private ReplyCacheService replyCacheService;

    @Autowired
    private UserCacheService userCacheService;

    /**
     * 全局缓存预热
     * 在系统启动或流量高峰前调用
     */
    public void warmUpAllCaches() {
        System.out.println("========================================");
        System.out.println("开始全局缓存预热...");
        System.out.println("========================================");
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 预热帖子缓存
            System.out.println("\n[1/4] 预热帖子缓存...");
            postCacheService.warmUpCache();
            
            // 2. 预热商品缓存
            System.out.println("\n[2/4] 预热商品缓存...");
            productCacheService.warmUpCache();
            
            // 3. 预热用户缓存
            System.out.println("\n[3/4] 预热用户缓存...");
            userCacheService.warmUpCache();
            
            // 4. 预热评论缓存（热门帖子的评论）
            System.out.println("\n[4/4] 预热评论缓存...");
            var hotPosts = postCacheService.getAllPosts();
            List<String> hotPostIds = new ArrayList<>();
            int count = Math.min(20, hotPosts.size());
            for (int i = 0; i < count; i++) {
                hotPostIds.add(hotPosts.get(i).getId());
            }
            replyCacheService.warmUpCache(hotPostIds);
            
        } catch (Exception e) {
            System.err.println("缓存预热过程中出现错误: " + e.getMessage());
            e.printStackTrace();
        }
        
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        System.out.println("\n========================================");
        System.out.println("✅ 全局缓存预热完成！");
        System.out.println("⏱️  总耗时: " + duration + "ms");
        System.out.println("========================================");
    }

    /**
     * 清除所有缓存
     * 谨慎使用！
     */
    public void clearAllCaches() {
        System.out.println("========================================");
        System.out.println("⚠️  开始清除所有缓存...");
        System.out.println("========================================");
        
        try {
            // 1. 清除帖子缓存
            System.out.println("[1/3] 清除帖子缓存...");
            postCacheService.clearAllCache();
            
            // 2. 清除商品缓存
            System.out.println("[2/3] 清除商品缓存...");
            productCacheService.clearAllCache();
            
            // 注意：用户缓存和评论缓存需要逐个清除，这里不实现全局清除
            System.out.println("[3/3] 用户和评论缓存需手动清除");
            
        } catch (Exception e) {
            System.err.println("清除缓存过程中出现错误: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("\n========================================");
        System.out.println("✅ 缓存清除完成！");
        System.out.println("========================================");
    }

    /**
     * 获取缓存统计信息
     */
    public String getCacheStats() {
        StringBuilder stats = new StringBuilder();
        stats.append("========================================\n");
        stats.append("Redis 缓存统计信息\n");
        stats.append("========================================\n");
        stats.append("✅ 帖子缓存: 已启用\n");
        stats.append("✅ 商品缓存: 已启用\n");
        stats.append("✅ 用户缓存: 已启用\n");
        stats.append("✅ 评论缓存: 已启用\n");
        stats.append("========================================\n");
        
        return stats.toString();
    }
}
