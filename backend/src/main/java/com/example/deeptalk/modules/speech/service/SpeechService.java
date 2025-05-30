package com.example.deeptalk.modules.speech.service;

import com.example.deeptalk.modules.speech.entity.Connection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Queue;

@Service
public class SpeechService {
    @Autowired
    private static Queue<Connection> connectedQueue;

    @Autowired
    private static Queue<Connection> pendingQueue;

    @Autowired
    private static HashSet<String> pendingUsers;

    @Autowired
    private static HashSet<String> connectedUsers;

    public static String findMatching(String userId) {
        return null;
    }

    private final static int MAX_PENDING_TIME = 10; // maximum waiting time, in seconds
    public static String pendMatching(String userId) {
        requestingUsers.add(userId);
        // TODO: finish the logic of waiting for a matching opponent
        return null; // 返回一个匹配的对手ID或null
    }

    public static Boolean checkIsPending(String userId) {
        return pendingUsers.contains(userId);
    }

    public static Boolean checkIsConnected(String userId) {
        return connectedUsers.contains(userId);
    }

    public static String makeConnection(String user1Id, String user2Id) {
        return null;
    }
}
