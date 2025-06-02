package com.example.deeptalk.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TokenBlacklistService {
    
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    
    public void addToBlacklist(String token, long expirationTime) {
        blacklist.put(token, expirationTime);
        
        // 计算token的剩余有效期
        long delay = expirationTime - System.currentTimeMillis();
        if (delay > 0) {
            // 在token过期时自动从黑名单中移除
            scheduler.schedule(() -> blacklist.remove(token), delay, TimeUnit.MILLISECONDS);
        }
    }
    
    public boolean isBlacklisted(String token) {
        Long expirationTime = blacklist.get(token);
        if (expirationTime == null) {
            return false;
        }
        
        // 如果token已过期，从黑名单中移除
        if (System.currentTimeMillis() > expirationTime) {
            blacklist.remove(token);
            return false;
        }
        
        return true;
    }
} 