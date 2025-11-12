package com.example.deeptalk.modules.auth.service;

import com.example.deeptalk.modules.auth.entity.User;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 用户信息缓存服务
 * 提供用户基本信息的缓存功能
 * 注意：不缓存敏感信息（如密码）
 */
@Service
public class UserCacheService {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private UserRepository userRepository;

    // 缓存 key 前缀
    private static final String USER_INFO_PREFIX = "user:info:";
    private static final String USER_BY_USERNAME_PREFIX = "user:username:";

    // 缓存过期时间（秒）
    private static final long USER_INFO_EXPIRE = 1800; // 30分钟

    /**
     * 根据用户ID获取用户基本信息（不含密码）
     */
    public Map<String, Object> getUserInfo(Long userId) {
        // 1. 尝试从缓存获取
        String cacheKey = USER_INFO_PREFIX + userId;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取用户信息: " + userId);
            return (Map<String, Object>) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询用户信息: " + userId);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            // 防止缓存穿透
            redisUtil.set(cacheKey, "NULL", 60);
            return null;
        }

        User user = userOpt.get();
          // 3. 构建用户信息（不包含密码）
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("username", user.getUsername());
        userInfo.put("email", maskEmail(user.getEmail())); // 脱敏邮箱
        userInfo.put("role", user.getRole());
        userInfo.put("avatar", user.getAvatar()); // 添加头像信息

        // 4. 存入缓存
        redisUtil.set(cacheKey, userInfo, USER_INFO_EXPIRE);

        return userInfo;
    }

    /**
     * 根据用户名获取用户ID
     */
    public Long getUserIdByUsername(String username) {
        // 1. 尝试从缓存获取
        String cacheKey = USER_BY_USERNAME_PREFIX + username;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取用户ID: " + username);
            return cached.equals("NULL") ? null : (Long) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询用户ID: " + username);
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            // 防止缓存穿透
            redisUtil.set(cacheKey, "NULL", 60);
            return null;
        }

        Long userId = userOpt.get().getId();
        
        // 3. 存入缓存
        redisUtil.set(cacheKey, userId, USER_INFO_EXPIRE);

        return userId;
    }

    /**
     * 清除用户缓存
     */
    public void clearUserCache(Long userId, String username) {
        String infoKey = USER_INFO_PREFIX + userId;
        String usernameKey = USER_BY_USERNAME_PREFIX + username;
        
        redisUtil.del(infoKey);
        redisUtil.del(usernameKey);
        
        System.out.println("已清除用户缓存: " + userId);
    }

    /**
     * 清除用户缓存（仅通过ID）
     */
    public void clearUserCache(Long userId) {
        String infoKey = USER_INFO_PREFIX + userId;
        redisUtil.del(infoKey);
        System.out.println("已清除用户缓存: " + userId);
    }

    /**
     * 邮箱脱敏处理
     * 例如：user@example.com -> u***@example.com
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email;
        }
        
        String[] parts = email.split("@");
        String username = parts[0];
        String domain = parts[1];
        
        if (username.length() <= 1) {
            return email;
        }
        
        String maskedUsername = username.charAt(0) + "***";
        return maskedUsername + "@" + domain;
    }

    /**
     * 缓存预热：将活跃用户信息提前加载到缓存
     */
    public void warmUpCache() {
        System.out.println("开始用户缓存预热...");
        
        // 预热前100个用户
        // 注意：这里简单处理，实际应该根据活跃度或其他指标选择用户
        var users = userRepository.findAll();
        int count = Math.min(100, users.size());
        
        for (int i = 0; i < count; i++) {
            User user = users.get(i);
              // 缓存用户信息
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", maskEmail(user.getEmail()));
            userInfo.put("role", user.getRole());
            userInfo.put("avatar", user.getAvatar()); // 添加头像信息
            
            String infoKey = USER_INFO_PREFIX + user.getId();
            redisUtil.set(infoKey, userInfo, USER_INFO_EXPIRE);
            
            // 缓存用户名到ID的映射
            String usernameKey = USER_BY_USERNAME_PREFIX + user.getUsername();
            redisUtil.set(usernameKey, user.getId(), USER_INFO_EXPIRE);
        }
        
        System.out.println("已缓存 " + count + " 个用户信息");
        System.out.println("用户缓存预热完成！");
    }
}
