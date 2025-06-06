package com.example.deeptalk.modules.speech.service;

import com.example.deeptalk.modules.speech.entity.SpeechSessionInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.*;

import static com.example.deeptalk.modules.speech.config.SpeechWebSocketConfig.speechWebSocketHandler;

/**
 * The type Speech service.
 */
@Service
@Slf4j
public class SpeechService {
    private final static ForwardingService forwardingService = speechWebSocketHandler.getForwardingService();

    private final static ConcurrentLinkedQueue<String> pendingUsers = new ConcurrentLinkedQueue<>();
    private final static ConcurrentLinkedQueue<String> connectedUsers = new ConcurrentLinkedQueue<>();
    private final static ConcurrentHashMap<String, SpeechSessionInfo> sessions = new ConcurrentHashMap<>();

    private final static int MAX_PENDING_TIME = 10; // maximum waiting time, in seconds
    private final static ConcurrentHashMap<String, CompletableFuture<String>> pendingNotifier = new ConcurrentHashMap<>();
    /**
     * 为用户进行匹配，该函数包含具体的匹配逻辑
     * 这一操作是原子的，因为我们不希望同时有多个用户被匹配到同一个对手
     *
     * @param userId 发起匹配请求的用户ID
     * @return 返回匹配的对手ID，如果没有找到匹配的对手，则返回null
     */
    public static synchronized String findMatching(String userId) {
        log.debug("[SpeechService] findMatching userId: {}", userId);

        String opponentId = null;
        if (!pendingUsers.isEmpty()) {
            // 选择队首的用户作为对手
            opponentId = pendingUsers.poll();
            // 通知对手已经匹配成功
            CompletableFuture<String> opponentFuture = pendingNotifier.get(opponentId);
            opponentFuture.complete(userId);
        }
        return opponentId;
    }

    public static String pendMatching(String userId) {
        log.debug("[SpeechService] pending userId: {}", userId);

        pendingUsers.add(userId);
        String has_matching = null;
        try {
            CompletableFuture<String> future = new CompletableFuture<>();
            pendingNotifier.put(userId, future);
            has_matching = future.get(MAX_PENDING_TIME, TimeUnit.SECONDS);
        } catch(InterruptedException | ExecutionException e){
            System.err.println(e.getMessage());
        } catch (TimeoutException e) {
            // 超时未匹配成功，手动移除用户
            pendingUsers.remove(userId);
        }
        // 无论匹配成功与否，均需要移除新建的Future
        pendingNotifier.remove(userId);
        return has_matching;
    }

    /**
     * Check is pending boolean.
     *
     * @param userId the user id
     * @return the boolean
     */
    public static Boolean checkIsPending(String userId) {
        return pendingUsers.contains(userId);
    }

    /**
     * Check is connected boolean.
     *
     * @param userId the user id
     * @return the boolean
     */
    public static Boolean checkIsConnected(String userId) {
        return connectedUsers.contains(userId);
    }

    /**
     * Make connection string.
     *
     * @param userId the user 1 id
     * @param opponentId the user 2 id
     * @return the string
     */
    public static String makeConnection(String userId, String opponentId) {
        // 由于选定的对手可能已经连接了其他用户，因此需要检查是否可以连接
        if (connectedUsers.contains(userId) || connectedUsers.contains(opponentId)) {
            return null; // 无法连接，返回null
        }
        connectedUsers.add(userId);
        connectedUsers.add(opponentId);
        // 生成一个连接token
        SpeechSessionInfo session = forwardingService.makeConnection(userId, opponentId); // TODO: create websocket session

        if (session == null) {
            System.err.println("Unable to create session");
            return null;
        }
        sessions.put(session.getSessionId(), session);
        return session.getSessionId();
    }

    /**
     * Disconnect.
     *
     * @param userId the user id
     */
    public static synchronized void disconnect(String userId, String sessionId) {
        // 断开连接，移除用户
        if (!connectedUsers.contains(userId)) {
            System.err.println("User is not connected: " + userId);
            return; // 如果用户未连接，则直接返回
        }

        connectedUsers.remove(userId);

        if (sessionId == null) {
            System.err.println("Session ID is null for userId: " + userId);
            return; // 如果会话ID为null，则直接返回
        }
        SpeechSessionInfo session = sessions.get(sessionId);
        if (session == null) {
            System.err.println("Session not found for sessionId: " + sessionId);
            return; // 如果会话不存在，则直接返回
        }

        // 直接移除会话，后面的对手将会在session==null处返回
        forwardingService.terminateConnection(sessionId);
        sessions.remove(session.getSessionId());
    }
}
