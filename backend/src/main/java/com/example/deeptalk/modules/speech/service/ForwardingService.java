package com.example.deeptalk.modules.speech.service;

import com.example.deeptalk.modules.speech.entity.SpeechSessionInfo;
import com.example.deeptalk.modules.speech.entity.SpeechUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ForwardingService {
    // 用于存储用户会话信息, wsSessionId -> SpeechUserInfo
    private final ConcurrentHashMap<String, SpeechUserInfo> connectedUsers = new ConcurrentHashMap<>();
    // 用于存储语音会话信息, sessionId -> SpeechSessionInfo
    private final ConcurrentHashMap<String, SpeechSessionInfo> activeSessions = new ConcurrentHashMap<>();

    // 实例化并持有RecordingHandler的引用
    private final RecordingHandler recordingHandler = new RecordingHandler();

    public SpeechSessionInfo makeConnection(String user1Id, String user2Id) {
        String sessionId = java.util.UUID.randomUUID().toString();
        SpeechSessionInfo session = new SpeechSessionInfo(sessionId, user1Id, user2Id);
        activeSessions.put(sessionId, session);
        log.info("[ForwardingService] 创建新会话: {}，用户1: {}, 用户2: {}", sessionId, user1Id, user2Id);
        return session;
    }

    public void terminateConnection(String sessionId) {
        // 在这里实现终止连接的逻辑
        // 例如：从数据库或缓存中删除会话信息
        log.info("[ForwardingService] 终止会话: {}", sessionId);
        try {
            // 首先结束录制
            recordingHandler.finalizeSessionRecordings(sessionId);
            activeSessions.remove(sessionId);
        } catch (Exception e) {
            log.error("[ForwardingService] 终止会话 {} 时发生错误: {}", sessionId, e.getMessage());
        }
    }

    /**
     * 转发音频流的抽象方法。
     * 你需要在这里填充你自己的具体业务逻辑。
     *
     * @param wsSessionId WebSocket 连接的会话 ID
     * @param audioData 从客户端接收到的音频数据块
     */
    public void forwardAudioStream(String wsSessionId, byte[] audioData) {
        System.out.println("[ForwardingService] 正在处理用户 " + wsSessionId + " 的音频数据，数据长度: " + audioData.length + " 字节");

        // check if the user is registered
        SpeechUserInfo userInfo = connectedUsers.get(wsSessionId);
        if (userInfo == null) {
            log.warn("[ForwardingService] 会话 {} 的用户信息未找到，无法转发音频数据", wsSessionId);
            return; // 用户未注册，无法转发
        }
        // check if the session is active
        SpeechSessionInfo sessionInfo = activeSessions.get(userInfo.getSessionId());
        if (sessionInfo == null) {
            log.warn("[ForwardingService] 会话 {} 的语音会话信息未找到，无法转发音频数据", userInfo.getSessionId());
            return; // 会话未激活，无法转发
        }
        // find the opponent user
        SpeechUserInfo opponentUserInfo = sessionInfo.getOpponentInfo(userInfo.getUserId());
        if (opponentUserInfo == null) {
            log.warn("[ForwardingService] 会话 {} 的对手用户未找到，无法转发音频数据", userInfo.getSessionId());
            return; // 对手用户未找到，无法转发
        }
        // check if the opponent user is registered
        WebSocketSession opponentSession = opponentUserInfo.getWsSession();
        if (opponentSession == null) {
            log.warn("[ForwardingService] 对手用户 {} 的 WebSocket 会话未找到，无法转发音频数据", opponentUserInfo.getUserId());
            return; // 对手用户未注册，无法转发
        }
        if (!opponentSession.isOpen()) {
            log.warn("[ForwardingService] 对手用户 {} 的 WebSocket 会话已关闭，无法转发音频数据", opponentUserInfo.getUserId());
            return; // 对手用户的 WebSocket 会话已关闭，无法转发
        }
        // 转发音频数据到对手用户的 WebSocket 会话
        try {
            // 只记录能够成功转发的音频数据
            // 调用RecordingHandler来记录音频块
            recordingHandler.recordAudioChunk(userInfo.getSessionId(), userInfo.getUserId(), audioData);

            opponentSession.sendMessage(new org.springframework.web.socket.BinaryMessage(audioData));
            log.info("[ForwardingService] 已成功转发音频数据到对手用户 {} 的 WebSocket 会话 {}", opponentUserInfo.getUserId(), opponentUserInfo.getWsSession().getId());
        } catch (Exception e) {
            log.error("[ForwardingService] 转发音频数据到对手用户 {} 的 WebSocket 会话失败: {}", opponentUserInfo.getUserId(), e.getMessage());
        }
    }

    public void registerUserSession(String userId, String sessionId, WebSocketSession wsSession) {
        // 检查用户是否已经注册
        if (connectedUsers.containsKey(wsSession.getId())) {
            log.warn("[ForwardingService] 用户 {} 已经注册到 WebSocket 会话 {}", userId, wsSession.getId());
            return; // 用户已注册，直接返回
        }
        // 从 activeSessions 中获取会话信息
        SpeechSessionInfo sessionInfo = activeSessions.get(sessionId);
        if (sessionInfo == null) {
            log.error("[ForwardingService] 会话 ID {} 未找到，无法注册用户 {}", sessionId, userId);
            return; // 会话未找到，无法注册用户
        }
        // 从 sessionInfo 中获取用户信息
        SpeechUserInfo userInfo = sessionInfo.getUserInfo(userId);
        if (userInfo == null) {
            log.error("[ForwardingService] 用户 ID {} 在会话 {} 中未找到，无法注册", userId, sessionId);
            return; // 用户未找到，无法注册
        }
        // 设置 WebSocket 会话
        userInfo.setWsSession(wsSession);
        // 将用户信息存储到 connectedUsers 中
        connectedUsers.put(wsSession.getId(), userInfo);
        log.info("[ForwardingService] 用户 {} 已注册到 WebSocket 会话 {}", userId, wsSession.getId());
    }

    public void removeUserSession(WebSocketSession wsSession) {
        // 从 connectedUsers 中移除用户
        connectedUsers.values().removeIf(userInfo -> userInfo.getWsSession().getId().equals(wsSession.getId()));
        log.info("[ForwardingService] WebSocket 会话 {} 已关闭，用户信息已移除", wsSession.getId());

        // 这里可以添加更多的清理逻辑，例如通知其他服务等
    }
}