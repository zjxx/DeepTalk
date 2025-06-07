package com.example.deeptalk.modules.community.controller;

import lombok.Getter;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {
    @PostMapping("/search")
    public static String searchCommunity(@RequestBody SearchRequest request) {
        // 这里可以添加搜索逻辑
        return null;
    }

    @PostMapping("/posts/like")
    public synchronized static String likePost(@RequestParam Long postId) {
        // 这里可以添加点赞逻辑
        return null;
    }

    @PostMapping("/posts/add")
    public synchronized static String addPost(@RequestBody String postContent) {
        // 这里可以添加发帖逻辑
        return null;
    }

    @PostMapping("/posts/check-author")
    public static String checkPostAuthor(@RequestParam Long postId) {
        // 这里可以添加检查作者逻辑
        return null;
    }
}

@Getter
class SearchRequest {
    private String query;
}
