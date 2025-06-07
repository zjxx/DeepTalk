package com.example.deeptalk.modules.speech.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NonNull;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Base64;

@Slf4j
@Component
public class SpeechWebSocketHandler extends AbstractWebSocketHandler {

    @Getter
    private final ForwardingService forwardingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SpeechWebSocketHandler(ForwardingService forwardingService) {
        this.forwardingService = forwardingService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession wsSession) {
        // 连接建立后，处理器本身不做任何事，等待客户端发送身份信息
        log.info("[SpeechWebSocketHandler] 处理器: 新连接 {} 已建立，等待客户端注册...", wsSession.getId());
    }

    @Override
    protected void handleTextMessage(@NonNull WebSocketSession wsSession, TextMessage message) throws Exception {
        try {
            // 使用Map来接收JSON数据
            Map<String, Object> jsonMap = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) jsonMap.get("type");

            if ("register".equals(type)) {
                String userId = (String) jsonMap.get("userId");
                String sessionId = (String) jsonMap.get("sessionId");
                if (userId != null) {
                    forwardingService.registerUserSession(userId, sessionId, wsSession);
                    log.info("[SpeechWebSocketHandler] 用户注册成功: userId={}, sessionId={}", userId, sessionId);
                }
            }
        } catch (IOException e) {
            log.error("[SpeechWebSocketHandler] 无法解析消息: {}, payload={}", wsSession.getId(), message.getPayload(), e);
        }
    }

    /**
     * 处理二进制消息（音频流），直接委托给服务层处理。
     */
    @Override
    protected void handleBinaryMessage(WebSocketSession wsSession, BinaryMessage message) {
        // 将转发任务委托给服务层
        log.info("[SpeechWebSocketHandler] 收到二进制消息: {}", wsSession.getId());
        forwardingService.forwardAudioStream(wsSession.getId(), message.getPayload().array());
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession wsSession, @NonNull CloseStatus status) {
        // 将清理任务委托给服务层
        forwardingService.removeUserSession(wsSession);
        System.out.println("处理器: 连接 " + wsSession.getId() + " 已关闭。");
    }

    @Override
    public void handleTransportError(WebSocketSession wsSession, Throwable exception) throws Exception {
        System.err.println("处理器: 连接 " + wsSession.getId() + " 发生传输错误: " + exception.getMessage());
        wsSession.close(CloseStatus.SERVER_ERROR);
    }

}
