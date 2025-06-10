package com.example.deeptalk.modules.auth.controller;

import com.example.deeptalk.modules.auth.entity.User;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.service.VerificationCodeService;
import com.example.deeptalk.service.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private VerificationCodeService verificationCodeService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private SecretKey jwtSecretKey;

    private User testUser;
    private String validToken;
    private SecretKey testKey;

    // 内部类定义
    private static class LoginRequest {
        private String email;
        private String password;
        private boolean rememberMe;

        public LoginRequest(String email, String password, boolean rememberMe) {
            this.email = email;
            this.password = password;
            this.rememberMe = rememberMe;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public boolean isRememberMe() { return rememberMe; }
        public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
    }

    private static class RegisterRequest {
        private String username;
        private String password;
        private String email;

        public RegisterRequest(String username, String password, String email) {
            this.username = username;
            this.password = password;
            this.email = email;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    private static class RegisterWithVerificationRequest {
        private String username;
        private String password;
        private String email;
        private String verificationCode;

        public RegisterWithVerificationRequest(String username, String password, String email, String verificationCode) {
            this.username = username;
            this.password = password;
            this.email = email;
            this.verificationCode = verificationCode;
        }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getVerificationCode() { return verificationCode; }
        public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    }

    private static class ForgotPasswordRequest {
        private String email;

        public ForgotPasswordRequest(String email) {
            this.email = email;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    private static class VerifyResetCodeRequest {
        private String email;
        private String verificationCode;

        public VerifyResetCodeRequest(String email, String verificationCode) {
            this.email = email;
            this.verificationCode = verificationCode;
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getVerificationCode() { return verificationCode; }
        public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    }

    private static class ResetPasswordWithTokenRequest {
        private String resetToken;
        private String newPassword;

        public ResetPasswordWithTokenRequest(String resetToken, String newPassword) {
            this.resetToken = resetToken;
            this.newPassword = newPassword;
        }

        public String getResetToken() { return resetToken; }
        public void setResetToken(String resetToken) { this.resetToken = resetToken; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");

        // 生成一个有效的JWT密钥
        testKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        
        // 生成一个有效的测试token
        validToken = Jwts.builder()
                .setSubject(testUser.getEmail())
                .claim("username", testUser.getUsername())
                .claim("userId", testUser.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1小时后过期
                .signWith(testKey)
                .compact();
    }

    @Test
    void loginSuccess() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        
        // 正确mock jwtSecretKey
        when(jwtSecretKey.getAlgorithm()).thenReturn("HmacSHA256");
        when(jwtSecretKey.getEncoded()).thenReturn(testKey.getEncoded());
        when(jwtSecretKey.getFormat()).thenReturn("RAW");

        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("test@example.com", "password123", true));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.expiration").exists());
    }

    @Test
    void loginFailureInvalidCredentials() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("test@example.com", "wrongpassword", false));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("邮箱或密码错误"));
    }

    @Test
    void loginFailureUserNotFound() throws Exception {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        String loginRequest = objectMapper.writeValueAsString(new LoginRequest("nonexistent@example.com", "password123", false));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("邮箱或密码错误"));
    }

    @Test
    void registerCheckSuccess() throws Exception {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        doNothing().when(verificationCodeService).sendVerificationCode(anyString());

        String registerRequest = objectMapper.writeValueAsString(new RegisterRequest("newuser", "password123", "new@example.com"));

        mockMvc.perform(post("/api/auth/register/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerRequest))
                .andExpect(status().isOk())
                .andExpect(content().string("验证码已发送"));
    }

    @Test
    void registerCheckFailureUsernameExists() throws Exception {
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        String registerRequest = objectMapper.writeValueAsString(new RegisterRequest("existinguser", "password123", "new@example.com"));

        mockMvc.perform(post("/api/auth/register/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("用户名已存在"));
    }

    @Test
    void registerCheckFailureEmailExists() throws Exception {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        String registerRequest = objectMapper.writeValueAsString(new RegisterRequest("newuser", "password123", "existing@example.com"));

        mockMvc.perform(post("/api/auth/register/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("邮箱已被注册"));
    }

    @Test
    void logoutSuccess() throws Exception {
        // 正确mock jwtSecretKey
        when(jwtSecretKey.getAlgorithm()).thenReturn("HmacSHA256");
        when(jwtSecretKey.getEncoded()).thenReturn(testKey.getEncoded());
        when(jwtSecretKey.getFormat()).thenReturn("RAW");
        
        // Mock tokenBlacklistService
        doNothing().when(tokenBlacklistService).addToBlacklist(anyString(), anyLong());
        
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isOk())
                .andExpect(content().string("登出成功"));
    }

    @Test
    void registerWithVerificationSuccess() throws Exception {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String registerRequest = objectMapper.writeValueAsString(
            new RegisterWithVerificationRequest("newuser", "password123", "new@example.com", "123456")
        );

        mockMvc.perform(post("/api/auth/register/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerRequest))
                .andExpect(status().isOk())
                .andExpect(content().string("注册成功"));
    }

    @Test
    void registerWithVerificationFailureInvalidCode() throws Exception {
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(false);

        String registerRequest = objectMapper.writeValueAsString(
            new RegisterWithVerificationRequest("newuser", "password123", "new@example.com", "wrongcode")
        );

        mockMvc.perform(post("/api/auth/register/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("验证码错误或已过期"));
    }

    @Test
    void sendResetCodeSuccess() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(verificationCodeService).sendVerificationCode(anyString());

        String forgotPasswordRequest = objectMapper.writeValueAsString(
            new ForgotPasswordRequest("test@example.com")
        );

        mockMvc.perform(post("/api/auth/forgot-password/send-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordRequest))
                .andExpect(status().isOk())
                .andExpect(content().string("验证码已发送"));
    }

    @Test
    void sendResetCodeFailureUserNotFound() throws Exception {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        String forgotPasswordRequest = objectMapper.writeValueAsString(
            new ForgotPasswordRequest("nonexistent@example.com")
        );

        mockMvc.perform(post("/api/auth/forgot-password/send-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(forgotPasswordRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("该邮箱未注册"));
    }

    @Test
    void verifyResetCodeSuccess() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(true);
        when(jwtSecretKey.getAlgorithm()).thenReturn("HmacSHA256");
        when(jwtSecretKey.getEncoded()).thenReturn(testKey.getEncoded());
        when(jwtSecretKey.getFormat()).thenReturn("RAW");

        String verifyRequest = objectMapper.writeValueAsString(
            new VerifyResetCodeRequest("test@example.com", "123456")
        );

        mockMvc.perform(post("/api/auth/forgot-password/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(verifyRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resetToken").exists());
    }

    @Test
    void verifyResetCodeFailureInvalidCode() throws Exception {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(verificationCodeService.verifyCode(anyString(), anyString())).thenReturn(false);

        String verifyRequest = objectMapper.writeValueAsString(
            new VerifyResetCodeRequest("test@example.com", "wrongcode")
        );

        mockMvc.perform(post("/api/auth/forgot-password/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(verifyRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("验证码错误或已过期"));
    }

    @Test
    void resetPasswordSuccess() throws Exception {
        when(jwtSecretKey.getAlgorithm()).thenReturn("HmacSHA256");
        when(jwtSecretKey.getEncoded()).thenReturn(testKey.getEncoded());
        when(jwtSecretKey.getFormat()).thenReturn("RAW");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String resetRequest = objectMapper.writeValueAsString(
            new ResetPasswordWithTokenRequest(validToken, "newPassword123")
        );

        mockMvc.perform(post("/api/auth/forgot-password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(resetRequest))
                .andExpect(status().isOk())
                .andExpect(content().string("密码重置成功"));
    }

    @Test
    void resetPasswordFailureInvalidToken() throws Exception {
        String invalidToken = "invalid.token.here";

        String resetRequest = objectMapper.writeValueAsString(
            new ResetPasswordWithTokenRequest(invalidToken, "newPassword123")
        );

        mockMvc.perform(post("/api/auth/forgot-password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(resetRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(org.hamcrest.Matchers.startsWith("重置密码失败：")));
    }
} 