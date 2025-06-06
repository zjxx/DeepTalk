package com.example.deeptalk.modules.speech.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

import java.io.IOException;

@Slf4j
@Component
public class SpeechWebSocketHandler extends AbstractWebSocketHandler {

    @Getter
    private final ForwardingService forwardingService;
    private final ObjectMapper objectMapper = new ObjectMapper(); // 推荐使用Jackson来解析JSON

    public SpeechWebSocketHandler(ForwardingService forwardingService) {
        this.forwardingService = forwardingService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession wsSession) {
        // 连接建立后，处理器本身不做任何事，等待客户端发送身份信息
        log.info("[SpeechWebSocketHandler] 处理器: 新连接 {} 已建立，等待客户端注册...", wsSession.getId());
    }

    /**
     * 处理文本消息，主要用于客户端注册身份。
     */
    @Override
    protected void handleTextMessage(@NonNull WebSocketSession wsSession, TextMessage message) throws Exception {
        // 约定客户端发送 {"type": "register", "userId": "someUserId"} 格式的JSON
        try {
            JsonObject jsonObject = objectMapper.readValue(message.getPayload(), JsonObject.class);
            String type = jsonObject.get("type").getAsString();
            String userId = jsonObject.has("userId") ? jsonObject.get("userId").getAsString() : null;
            String sessionId = jsonObject.has("sessionId") ? jsonObject.get("sessionId").getAsString() : null;

            if ("register".equals(type) && userId != null) {
                // 将注册任务委托给服务层
                forwardingService.registerUserSession(userId, sessionId, wsSession);
            }
        } catch (IOException e) {
//            System.err.println("处理器: 无法解析注册消息: " + message.getPayload());
            log.error("[SpeechWebSocketHandler] 无法解析注册信息: {}", wsSession.getId(), e);
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