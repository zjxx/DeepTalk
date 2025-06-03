package com.example.deeptalk.modules.speech.controller;

import com.example.deeptalk.modules.speech.service.SpeechService;
import lombok.Data;
import lombok.Getter;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;


/**
 * The type Speech controller.
 * 处理语音对战相关的请求
 * 一个完整的语音对战流程包括：
 * /match - 用户发起匹配请求，服务器返回一个token
 * /connect - 用户连接到指定的token上，开始对战
 * /disconnect - 用户断开连接，结束对战
 * /critique - 用户请求对对战进行评价，服务器返回评价结果
 */
@RestController
@RequestMapping("/api/speech")
public class SpeechController {

    /**
     * connect response entity.
     * 在对局生成时，期望获得一个指定的token(由匹配侧实现)， 两端的用户通过这一请求连接到指定token的session上，进行数据的传输.
     * 也就是说，在调用该方法后，需要再通过方法返回的token来进行后续的操作.
     * 在已有链接的情返回链接结果 况下，发送`connect`请求将会返回错误.
     *
     * @param request 来自前端的连接请求
     * @return 得到的token
     */
    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody ConnectRequest request) {
        // 处理连接请求
        // First check if the user is already connected or pending
        if (SpeechService.checkIsPending(request.getUserId())) {
            return ResponseEntity.badRequest().body("用户已在请求中");
        }
        if (SpeechService.checkIsConnected(request.getUserId())) {
            return ResponseEntity.badRequest().body("用户已连接");
        }
        // Find a matching opponent
        String opponentId = SpeechService.findMatching(request.getUserId());
        if (opponentId == null) {
            // no matching opponent found, pend the user into the waiting queue
            opponentId = SpeechService.pendMatching(request.getUserId());
            if (opponentId == null) {
                return ResponseEntity.status(503).body("匹配失败，请稍后再试");
            }
        }

        String token = SpeechService.makeConnection(request.getUserId(), opponentId);

        if (token != null) {
            return ResponseEntity.ok(token); // 这里应当返回一个可用的连接信息
        }
        return ResponseEntity.status(503).body("匹配失败，请稍后再试");
    }

    /**
     * Disconnect response entity.
     *
     * @param request 来自前端的断开连接请求
     * @return 返回断开连接结果 当对局结束或者用户主动退出时，客户端发送`disconnect`请求，服务器相应通知另一个用户 如果出现了意外断线等情况，服务器在一段时间的未响应后自动断开连接 在没有链接建立的情况下，发送`disconnect`请求将会返回错误
     */
    @PostMapping("/disconnect")
    public ResponseEntity<?> disconnect(@RequestBody ConnectRequest request) {
        // 处理断开连接请求
        // first check if the user is connected, if not, return error
        if (!SpeechService.checkIsConnected(request.getUserId())) {
            return ResponseEntity.badRequest().body("用户未连接");
        }
        // TODO
        return ResponseEntity.ok("断开连接成功");
    }

    /**
     * Critique response entity.
     *
     * @param request the request
     * @return the response entity
     */
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
        // TODO
    }
}

/**
 * The type Connect request.
 */
@Getter
class ConnectRequest {
    private String userId;
    private String token; // 连接的token
}

/**
 * The type Critique request.
 */
@Getter
class CritiqueRequest {
    private String userId;
    private String opponentId;
}

/**
 * The type Critique response.
 */
@Data
class CritiqueResponse {
    private String userId;
    private String opponentId;
    private int score;
    private String critique;

    /**
     * Instantiates a new Critique response.
     *
     * @param userId     the user id
     * @param opponentId the opponent id
     * @param score      the score
     * @param critique   the critique
     */
    public CritiqueResponse(String userId, String opponentId, int score, String critique) {
        this.userId = userId;
        this.opponentId = opponentId;
        this.score = score;
        this.critique = critique;
    }
}



