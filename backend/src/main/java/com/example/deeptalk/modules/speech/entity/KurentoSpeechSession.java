package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;

@Getter
public class KurentoSpeechSession {
    private String sessionId;
    private KurentoUserSession user1;
    private KurentoUserSession user2;

    public KurentoSpeechSession(String sessionId, KurentoUserSession user1, KurentoUserSession user2) {
        this.sessionId = sessionId;
        this.user1 = user1;
        this.user2 = user2;
    }

    public boolean hasUser(String userId) {
        return (user1 != null && user1.getUserId().equals(userId)) ||
               (user2 != null && user2.getUserId().equals(userId));
    }

    public KurentoUserSession getOpponentUser(String userId) {
        if (user1 != null && user1.getUserId().equals(userId)) {
            return user2;
        } else if (user2 != null && user2.getUserId().equals(userId)) {
            return user1;
        }
        return null; // No opponent found
    }

    public void releaseWebRtcEndpoints() {
        if (user1 != null) {
            user1.releaseWebRtcEndpoint();
        }
        if (user2 != null) {
            user2.releaseWebRtcEndpoint();
        }
    }
}
