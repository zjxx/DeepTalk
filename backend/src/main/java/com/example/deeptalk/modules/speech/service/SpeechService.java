package com.example.deeptalk.modules.speech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.*;

/**
 * The type Speech service.
 */
@Service
public class SpeechService {

    private static HashSet<String> pendingUsers;

    private static HashSet<String> connectedUsers;

    private final static int MAX_PENDING_TIME = 10; // maximum waiting time, in seconds
    private final static Map<String, CompletableFuture<String>> pendingNotifier = new ConcurrentHashMap<>();
    /**
     * 为用户进行匹配，该函数包含具体的匹配逻辑
     * 这一操作是原子的，因为我们不希望同时有多个用户被匹配到同一个对手
     *
     * @param userId 发起匹配请求的用户ID
     * @return 返回匹配的对手ID，如果没有找到匹配的对手，则返回null
     */
    public static synchronized String findMatching(String userId) {
        String opponentId = null;
        if (!pendingUsers.isEmpty()) {
            // 随机选择一个对手
            opponentId = pendingUsers.iterator().next();
            // 通知对手已经匹配成功
            CompletableFuture<String> opponentFuture = pendingNotifier.get(opponentId);
            opponentFuture.complete(userId);
            pendingUsers.remove(userId);
        }
        return opponentId;
    }

    public static String pendMatching(String userId) {
        pendingUsers.add(userId);
        String has_matching = null;
        try {
            CompletableFuture<String> future = new CompletableFuture<>();
            has_matching = future.get(MAX_PENDING_TIME, TimeUnit.SECONDS);
            pendingNotifier.put(userId, future);
        } catch(InterruptedException | ExecutionException e){
            System.err.println(e.getMessage());
        } catch (TimeoutException e) {
            // 超时未匹配成功，手动移除用户
            pendingUsers.remove(userId);
        }
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
        String token = null; // TODO: 联系Websocket组件与rtc客户端得到token
        return token;
    }

    /**
     * Disconnect.
     *
     * @param userId the user id
     */
    public static void disconnect(String userId) {
        // 断开连接，移除用户
        connectedUsers.remove(userId);
    }
}
