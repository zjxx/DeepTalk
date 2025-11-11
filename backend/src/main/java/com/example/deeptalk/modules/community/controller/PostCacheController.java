package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.service.PostCacheService;
import com.example.deeptalk.modules.community.service.PostInteractionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 帖子缓存测试控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/community/cache")
@CrossOrigin(origins = "*")
public class PostCacheController {

    @Autowired
    private PostCacheService postCacheService;

    @Autowired
    private PostInteractionService postInteractionService;

    /**
     * 测试：获取帖子详情（带缓存）
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<Map<String, Object>> getPost(@PathVariable String postId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Post post = postCacheService.getPostById(postId);
            if (post != null) {
                result.put("success", true);
                result.put("post", post);
                result.put("message", "获取成功");
            } else {
                result.put("success", false);
                result.put("message", "帖子不存在");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
            log.error("获取帖子详情失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：获取所有帖子（带缓存）
     */
    @GetMapping("/posts/all")
    public ResponseEntity<Map<String, Object>> getAllPosts() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Post> posts = postCacheService.getAllPosts();
            result.put("success", true);
            result.put("posts", posts);
            result.put("count", posts.size());
            result.put("message", "获取成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
            log.error("获取帖子列表失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：搜索帖子（带缓存）
     */
    @GetMapping("/posts/search")
    public ResponseEntity<Map<String, Object>> searchPosts(@RequestParam String keyword) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Post> posts = postCacheService.searchPosts(keyword);
            result.put("success", true);
            result.put("posts", posts);
            result.put("count", posts.size());
            result.put("keyword", keyword);
            result.put("message", "搜索成功");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "搜索失败: " + e.getMessage());
            log.error("搜索帖子失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：点赞帖子
     */
    @PostMapping("/post/{postId}/like")
    public ResponseEntity<Map<String, Object>> likePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            Map<String, Object> result = postInteractionService.likePost(postId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "点赞失败: " + e.getMessage());
            log.error("点赞失败", e);
            return ResponseEntity.ok(result);
        }
    }

    /**
     * 测试：取消点赞
     */
    @PostMapping("/post/{postId}/unlike")
    public ResponseEntity<Map<String, Object>> unlikePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            Map<String, Object> result = postInteractionService.unlikePost(postId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "取消点赞失败: " + e.getMessage());
            log.error("取消点赞失败", e);
            return ResponseEntity.ok(result);
        }
    }

    /**
     * 测试：记录浏览
     */
    @PostMapping("/post/{postId}/view")
    public ResponseEntity<Map<String, Object>> recordView(
            @PathVariable String postId,
            @RequestParam String userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            postInteractionService.recordView(postId, userId);
            Map<String, Object> stats = postInteractionService.getViewStats(postId);
            
            result.put("success", true);
            result.put("message", "浏览记录成功");
            result.put("stats", stats);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "记录失败: " + e.getMessage());
            log.error("记录浏览失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：获取帖子点赞数
     */
    @GetMapping("/post/{postId}/like-count")
    public ResponseEntity<Map<String, Object>> getLikeCount(@PathVariable String postId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Long likeCount = postInteractionService.getLikeCount(postId);
            result.put("success", true);
            result.put("postId", postId);
            result.put("likeCount", likeCount);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
            log.error("获取点赞数失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：获取浏览统计
     */
    @GetMapping("/post/{postId}/view-stats")
    public ResponseEntity<Map<String, Object>> getViewStats(@PathVariable String postId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Map<String, Object> stats = postInteractionService.getViewStats(postId);
            result.put("success", true);
            result.put("postId", postId);
            result.putAll(stats);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取失败: " + e.getMessage());
            log.error("获取浏览统计失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：清除所有缓存
     */
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCaches() {
        Map<String, Object> result = new HashMap<>();
        try {
            postCacheService.clearAllPostCaches();
            result.put("success", true);
            result.put("message", "所有缓存已清除");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "清除失败: " + e.getMessage());
            log.error("清除缓存失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：预热缓存
     */
    @PostMapping("/warmup")
    public ResponseEntity<Map<String, Object>> warmupCache() {
        Map<String, Object> result = new HashMap<>();
        try {
            postCacheService.warmUpCache();
            result.put("success", true);
            result.put("message", "缓存预热完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "预热失败: " + e.getMessage());
            log.error("缓存预热失败", e);
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 测试：手动同步点赞数
     */
    @PostMapping("/sync/likes")
    public ResponseEntity<Map<String, Object>> syncLikes() {
        Map<String, Object> result = new HashMap<>();
        try {
            postInteractionService.syncLikeCountToDatabase();
            result.put("success", true);
            result.put("message", "点赞数同步完成");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "同步失败: " + e.getMessage());
            log.error("同步点赞数失败", e);
        }
        return ResponseEntity.ok(result);
    }
}
