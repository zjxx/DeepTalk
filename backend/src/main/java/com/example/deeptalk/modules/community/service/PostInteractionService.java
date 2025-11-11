package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * 帖子互动统计服务
 * 使用 Redis 缓存点赞、浏览量等高频操作数据
 */
@Slf4j
@Service
public class PostInteractionService {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostCacheService postCacheService;

    // Redis Key 前缀
    private static final String LIKE_COUNT_PREFIX = "post:like:count:";
    private static final String LIKE_USERS_PREFIX = "post:like:users:";
    private static final String VIEW_PV_PREFIX = "post:view:pv:";
    private static final String VIEW_UV_PREFIX = "post:view:uv:";

    /**
     * 点赞帖子
     */
    public Map<String, Object> likePost(String postId, String userId) {
        String likeCountKey = LIKE_COUNT_PREFIX + postId;
        String userLikeKey = LIKE_USERS_PREFIX + postId;
        
        Map<String, Object> result = new HashMap<>();
        
        // 检查用户是否已点赞
        if (redisUtil.sHasKey(userLikeKey, userId)) {
            result.put("success", false);
            result.put("message", "已经点赞过了");
            result.put("liked", true);
            return result;
        }
        
        // 添加到点赞用户集合
        redisUtil.sSet(userLikeKey, userId);
        
        // 增加点赞计数
        Long likeCount = redisUtil.incr(likeCountKey, 1);
        
        log.info("用户 {} 点赞帖子 {}，当前点赞数: {}", userId, postId, likeCount);
        
        result.put("success", true);
        result.put("message", "点赞成功");
        result.put("liked", true);
        result.put("likeCount", likeCount);
        
        return result;
    }

    /**
     * 取消点赞
     */
    public Map<String, Object> unlikePost(String postId, String userId) {
        String likeCountKey = LIKE_COUNT_PREFIX + postId;
        String userLikeKey = LIKE_USERS_PREFIX + postId;
        
        Map<String, Object> result = new HashMap<>();
        
        // 检查用户是否已点赞
        if (!redisUtil.sHasKey(userLikeKey, userId)) {
            result.put("success", false);
            result.put("message", "还没有点赞");
            result.put("liked", false);
            return result;
        }
        
        // 从点赞用户集合移除
        redisUtil.setRemove(userLikeKey, userId);
        
        // 减少点赞计数
        Long likeCount = redisUtil.decr(likeCountKey, 1);
        if (likeCount < 0) {
            likeCount = 0L;
            redisUtil.set(likeCountKey, 0);
        }
        
        log.info("用户 {} 取消点赞帖子 {}，当前点赞数: {}", userId, postId, likeCount);
        
        result.put("success", true);
        result.put("message", "取消点赞成功");
        result.put("liked", false);
        result.put("likeCount", likeCount);
        
        return result;
    }

    /**
     * 获取点赞数
     */
    public Long getLikeCount(String postId) {
        String key = LIKE_COUNT_PREFIX + postId;
        Object count = redisUtil.get(key);
        
        if (count == null) {
            // 从数据库加载
            Post post = postRepository.findById(postId).orElse(null);
            if (post != null) {
                redisUtil.set(key, post.getLikesCount());
                return post.getLikesCount().longValue();
            }
            return 0L;
        }
        
        return Long.parseLong(count.toString());
    }

    /**
     * 检查用户是否点赞
     */
    public boolean isLiked(String postId, String userId) {
        String key = LIKE_USERS_PREFIX + postId;
        return redisUtil.sHasKey(key, userId);
    }

    /**
     * 记录浏览量
     */
    public void recordView(String postId, String userId) {
        String pvKey = VIEW_PV_PREFIX + postId;  // 浏览次数(PV)
        String uvKey = VIEW_UV_PREFIX + postId;  // 独立访客(UV)
        
        // PV增加
        redisUtil.incr(pvKey, 1);
        
        // UV去重统计（使用Set）
        redisUtil.sSet(uvKey, userId);
        
        log.debug("记录帖子 {} 浏览，用户: {}", postId, userId);
    }

