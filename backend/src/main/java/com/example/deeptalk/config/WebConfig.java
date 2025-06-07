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

    // Config for max WebSocket message buffer size
    @Bean
    @Profile("!test") // 仅在非测试环境中生效
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();

        // 关键配置：在这里设置缓冲区大小
        // 将二进制消息（如音频流）的缓冲区大小设置为 10MB
        container.setMaxBinaryMessageBufferSize(10 * 1024 * 1024);

        // 将文本消息的缓冲区大小设置为 10MB
        container.setMaxTextMessageBufferSize(10 * 1024 * 1024);

        // 如果需要，还可以设置其他参数，例如空闲超时时间（毫秒）
        // container.setMaxSessionIdleTimeout(15 * 60000L);

        return container;
    }
} 