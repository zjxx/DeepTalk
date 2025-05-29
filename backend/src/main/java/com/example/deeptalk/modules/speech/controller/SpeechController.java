package com.example.deeptalk.modules.speech.controller;

import lombok.Data;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/speech")
public class SpeechController {

    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody ConnectRequest request) {
        // 处理连接请求
        return ResponseEntity.ok("连接成功");
    }

    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect(@RequestBody ConnectRequest request) {
        // 处理断开连接请求
        return ResponseEntity.ok("断开连接成功");
    }

    @PostMapping("/critique")
    public ResponseEntity<CritiqueResponse> critique(@RequestBody CritiqueRequest request) {
        // 处理对战评价请求
        return ResponseEntity.ok(
                new CritiqueResponse(
                        request.getUserId(),
                        request.getOpponentId(),
                        85,
                        "表现不错"
                ));
    }
}

@Data
class ConnectRequest {
    private String userId;
    private String opponentId;
}

@Data
class CritiqueRequest {
    private String userId;
    private String opponentId;
}

@Data
class CritiqueResponse {
    private String userId;
    private String opponentId;
    private int score;
    private String critique;
    public CritiqueResponse(String userId, String opponentId, int score, String critique) {
        this.userId = userId;
        this.opponentId = opponentId;
        this.score = score;
        this.critique = critique;
    }
}



