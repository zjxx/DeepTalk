package com.example.deeptalk.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class WebSocketInitializer implements CommandLineRunner {

    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${websocket.endpoint:/chat}")
    private String endpoint;

    @Override
    public void run(String... args) {
        System.out.println("WebSocket服务已启动在 ws://localhost:" + serverPort + endpoint);
    }
} 