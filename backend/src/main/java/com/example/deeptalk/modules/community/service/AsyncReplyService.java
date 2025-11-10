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

@Service
public class AsyncReplyService {
    
    @Autowired
    private AIReplyService aiReplyService;
    
    @Autowired
    private ReplyRepository replyRepository;

    @Autowired
    private ReplyCacheService replyCacheService;
    
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateAIReplyAsync(Post post) {
        try {
            String threadName = Thread.currentThread().getName();
            System.out.println("🧵 异步线程: " + threadName);
            System.out.println("🤖 开始为帖子生成AI回复: " + post.getId());
            System.out.println("📝 帖子标题: " + post.getTitle());
            System.out.println("📄 帖子内容: " + post.getContent().substring(0, Math.min(50, post.getContent().length())) + "...");
            
            String aiReplyContent = aiReplyService.generateReply(
                post.getTitle(), 
                post.getContent()
            );
            
            System.out.println("💬 AI生成的回复: " + aiReplyContent);
            
            Reply aiReply = new Reply();
            aiReply.setPostId(post.getId());
            aiReply.setAuthorId("ai_assistant");
            aiReply.setAuthorName("AI助手");
            aiReply.setAuthorAvatar("https://api.dicebear.com/7.x/bottts/svg?seed=ai");
            aiReply.setContent(aiReplyContent);
            aiReply.setIsAiGenerated(true);
            aiReply.setCreatedAt(LocalDateTime.now());
            
            Reply savedReply = replyRepository.save(aiReply);
            
            System.out.println("✅ AI回复已保存到数据库");
            System.out.println("🆔 回复ID: " + savedReply.getId());
            System.out.println("📅 创建时间: " + savedReply.getCreatedAt());
            
            replyCacheService.clearReplyCache(post.getId());
            System.out.println("🧹 已清除回复缓存: " + post.getId());
            
        } catch (Exception e) {
            System.err.println("❌ AI回复生成失败: " + e.getMessage());
            System.err.println("📍 错误位置: AsyncReplyService.generateAIReplyAsync");
            System.err.println("🔍 帖子ID: " + post.getId());
            e.printStackTrace();
            
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
                replyCacheService.clearReplyCache(post.getId());
                System.out.println("🧹 已清除回复缓存(备用): " + post.getId());
            } catch (Exception ex) {
                System.err.println("❌ 备用回复也保存失败: " + ex.getMessage());
            }
        }
    }
}
