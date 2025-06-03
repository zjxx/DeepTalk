package com.example.deeptalk.modules.auth.controller;

import com.example.deeptalk.modules.auth.entity.User;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.service.VerificationCodeService;
import com.example.deeptalk.service.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private VerificationCodeService verificationCodeService;
    
    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired
    private SecretKey jwtSecretKey;

    @Value("${jwt.expiration.normal}")
    private long normalExpiration;

    @Value("${jwt.expiration.remember-me}")
    private long rememberMeExpiration;

    @PostMapping("/register/check")
    public ResponseEntity<?> checkAndSendCode(@RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("邮箱已被注册");
        }

        try {
            verificationCodeService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok("验证码已发送");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("验证码发送失败：" + e.getMessage());
        }
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> registerWithVerification(@RequestBody RegisterWithVerificationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("用户名已存在");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("邮箱已被注册");
        }

        // 验证验证码
        if (!verificationCodeService.verifyCode(request.getEmail(), request.getVerificationCode())) {
            return ResponseEntity.badRequest().body("验证码错误或已过期");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());

        userRepository.save(user);
        return ResponseEntity.ok("注册成功");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("邮箱或密码错误");
        }

        // 生成JWT token
        long expiration = request.isRememberMe() ? rememberMeExpiration : normalExpiration;
        String token = generateToken(user, expiration);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("expiration", new Date(System.currentTimeMillis() + expiration));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        try {
            // 从Authorization头中提取token
            String token = authHeader.replace("Bearer ", "");
            
            // 解析token获取过期时间
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecretKey)
                    .parseClaimsJws(token)
                    .getBody();
            
            Date expiration = claims.getExpiration();
            
            // 将token加入黑名单
            tokenBlacklistService.addToBlacklist(token, expiration.getTime());
            
            return ResponseEntity.ok("登出成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("登出失败：" + e.getMessage());
        }
    }

    @PostMapping("/forgot-password/send-code")
    public ResponseEntity<?> sendResetCode(@RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("该邮箱未注册");
        }

        try {
            verificationCodeService.sendVerificationCode(request.getEmail());
            return ResponseEntity.ok("验证码已发送");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("验证码发送失败：" + e.getMessage());
        }
    }

    @PostMapping("/forgot-password/verify-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody VerifyResetCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.badRequest().body("该邮箱未注册");
        }

        // 验证验证码
        if (!verificationCodeService.verifyCode(request.getEmail(), request.getVerificationCode())) {
            return ResponseEntity.badRequest().body("验证码错误或已过期");
        }

        // 生成一个临时token用于后续密码重置
        String resetToken = generateToken(user, 900000); // 15分钟有效期
        
        Map<String, Object> response = new HashMap<>();
        response.put("resetToken", resetToken);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordWithTokenRequest request) {
        try {
            // 验证token
            Claims claims = Jwts.parser()
                    .setSigningKey(jwtSecretKey)
                    .parseClaimsJws(request.getResetToken())
                    .getBody();
            
            String email = claims.getSubject();
            User user = userRepository.findByEmail(email)
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("用户不存在");
            }

            // 更新密码
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            return ResponseEntity.ok("密码重置成功");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("重置密码失败：" + e.getMessage());
        }
    }

    private String generateToken(User user, long expiration) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("username", user.getUsername())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(jwtSecretKey)
                .compact();
    }
}

@Data
class RegisterRequest {
    private String username;
    private String password;
    private String email;
}

@Data
class RegisterWithVerificationRequest {
    private String username;
    private String password;
    private String email;
    private String verificationCode;
}

@Data
class LoginRequest {
    private String email;
    private String password;
    private boolean rememberMe;
}

@Data
class ForgotPasswordRequest {
    private String email;
}

@Data
class VerifyResetCodeRequest {
    private String email;
    private String verificationCode;
}

@Data
class ResetPasswordWithTokenRequest {
    private String resetToken;
    private String newPassword;
} 