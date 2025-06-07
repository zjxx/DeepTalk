package com.example.deeptalk.modules.speech.config;

import com.example.deeptalk.modules.speech.service.ForwardingService;
import com.example.deeptalk.modules.speech.service.SpeechWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@EnableWebSocket
@Configuration
public class SpeechWebSocketConfig implements WebSocketConfigurer {
    // 这里可以实现WebSocketConfigurer的具体方法
    // 例如：registerWebSocketHandlers等
    public static final SpeechWebSocketHandler speechWebSocketHandler = new SpeechWebSocketHandler(new ForwardingService());

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册WebSocket处理器，并允许所有源
        registry.addHandler(speechWebSocketHandler, "/api/speech/ws")
                .setAllowedOrigins("*");
    }
}
