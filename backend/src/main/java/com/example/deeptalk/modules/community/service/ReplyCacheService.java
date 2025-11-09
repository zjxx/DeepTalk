package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.entity.Reply;
import com.example.deeptalk.modules.community.repository.ReplyRepository;
import com.example.deeptalk.util.RedisUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 评论缓存服务
 * 提供评论相关的缓存功能
 */
@Service
public class ReplyCacheService {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private ReplyRepository replyRepository;

    // 缓存 key 前缀
    private static final String REPLY_LIST_PREFIX = "reply:list:";
    private static final String REPLY_COUNT_PREFIX = "reply:count:";

    // 缓存过期时间（秒）
    private static final long REPLY_LIST_EXPIRE = 600;  // 10分钟
    private static final long REPLY_COUNT_EXPIRE = 300; // 5分钟

    /**
     * 获取帖子的所有评论（带缓存）
     * 
     * @param postId 帖子ID
     * @return 评论列表
     */
    public List<Reply> getRepliesByPostId(String postId) {
        // 1. 尝试从缓存获取
        String cacheKey = REPLY_LIST_PREFIX + postId;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取评论列表: " + postId);
            return (List<Reply>) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询评论列表: " + postId);
        List<Reply> replies = replyRepository.findByPostIdOrderByCreatedAtAsc(postId);

        // 3. 存入缓存
        redisUtil.set(cacheKey, replies, REPLY_LIST_EXPIRE);

        return replies;
    }

    /**
     * 获取帖子的评论数（带缓存）
     * 
     * @param postId 帖子ID
     * @return 评论数
     */
    public long getReplyCount(String postId) {
        // 1. 尝试从缓存获取
        String cacheKey = REPLY_COUNT_PREFIX + postId;
        Object cached = redisUtil.get(cacheKey);
        if (cached != null) {
            System.out.println("从缓存获取评论数: " + postId);
            return (Long) cached;
        }

        // 2. 从数据库查询
        System.out.println("从数据库查询评论数: " + postId);
        long count = replyRepository.countByPostId(postId);

        // 3. 存入缓存
        redisUtil.set(cacheKey, count, REPLY_COUNT_EXPIRE);

        return count;
    }

    /**
     * 清除帖子的评论缓存
     * 
     * @param postId 帖子ID
     */
    public void clearReplyCache(String postId) {
        String listKey = REPLY_LIST_PREFIX + postId;
        String countKey = REPLY_COUNT_PREFIX + postId;
        
        redisUtil.del(listKey);
        redisUtil.del(countKey);
        
        System.out.println("已清除评论缓存: " + postId);
    }

    /**
     * 增加评论数缓存
     * 
     * @param postId 帖子ID
     */
    public void incrementReplyCount(String postId) {
        String cacheKey = REPLY_COUNT_PREFIX + postId;
        
        // 如果缓存存在，增加计数
        if (redisUtil.hasKey(cacheKey)) {
            redisUtil.incr(cacheKey, 1);
            System.out.println("增加评论数缓存: " + postId);
        } else {
            // 如果缓存不存在，从数据库获取并缓存
            long count = replyRepository.countByPostId(postId);
            redisUtil.set(cacheKey, count, REPLY_COUNT_EXPIRE);
        }
    }

    /**
     * 减少评论数缓存
     * 
     * @param postId 帖子ID
     */
    public void decrementReplyCount(String postId) {
        String cacheKey = REPLY_COUNT_PREFIX + postId;
        
        // 如果缓存存在，减少计数
        if (redisUtil.hasKey(cacheKey)) {
            redisUtil.decr(cacheKey, 1);
            System.out.println("减少评论数缓存: " + postId);
        }
    }

    /**
     * 缓存预热：将热门帖子的评论提前加载到缓存
     * 
     * @param hotPostIds 热门帖子ID列表
     */
    public void warmUpCache(List<String> hotPostIds) {
        System.out.println("开始评论缓存预热...");
        
        int count = 0;
        for (String postId : hotPostIds) {
            // 缓存评论列表
            List<Reply> replies = replyRepository.findByPostIdOrderByCreatedAtAsc(postId);
            String listKey = REPLY_LIST_PREFIX + postId;
            redisUtil.set(listKey, replies, REPLY_LIST_EXPIRE);
            
            // 缓存评论数
            String countKey = REPLY_COUNT_PREFIX + postId;
            redisUtil.set(countKey, (long) replies.size(), REPLY_COUNT_EXPIRE);
            
            count++;
        }
        
        System.out.println("已缓存 " + count + " 个帖子的评论");
        System.out.println("评论缓存预热完成！");
    }
}
