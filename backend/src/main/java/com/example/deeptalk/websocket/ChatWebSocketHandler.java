package com.example.deeptalk.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, WebSocketSession> CONNECTED_CLIENTS = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // 注册新的客户端连接
        CONNECTED_CLIENTS.put(session.getId(), session);
        
        // 发送欢迎消息
        ChatMessage welcomeMessage = new ChatMessage();
        welcomeMessage.setType("system");
        welcomeMessage.setContent("欢迎连接到WebSocket服务器！");
        welcomeMessage.setTime(LocalDateTime.now().format(DATE_FORMATTER));
        sendMessage(session, welcomeMessage);
        
        // 广播新用户加入消息
        ChatMessage joinMessage = new ChatMessage();
        joinMessage.setType("system");
        joinMessage.setContent("新用户已加入聊天室");
        joinMessage.setTime(LocalDateTime.now().format(DATE_FORMATTER));
        broadcastMessage(joinMessage);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            // 尝试解析消息为JSON
            ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);
            chatMessage.setTime(LocalDateTime.now().format(DATE_FORMATTER));
            broadcastMessage(chatMessage);
        } catch (Exception e) {
            // 如果解析失败，直接发送原始消息
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setType("message");
            chatMessage.setContent(payload);
            chatMessage.setTime(LocalDateTime.now().format(DATE_FORMATTER));
            broadcastMessage(chatMessage);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 注销客户端连接
        CONNECTED_CLIENTS.remove(session.getId());
        
        // 广播用户离开消息
        ChatMessage leaveMessage = new ChatMessage();
        leaveMessage.setType("system");
        leaveMessage.setContent("用户已离开聊天室");
        leaveMessage.setTime(LocalDateTime.now().format(DATE_FORMATTER));
        broadcastMessage(leaveMessage);
    }

    private void sendMessage(WebSocketSession session, ChatMessage message) throws IOException {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }

    private void broadcastMessage(ChatMessage message) {
        CONNECTED_CLIENTS.values().forEach(session -> {
            try {
                sendMessage(session, message);
            } catch (IOException e) {
                // 忽略发送失败的异常
            }
        });
    }
} 