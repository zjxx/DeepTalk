package com.example.deeptalk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class VerificationCodeService {
    
    @Autowired
    private EmailService emailService;
    
    // 存储邮箱和验证码的映射关系
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();
    // 存储邮箱和验证码过期时间的映射关系
    private final Map<String, Long> codeExpirationTimes = new ConcurrentHashMap<>();
    
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    
    public void sendVerificationCode(String email) {
        String code = emailService.generateVerificationCode();
        verificationCodes.put(email, code);
        codeExpirationTimes.put(email, System.currentTimeMillis() + 5 * 60 * 1000); // 5分钟有效期
        
        // 发送验证码邮件
        emailService.sendVerificationCode(email, code);
        
        // 5分钟后自动删除验证码
        scheduler.schedule(() -> {
            verificationCodes.remove(email);
            codeExpirationTimes.remove(email);
        }, 5, TimeUnit.MINUTES);
    }
    
    public boolean verifyCode(String email, String code) {
        String storedCode = verificationCodes.get(email);
        Long expirationTime = codeExpirationTimes.get(email);
        
        if (storedCode == null || expirationTime == null) {
            return false;
        }
        
        // 检查验证码是否过期
        if (System.currentTimeMillis() > expirationTime) {
            verificationCodes.remove(email);
            codeExpirationTimes.remove(email);
            return false;
        }
        
        return storedCode.equals(code);
    }
} 