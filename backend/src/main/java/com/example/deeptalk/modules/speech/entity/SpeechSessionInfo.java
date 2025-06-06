package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;

@Getter
public class SpeechSessionInfo {
    private final String sessionId;
    private final SpeechUserInfo user1Info;
    private final SpeechUserInfo user2Info;

    public SpeechSessionInfo(String sessionId, String user1Id, String user2Id) {
        this.sessionId = sessionId;
        this.user1Info = new SpeechUserInfo(user1Id, sessionId);
        this.user2Info = new SpeechUserInfo(user2Id, sessionId);
    }

    public String getUser1Id() {
        return user1Info.getUserId();
    }

    public String getUser2Id() {
        return user2Info.getUserId();
    }

    public SpeechUserInfo getUserInfo(String userId) {
        if (userId.equals(this.user1Info.getUserId())) {
            return user1Info;
        } else if (userId.equals(this.user2Info.getUserId())) {
            return user2Info;
        } else {
            throw new IllegalArgumentException("Invalid user ID: " + userId);
        }
    }

    public SpeechUserInfo getOpponentInfo(String userId) {
        if (userId.equals(this.user1Info.getUserId())) {
            return user2Info;
        } else if (userId.equals(this.user2Info.getUserId())) {
            return user1Info;
        } else {
            throw new IllegalArgumentException("Invalid user ID: " + userId);
        }
    }
}
