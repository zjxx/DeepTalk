package com.example.deeptalk.modules.community.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class AIReplyService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.api.url:https://zjxx.lol/v1beta/models/gemini-2.5-flash:generateContent}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public AIReplyService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    // 在Bean创建后打印配置信息（用于调试）
    @javax.annotation.PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isEmpty()) {
            System.out.println("🔑 Gemini API密钥已加载: " + apiKey.substring(0, Math.min(15, apiKey.length())) + "...");
            System.out.println("🌐 Gemini API URL: " + apiUrl);
        } else {
            System.out.println("⚠️ Gemini API密钥未配置，将使用备用回复");
        }
    }
    
    /**
     * 根据帖子内容生成AI回复
     */
    public String generateReply(String postTitle, String postContent) {
        System.out.println("🤖 开始生成AI回复...");
        System.out.println("📝 帖子标题: " + postTitle);
        System.out.println("🔑 API密钥状态: " + (apiKey != null && !apiKey.isEmpty() ? "已配置" : "未配置"));
        
        // 如果没有配置API密钥，返回默认回复
        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("⚠️ API密钥为空，使用备用回复");
            return generateFallbackReply(postTitle, postContent);
        }
          System.out.println("✅ API密钥已配置，准备调用Gemini API...");
        try {
            // 构造Gemini API请求体
            String prompt = String.format(
                "你是一个友好且乐于助人的社区成员。请为以下帖子生成一条有见地、鼓励性的回复（2-3句话）。\n\n标题：%s\n\n内容：%s\n\n请用中文回复。",
                postTitle, 
                postContent
            );
            
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentObj = new HashMap<>();
            List<Map<String, String>> partsList = new ArrayList<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            partsList.add(part);
            contentObj.put("parts", partsList);
            contents.add(contentObj);
            requestBody.put("contents", contents);
            
            // 设置请求头 - Gemini使用x-goog-api-key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);
            headers.set("HTTP-Referer", "http://localhost:8080");
                        
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // 发送请求到Gemini API
            ResponseEntity<String> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                String.class
            );
            
            // 解析Gemini API响应
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                JsonNode candidates = jsonNode.get("candidates");
                if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode content = firstCandidate.get("content");
                    if (content != null) {
                        JsonNode parts = content.get("parts");
                        if (parts != null && parts.isArray() && parts.size() > 0) {
                            JsonNode text = parts.get(0).get("text");
                            if (text != null) {
                                String aiReply = text.asText().trim();
                                System.out.println("✅ AI回复生成成功: " + aiReply);
                                return aiReply;
                            }
                        }
                    }
                }
            }
            
            // 如果解析失败，返回备用回复
            System.out.println("⚠️ AI回复解析失败，使用备用回复");
            return generateFallbackReply(postTitle, postContent);
            
        } catch (Exception e) {
            System.err.println("❌ AI回复生成失败: " + e.getMessage());
            e.printStackTrace();
            return generateFallbackReply(postTitle, postContent);
        }
    }
    
    /**
     * 生成备用回复（当AI服务不可用时）
     */
    private String generateFallbackReply(String postTitle, String postContent) {
        String[] templates = {
            "感谢分享！这个话题很有意思，期待看到更多讨论。",
            "很有见地的观点！你提到的内容让我有了新的思考。",
            "这是一个很棒的帖子！希望能看到更多这样的内容。",
            "非常有价值的分享，感谢你的贡献！",
            "很高兴看到这样的讨论，继续加油！"
        };
        
        // 根据内容长度选择不同的回复
        int index = postContent.length() % templates.length;
        return templates[index];
    }
}
