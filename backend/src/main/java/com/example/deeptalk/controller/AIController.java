package com.example.deeptalk.controller;

import com.example.deeptalk.modules.community.service.AIReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * AI 对话控制器
 * 提供统一的 AI 对话接口，使用后端配置的 MiniMax API
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIReplyService aiReplyService;    /**
     * AI 对话接口
     * POST /api/ai/chat
     * 
     * 请求体示例：
     * {
     *   "message": "用户的问题或消息",
     *   "context": "可选的上下文信息",
     *   "language": "英文" 或 "中文"（可选，默认为中文）
     * }
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        String context = request.getOrDefault("context", "");
        String language = request.getOrDefault("language", "中文");
        
        Map<String, Object> response = new HashMap<>();
        
        if (userMessage == null || userMessage.trim().isEmpty()) {
            response.put("success", false);
            response.put("error", "消息不能为空");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            // 根据语言构建提示词
            String prompt = buildPromptWithLanguage(userMessage, context, language);
            
            // 使用 AIReplyService 生成回复
            String aiReply = aiReplyService.generateReply("AI Conversation", prompt);
            
            response.put("success", true);
            response.put("message", aiReply);
            response.put("model", "MiniMax-M2");
            response.put("language", language);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "AI 服务暂时不可用");
            response.put("details", e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }    
    /**
     * 根据语言构建提示词
     */
    private String buildPromptWithLanguage(String userMessage, String context, String language) {
        StringBuilder prompt = new StringBuilder();
        
        if ("英文".equals(language) || "English".equalsIgnoreCase(language)) {
            // 英文模式
            prompt.append("IMPORTANT: You MUST respond ONLY in English. Do not use Chinese or any other language.\n\n");
            
            if (context != null && !context.trim().isEmpty()) {
                prompt.append(context).append("\n\n");
            }
            
            prompt.append("User's message: ").append(userMessage).append("\n\n");
            prompt.append("Remember: Your response MUST be in English only! Provide a natural, conversational response.");
            
        } else {
            // 中文模式（默认）
            prompt.append("重要提示：请用中文回复。\n\n");
            
            if (context != null && !context.trim().isEmpty()) {
                prompt.append(context).append("\n\n");
            }
            
            prompt.append("用户消息：").append(userMessage).append("\n\n");
            prompt.append("请记住：你的回复必须使用中文！请提供自然、对话式的回复。");
        }
        
        return prompt.toString();
    }

    /**
     * 获取 AI 服务状态
     * GET /api/ai/status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("service", "MiniMax AI");
        response.put("model", "MiniMax-M2");
        response.put("status", "运行中");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 生成帖子回复
     * POST /api/ai/generate-reply
     * 
     * 请求体示例：
     * {
     *   "title": "帖子标题",
     *   "content": "帖子内容"
     * }
     */
    @PostMapping("/generate-reply")
    public ResponseEntity<Map<String, Object>> generateReply(@RequestBody Map<String, String> request) {
        String title = request.get("title");
        String content = request.get("content");
        
        Map<String, Object> response = new HashMap<>();
        
        if (title == null || content == null) {
            response.put("success", false);
            response.put("error", "标题和内容不能为空");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            String aiReply = aiReplyService.generateReply(title, content);
            
            response.put("success", true);
            response.put("reply", aiReply);
            response.put("model", "MiniMax-M2");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "生成回复失败");
            response.put("details", e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
