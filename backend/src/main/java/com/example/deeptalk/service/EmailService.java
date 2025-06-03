package com.example.deeptalk.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    private static final String FROM_EMAIL = "1602113776@qq.com"; // 替换为您的QQ邮箱
    
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 生成6位数字验证码
        return String.valueOf(code);
    }
    
    public void sendVerificationCode(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(FROM_EMAIL);
        message.setTo(toEmail);
        message.setSubject("验证码 - DeepTalk");
        message.setText("您的验证码是: " + code + "\n\n验证码有效期为5分钟，请勿泄露给他人。");
        
        mailSender.send(message);
    }
} 