package com.example.deeptalk.config;

import com.example.deeptalk.security.JwtTokenProvider;
import com.example.deeptalk.service.TokenBlacklistService;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import javax.crypto.SecretKey;

@TestConfiguration
public class TestConfig {
    
    @Bean
    @Primary
    public TokenBlacklistService tokenBlacklistService() {
        return new TokenBlacklistService();
    }

    @Bean
    @Primary
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider();
    }

    @Bean
    @Primary
    public SecretKey jwtSecretKey() {
        return Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }
} 