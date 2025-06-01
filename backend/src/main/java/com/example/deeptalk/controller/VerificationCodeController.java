package com.example.deeptalk.controller;

import com.example.deeptalk.service.VerificationCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/verification")
@CrossOrigin(origins = "*")
public class VerificationCodeController {
    
    @Autowired
    private VerificationCodeService verificationCodeService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("邮箱不能为空");
        }
        
        try {
            verificationCodeService.sendVerificationCode(email);
            return ResponseEntity.ok().body("验证码已发送");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("验证码发送失败：" + e.getMessage());
        }
    }
    
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        
        if (email == null || email.isEmpty() || code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("邮箱和验证码不能为空");
        }
        
        boolean isValid = verificationCodeService.verifyCode(email, code);
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        
        return ResponseEntity.ok(response);
    }
} 