package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.WebSocketSession;

@Getter
@Setter
public class SpeechUserInfo {
    private String userId;
    private String sessionId;
    private WebSocketSession wsSession;

    public SpeechUserInfo(String userId, String sessionId) {
        this.userId = userId;
        this.sessionId = sessionId;
    }
}
