package com.example.deeptalk.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

@TestConfiguration
public class TestConfig {
    
    @Bean
    @Primary
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        // 在测试环境中使用较小的缓冲区大小
        container.setMaxBinaryMessageBufferSize(1024);
        container.setMaxTextMessageBufferSize(1024);
        return container;
    }
} 