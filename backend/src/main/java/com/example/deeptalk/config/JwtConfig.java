package com.example.deeptalk.config;

import io.jsonwebtoken.security.Keys;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {
    
    @Bean
    public SecretKey jwtSecretKey() {
        return Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
    }
} 