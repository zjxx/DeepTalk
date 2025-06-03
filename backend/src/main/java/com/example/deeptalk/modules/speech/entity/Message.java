package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;

@Getter
public class Message {
    private String type;
    private String userId;
    private String opponentId;
    private String sessionId;
    private Object payload;

    @Override
    public String toString() {
        return "Message{" +
                "type='" + type + '\'' +
                ", userId='" + userId + '\'' +
                ", opponentId='" + opponentId + '\'' +
                ", sessionId='" + sessionId + '\'' +
                ", payload=" + (payload != null && payload.toString().length() > 50 ? payload.toString().substring(0, 50) + "..." : payload) +
                '}';
    }
}
