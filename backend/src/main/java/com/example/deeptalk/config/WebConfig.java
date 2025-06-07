package com.example.deeptalk.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Autowired
    private JwtAuthenticationInterceptor jwtAuthenticationInterceptor;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtAuthenticationInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns(
                    "/api/**",
                    "/api/auth/register/**",
                    "/api/auth/forgot-password/**",
                    "/api/verification/**",
                    "/api/speech/**"
                );
    }

    // 生产环境的 WebSocket 配置
    @Bean
    @Profile("!test")
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxBinaryMessageBufferSize(10 * 1024 * 1024);
        container.setMaxTextMessageBufferSize(10 * 1024 * 1024);
        return container;
    }

    // 测试环境的 WebSocket 配置
    @Bean
    @Profile("test")
    public ServletServerContainerFactoryBean mockWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        // 在测试环境中使用较小的缓冲区大小
        container.setMaxBinaryMessageBufferSize(1024 * 1024); // 1MB
        container.setMaxTextMessageBufferSize(1024 * 1024);   // 1MB
        return container;
    }
} 