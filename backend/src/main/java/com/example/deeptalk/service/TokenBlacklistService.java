package com.example.deeptalk.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    public void addToBlacklist(String token, long expirationTime) {
        blacklist.put(token, expirationTime);
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

    public void removeFromBlacklist(String token) {
        blacklist.remove(token);
    }
} 