package com.example.deeptalk.modules.shop.service;

import com.example.deeptalk.modules.shop.entity.Product;
import com.example.deeptalk.modules.shop.repository.ProductRepository;
import com.example.deeptalk.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品缓存服务
 * 提供商品相关的缓存功能
 */
@Service
public class ProductCacheService {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private ProductRepository productRepository;

    // 缓存 key 前缀
    private static final String PRODUCT_DETAIL_PREFIX = "product:detail:";
    private static final String PRODUCT_LIST_KEY = "product:list:all";
    private static final String PRODUCT_SEARCH_PREFIX = "product:search:";

    // 缓存过期时间（秒）
    private static final long PRODUCT_DETAIL_EXPIRE = 1800; // 30分钟
    private static final long PRODUCT_LIST_EXPIRE = 600;    // 10分钟
    private static final long PRODUCT_SEARCH_EXPIRE = 300;  // 5分钟

    /**
     * 获取所有商品（带缓存）
     */
    public List<Product> getAllProducts() {
        // 1. 尝试从缓存获取
        Object cached = redisUtil.get(PRODUCT_LIST_KEY);
        if (cached != null) {
            System.out.println("从缓存获取商品列表");
            return (List<Product>) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询商品列表");
        List<Product> products = productRepository.findAll();

        // 3. 存入缓存
        if (!products.isEmpty()) {
            redisUtil.set(PRODUCT_LIST_KEY, products, PRODUCT_LIST_EXPIRE);
        }

        return products;
    }

    /**
     * 根据 ID 获取商品详情（带缓存）
     */
    public Product getProductById(Long id) {
        // 1. 尝试从缓存获取
        String cacheKey = PRODUCT_DETAIL_PREFIX + id;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取商品详情: " + id);
            return (Product) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询商品详情: " + id);
        Product product = productRepository.findById(id).orElse(null);

        // 3. 存入缓存
        if (product != null) {
            redisUtil.set(cacheKey, product, PRODUCT_DETAIL_EXPIRE);
        } else {
            // 防止缓存穿透：空值也缓存（短时间）
            redisUtil.set(cacheKey, "NULL", 60);
        }

        return product;
    }

    /**
     * 搜索商品（带缓存）
     */
    public List<Product> searchProducts(String keyword) {
        // 空关键词直接返回所有商品
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }

        // 1. 尝试从缓存获取
        String cacheKey = PRODUCT_SEARCH_PREFIX + keyword.toLowerCase();
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取搜索结果: " + keyword);
            return (List<Product>) cached;
        }

        // 2. 从数据库搜索
        System.out.println("从数据库搜索商品: " + keyword);
        List<Product> products = productRepository.searchProducts(keyword);

        // 3. 存入缓存
        redisUtil.set(cacheKey, products, PRODUCT_SEARCH_EXPIRE);

        return products;
    }

    /**
     * 清除商品相关的所有缓存
     */
    public void clearAllCache() {
        // 清除商品列表缓存
        redisUtil.del(PRODUCT_LIST_KEY);
        
        // 清除商品详情缓存（通过模式匹配）
        // 注意：这个操作在生产环境中要谨慎使用
        System.out.println("清除所有商品缓存");
    }

    /**
     * 清除单个商品的缓存
     */
    public void clearProductCache(Long productId) {
        String cacheKey = PRODUCT_DETAIL_PREFIX + productId;
        redisUtil.del(cacheKey);
        // 同时清除列表缓存，因为商品信息可能已更新
        redisUtil.del(PRODUCT_LIST_KEY);
        System.out.println("清除商品缓存: " + productId);
    }

    /**
     * 缓存预热：将热门商品提前加载到缓存
     */
    public void warmUpCache() {
        System.out.println("开始商品缓存预热...");
        
        // 1. 预热商品列表
        List<Product> allProducts = productRepository.findAll();
        redisUtil.set(PRODUCT_LIST_KEY, allProducts, PRODUCT_LIST_EXPIRE);
        System.out.println("已缓存商品列表: " + allProducts.size() + " 个商品");
        
        // 2. 预热前10个商品的详情
        int count = Math.min(10, allProducts.size());
        for (int i = 0; i < count; i++) {
            Product product = allProducts.get(i);
            String cacheKey = PRODUCT_DETAIL_PREFIX + product.getId();
            redisUtil.set(cacheKey, product, PRODUCT_DETAIL_EXPIRE);
        }
        System.out.println("已缓存前 " + count + " 个商品详情");
        
        System.out.println("商品缓存预热完成！");
    }
}
