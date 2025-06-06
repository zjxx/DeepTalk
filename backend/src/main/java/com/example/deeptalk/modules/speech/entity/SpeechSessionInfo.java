package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;

@Getter
public class SpeechSessionInfo {
    private String sessionId;
    private String user1Id;
    private String user2Id;

    public SpeechSessionInfo(String sessionId, String user1Id, String user2Id) {
        this.sessionId = sessionId;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
    }

    public String getOpponentId(String userId) {
        if (userId.equals(user1Id)) {
            return user2Id;
        } else if (userId.equals(user2Id)) {
            return user1Id;
        }
        return null; // 如果用户ID不匹配，则返回null
    }
}
