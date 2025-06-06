package com.example.deeptalk.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String type;  // 消息类型: "system", "message"
    private String content;  // 消息内容
    private String time;  // 消息时间
} 