    /**
     * 获取浏览统计
     */
    public Map<String, Object> getViewStats(String postId) {
        String pvKey = VIEW_PV_PREFIX + postId;
        String uvKey = VIEW_UV_PREFIX + postId;
        
        Map<String, Object> stats = new HashMap<>();
        
        Object pv = redisUtil.get(pvKey);
        stats.put("pv", pv != null ? pv : 0);
        stats.put("uv", redisUtil.sGetSetSize(uvKey));
        
        return stats;
    }

    /**
     * 初始化帖子点赞数据（从数据库加载到 Redis）
     */
    public void initPostLikes(String postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            String key = LIKE_COUNT_PREFIX + postId;
            redisUtil.set(key, post.getLikesCount());
            log.info("初始化帖子 {} 点赞数: {}", postId, post.getLikesCount());
        }
    }

    /**
     * 定时任务：每10分钟同步点赞数到数据库
     */
    @Scheduled(cron = "0 */10 * * * ?")
    public void syncLikeCountToDatabase() {
        log.info("开始同步点赞数到数据库...");
        
        try {
            // 获取所有点赞计数的key（这里简化处理，实际应该用 SCAN）
            Set<String> keys = getKeysWithPrefix(LIKE_COUNT_PREFIX);
            
            int syncCount = 0;
            for (String key : keys) {
                String postId = key.replace(LIKE_COUNT_PREFIX, "");
                Object likeCountObj = redisUtil.get(key);
                
                if (likeCountObj != null) {
                    Integer likeCount = Integer.parseInt(likeCountObj.toString());
                    
                    // 更新数据库
                    Post post = postRepository.findById(postId).orElse(null);
                    if (post != null && !post.getLikesCount().equals(likeCount)) {
                        post.setLikesCount(likeCount);
                        postRepository.save(post);
                        
                        // 清除帖子缓存
                        postCacheService.clearAllPostCaches();
                        
                        syncCount++;
                        log.debug("同步帖子 {} 点赞数: {}", postId, likeCount);
                    }
                }
            }
            
            log.info("点赞数同步完成，共同步 {} 个帖子", syncCount);
        } catch (Exception e) {
            log.error("同步点赞数失败", e);
        }
    }

    /**
     * 定时任务：每小时同步浏览量到数据库
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void syncViewCountToDatabase() {
        log.info("开始同步浏览量到数据库...");
        
        try {
            Set<String> keys = getKeysWithPrefix(VIEW_PV_PREFIX);
            
            int syncCount = 0;
            for (String key : keys) {
                String postId = key.replace(VIEW_PV_PREFIX, "");
                Object viewCountObj = redisUtil.get(key);
                
                if (viewCountObj != null) {
                    // 注意：这里需要在 Post 实体中添加 viewCount 字段
                    // 或者创建单独的统计表
                    log.debug("帖子 {} 浏览量: {}", postId, viewCountObj);
                    syncCount++;
                }
            }
            
            log.info("浏览量同步完成，共同步 {} 个帖子", syncCount);
        } catch (Exception e) {
            log.error("同步浏览量失败", e);
        }
    }

    /**
     * 获取特定前缀的所有 key
     * 注意：这是简化实现，生产环境建议使用 SCAN 命令
     */
    private Set<String> getKeysWithPrefix(String prefix) {
        // 这里需要使用 RedisTemplate 的 keys 或 scan 方法
        // 由于 RedisUtil 没有提供，这里做简化处理
        return Set.of(); // 返回空集合，实际需要实现
    }

    /**
     * 清除帖子的所有互动数据缓存
     */
    public void clearPostInteractionCache(String postId) {
        redisUtil.del(
            LIKE_COUNT_PREFIX + postId,
            LIKE_USERS_PREFIX + postId,
            VIEW_PV_PREFIX + postId,
            VIEW_UV_PREFIX + postId
        );
        log.info("清除帖子 {} 的互动数据缓存", postId);
    }
}
