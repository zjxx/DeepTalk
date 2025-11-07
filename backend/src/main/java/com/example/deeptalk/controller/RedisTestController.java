package com.example.deeptalk.controller;

import com.example.deeptalk.service.RedisExampleService;
import com.example.deeptalk.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Redis测试控制器
 * 用于测试Redis功能是否正常工作
 */
@RestController
@RequestMapping("/api/redis")
public class RedisTestController {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private RedisExampleService redisExampleService;

    /**
     * 测试Redis连接
     */
    @GetMapping("/test")
    public Map<String, Object> testRedis() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 测试基本的set和get操作
            String testKey = "test:connection";
            String testValue = "Redis连接成功！时间戳：" + System.currentTimeMillis();
            
            redisUtil.set(testKey, testValue, 60); // 60秒后过期
            Object value = redisUtil.get(testKey);
            
            result.put("success", true);
            result.put("message", "Redis连接测试成功");
            result.put("testKey", testKey);
            result.put("testValue", value);
            result.put("ttl", redisUtil.getExpire(testKey) + "秒");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Redis连接失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 测试缓存用户信息
     */
    @PostMapping("/cache-user")
    public Map<String, Object> cacheUser(@RequestParam Long userId,
                                         @RequestParam String username,
                                         @RequestParam String email) {
        Map<String, Object> result = new HashMap<>();
        try {
            redisExampleService.cacheUserInfo(userId, username, email);
            result.put("success", true);
            result.put("message", "用户信息已缓存");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "缓存失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 测试获取缓存的用户信息
     */
    @GetMapping("/get-user/{userId}")
    public Map<String, Object> getUser(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<Object, Object> userInfo = redisExampleService.getUserInfo(userId);
            if (userInfo != null && !userInfo.isEmpty()) {
                result.put("success", true);
                result.put("userInfo", userInfo);
            } else {
                result.put("success", false);
                result.put("message", "未找到用户缓存");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 测试验证码功能
     */
    @PostMapping("/send-code")
    public Map<String, Object> sendCode(@RequestParam String email) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 生成6位随机验证码
            String code = String.format("%06d", (int)(Math.random() * 1000000));
            redisExampleService.cacheVerificationCode(email, code);
            
            result.put("success", true);
            result.put("message", "验证码已发送（实际开发中应发送到邮箱）");
            result.put("code", code); // 实际开发中不应返回验证码
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "发送失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 测试验证码验证
     */
    @PostMapping("/verify-code")
    public Map<String, Object> verifyCode(@RequestParam String email,
                                          @RequestParam String code) {
        Map<String, Object> result = new HashMap<>();
        boolean isValid = redisExampleService.verifyCode(email, code);
        result.put("success", isValid);
        result.put("message", isValid ? "验证码正确" : "验证码错误或已过期");
        return result;
    }

    /**
     * 测试在线用户功能
     */
    @PostMapping("/user-online/{userId}")
    public Map<String, Object> setUserOnline(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            redisExampleService.addOnlineUser(userId);
            result.put("success", true);
            result.put("message", "用户已设置为在线");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "操作失败: " + e.getMessage());
        }
        return result;
    }

    /**
     * 检查用户是否在线
     */
    @GetMapping("/user-online/{userId}")
    public Map<String, Object> checkUserOnline(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        boolean isOnline = redisExampleService.isUserOnline(userId);
        result.put("userId", userId);
        result.put("isOnline", isOnline);
        return result;
    }

    /**
     * 删除指定的缓存
     */
    @DeleteMapping("/delete/{key}")
    public Map<String, Object> deleteCache(@PathVariable String key) {
        Map<String, Object> result = new HashMap<>();
        try {
            redisUtil.del(key);
            result.put("success", true);
            result.put("message", "缓存已删除");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "删除失败: " + e.getMessage());
        }
        return result;
    }
}
