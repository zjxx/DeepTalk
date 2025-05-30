package com.example.deeptalk.modules.speech.entity;

import lombok.Getter;

public class Connection {
    private String sessionId; // Session ID for the connection, can be used as token

    @Getter
    private String user1Id;

    @Getter
    private String user2Id;
}
