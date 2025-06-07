package com.example.deeptalk.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Profile;

@TestConfiguration
@Profile("test")
public class TestConfig {
    // 测试配置类，目前不需要特殊配置
} 