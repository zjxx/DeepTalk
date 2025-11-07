package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.Reply;
import com.example.deeptalk.modules.community.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import java.time.LocalDateTime;

/**
 * 异步AI回复服务
 * 专门处理AI回复的异步生成和保存
 * 
 * 注意：独立的Service类确保@Async注解正确生效
 */
@Service
public class AsyncReplyService {
    
    @Autowired
    private AIReplyService aiReplyService;
    
    @Autowired
    private ReplyRepository replyRepository;
    
    /**
     * 异步生成并保存AI回复
     * @param post 帖子对象
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateAIReplyAsync(Post post) {
        try {
            // 打印线程信息以验证异步是否生效
            String threadName = Thread.currentThread().getName();
            System.out.println("🧵 异步线程: " + threadName);
            System.out.println("🤖 开始为帖子生成AI回复: " + post.getId());
            System.out.println("📝 帖子标题: " + post.getTitle());
            System.out.println("📄 帖子内容: " + post.getContent().substring(0, Math.min(50, post.getContent().length())) + "...");
            
            // 调用AI服务生成回复
            String aiReplyContent = aiReplyService.generateReply(
                post.getTitle(), 
                post.getContent()
            );
            
            System.out.println("💬 AI生成的回复: " + aiReplyContent);
            
            // 创建AI回复记录
            Reply aiReply = new Reply();
            aiReply.setPostId(post.getId());
            aiReply.setAuthorId("ai_assistant");
            aiReply.setAuthorName("AI助手");
            aiReply.setAuthorAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=ai");
            aiReply.setContent(aiReplyContent);
            aiReply.setIsAiGenerated(true);
            aiReply.setCreatedAt(LocalDateTime.now());
            
            // 保存AI回复到数据库
            Reply savedReply = replyRepository.save(aiReply);
            
            System.out.println("✅ AI回复已保存到数据库");
            System.out.println("🆔 回复ID: " + savedReply.getId());
            System.out.println("📅 创建时间: " + savedReply.getCreatedAt());
            
        } catch (Exception e) {
            System.err.println("❌ AI回复生成失败: " + e.getMessage());
            System.err.println("📍 错误位置: AsyncReplyService.generateAIReplyAsync");
            System.err.println("🔍 帖子ID: " + post.getId());
            e.printStackTrace();
            
            // 如果AI回复失败，保存一个备用回复
            try {
                Reply fallbackReply = new Reply();
                fallbackReply.setPostId(post.getId());
                fallbackReply.setAuthorId("ai_assistant");
                fallbackReply.setAuthorName("AI助手");
                fallbackReply.setAuthorAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=ai");
                fallbackReply.setContent("感谢分享！这是一个很有意思的话题。");
                fallbackReply.setIsAiGenerated(true);
                fallbackReply.setCreatedAt(LocalDateTime.now());
                replyRepository.save(fallbackReply);
                
                System.out.println("⚠️ 已保存备用回复");
            } catch (Exception ex) {
                System.err.println("❌ 备用回复也保存失败: " + ex.getMessage());
            }
        }
    }
}
