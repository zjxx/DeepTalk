package com.example.deeptalk.service;

import com.example.deeptalk.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Redis使用示例Service
 * 演示如何在业务代码中使用Redis
 */
@Service
public class RedisExampleService {

    @Autowired
    private RedisUtil redisUtil;

    /**
     * 示例1: 缓存用户信息
     */
    public void cacheUserInfo(Long userId, String username, String email) {
        String key = "user:" + userId;
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("username", username);
        userMap.put("email", email);
        
        // 缓存用户信息，过期时间为1小时
        redisUtil.hmset(key, userMap, 3600);
    }

    /**
     * 示例2: 获取缓存的用户信息
     */
    public Map<Object, Object> getUserInfo(Long userId) {
        String key = "user:" + userId;
        return redisUtil.hmget(key);
    }

    /**
     * 示例3: 缓存验证码
     */
    public void cacheVerificationCode(String email, String code) {
        String key = "verification:" + email;
        // 验证码5分钟过期
        redisUtil.set(key, code, 300);
    }

    /**
     * 示例4: 验证验证码
     */
    public boolean verifyCode(String email, String code) {
        String key = "verification:" + email;
        Object cachedCode = redisUtil.get(key);
        if (cachedCode != null && cachedCode.toString().equals(code)) {
            // 验证成功后删除验证码
            redisUtil.del(key);
            return true;
        }
        return false;
    }

    /**
     * 示例5: 记录用户登录次数（计数器）
     */
    public void incrementLoginCount(Long userId) {
        String key = "login:count:" + userId;
        redisUtil.incr(key, 1);
    }

    /**
     * 示例6: 获取用户登录次数
     */
    public long getLoginCount(Long userId) {
        String key = "login:count:" + userId;
        Object count = redisUtil.get(key);
        return count != null ? Long.parseLong(count.toString()) : 0;
    }

    /**
     * 示例7: 缓存在线用户列表（使用Set）
     */
    public void addOnlineUser(Long userId) {
        redisUtil.sSet("online:users", userId);
    }

    /**
     * 示例8: 移除在线用户
     */
    public void removeOnlineUser(Long userId) {
        redisUtil.setRemove("online:users", userId);
    }

    /**
     * 示例9: 检查用户是否在线
     */
    public boolean isUserOnline(Long userId) {
        return redisUtil.sHasKey("online:users", userId);
    }

    /**
     * 示例10: 缓存最近消息列表（使用List）
     */
    public void cacheRecentMessage(String message) {
        String key = "recent:messages";
        redisUtil.lSet(key, message);
        
        // 只保留最近100条消息
        long size = redisUtil.lGetListSize(key);
        if (size > 100) {
            redisUtil.lRemove(key, 1, redisUtil.lGetIndex(key, 0));
        }
    }
}
