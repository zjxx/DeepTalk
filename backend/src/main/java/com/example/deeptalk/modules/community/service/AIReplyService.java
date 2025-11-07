package com.example.deeptalk.modules.community.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonArray;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIReplyService {
    
    @Value("${minimax.api.key:eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLmnLHlmInovakiLCJVc2VyTmFtZSI6IuacseWYiei9qSIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTgyNDU3ODkwOTgzNjQ5NjAzIiwiUGhvbmUiOiIxODkyMTMzMzAwMSIsIkdyb3VwSUQiOiIxOTgyNDU3ODkwOTc5NDU1Mjk5IiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMTEtMDcgMjM6NTA6NDQiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.ttuO_Kp94xxLsh9GvBwG7wIZHAhAYmKc8aops4xIddZ9Yf089vA6NiN_r7xoj5vbb534w2Jv3wOCk59aNEim0f5cx2GbplTneVcWzZEmZ55JrQ0E2DXU2cOhPSsj1yo-mde2PiGfZMDY1zpWord7EJy-HgPmjawEZgWNug2WbLsHa4_bj94UfgELyxMC6H_bkrag6RFGFJ6Fli-N_oTpEOsOZ7oId8R1-kD8C1BT9DD_rwHTASQbwFQtHbTEQIV6rI7r1y3KtvKtBkfHPQqznNDkMROpWOnMysA6ceyS90cYVkxj6HDt52X9W3KY_R_NCOYUm4SZ-NOm4LJU90KMYw}")  // 添加空字符串作为默认值
    private String apiKey;
    //2333
    
    @Value("${minimax.api.url:https://api.minimaxi.com/v1}")
    private String apiUrl;
    
    @Value("${minimax.api.model:MiniMax-M2}")  // 默认模型
    private String model;
    
    @Value("${minimax.api.timeout:10000}")  // 默认超时60秒
    private int apiTimeout;
    
    private final HttpClient httpClient;
    
    public AIReplyService() {
        // 配置HttpClient的超时设置
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
    }
    
    // 在Bean创建后打印配置信息（用于调试）
    @javax.annotation.PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isEmpty()) {
            System.out.println("🔑 MiniMax API密钥已加载: " + apiKey.substring(0, Math.min(15, apiKey.length())) + "...");
            System.out.println("🌐 MiniMax API URL: " + apiUrl);
            System.out.println("🤖 MiniMax 模型: " + model);
        } else {
            System.out.println("⚠️ MiniMax API密钥未配置，将使用备用回复");
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
        System.out.println("✅ API密钥已配置，准备调用MiniMax API...");
        try {
            // 构造MiniMax API请求体
            String userMessage = String.format(
                "你是一个友好且乐于助人的社区成员。请为以下帖子生成一条有见地、鼓励性的回复（2-3句话）。\n\n标题：%s\n\n内容：%s\n\n请用中文回复。",
                postTitle, 
                postContent
            );
            
            // 构建JSON请求体
            JsonObject requestBody = new JsonObject();
            requestBody.addProperty("model", model);
            
            JsonArray messages = new JsonArray();
            JsonObject message = new JsonObject();
            message.addProperty("role", "user");
            message.addProperty("content", userMessage);
            messages.add(message);
            requestBody.add("messages", messages);
            
            String requestBodyStr = requestBody.toString();
            
            // 构建HTTP请求
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl + "/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBodyStr))
                    .timeout(Duration.ofSeconds(apiTimeout))
                    .build();
            
            // 发送请求到MiniMax API
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            System.out.println("📡 MiniMax API响应状态码: " + response.statusCode());
            
            // 解析MiniMax API响应
            if (response.statusCode() == 200 && response.body() != null) {
                JsonObject jsonResponse = JsonParser.parseString(response.body()).getAsJsonObject();
                
                // 检查是否有choices数组
                if (jsonResponse.has("choices") && jsonResponse.get("choices").isJsonArray()) {
                    JsonArray choices = jsonResponse.getAsJsonArray("choices");
                    if (choices.size() > 0) {
                        JsonObject firstChoice = choices.get(0).getAsJsonObject();
                        if (firstChoice.has("message")) {
                            JsonObject messageObj = firstChoice.getAsJsonObject("message");
                            if (messageObj.has("content")) {
                                String aiReply = messageObj.get("content").getAsString().trim();
                                System.out.println("✅ AI回复生成成功: " + aiReply);
                                return aiReply;
                            }
                        }
                    }
                }
            }
            
            // 如果解析失败，返回备用回复
            System.out.println("⚠️ AI回复解析失败，使用备用回复");
            if (response.body() != null) {
                System.out.println("📄 响应内容: " + response.body());
            }
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
