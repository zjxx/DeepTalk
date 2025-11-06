package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.entity.Reply;
import com.example.deeptalk.modules.community.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReplyService {
    
    @Autowired
    private ReplyRepository replyRepository;
    
    @Autowired
    private AIReplyService aiReplyService;
    
    /**
     * 获取帖子的所有回复
     */
    public List<Reply> getRepliesByPostId(String postId) {
        return replyRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }
    
    /**
     * 添加回复
     */
    public Reply addReply(Reply reply) {
        reply.setCreatedAt(LocalDateTime.now());
        return replyRepository.save(reply);
    }
    
    /**
     * 为帖子生成AI回复
     */
    public Reply generateAIReply(String postId, String postTitle, String postContent) {
        System.out.println("开始为帖子生成AI回复...");
        System.out.println("帖子ID: " + postId);
        System.out.println("帖子标题: " + postTitle);
        
        // 调用AI服务生成回复内容
        String aiReplyContent = aiReplyService.generateReply(postTitle, postContent);
        
        // 创建AI回复对象
        Reply aiReply = new Reply();
        aiReply.setPostId(postId);
        aiReply.setContent(aiReplyContent);
        aiReply.setAuthorId("ai-assistant");
        aiReply.setAuthorName("AI助手");
        aiReply.setAuthorAvatar("https://ui-avatars.com/api/?name=AI&background=4A90E2&color=fff");
        aiReply.setIsAiGenerated(true);
        aiReply.setCreatedAt(LocalDateTime.now());
        
        // 保存到数据库
        Reply savedReply = replyRepository.save(aiReply);
        System.out.println("✅ AI回复已保存，ID: " + savedReply.getId());
        
        return savedReply;
    }
    
    /**
     * 获取帖子的回复数量
     */
    public long getReplyCount(String postId) {
        return replyRepository.countByPostId(postId);
    }
}
