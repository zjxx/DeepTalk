package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.LikeRequest;
import com.example.deeptalk.modules.community.dto.LikeResponse;
import com.example.deeptalk.modules.community.dto.CheckAuthorRequest;
import com.example.deeptalk.modules.community.dto.CheckAuthorResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.service.PostService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {
    @Autowired
    private PostService postService;

    @PostMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<Post>> searchCommunity(@RequestBody SearchRequest request) {
        List<Post> posts = postService.searchPosts(request.getQuery(), request.getType());
        return ResponseEntity.ok(posts);
    }

    @PostMapping(value = "/posts/like", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<LikeResponse> likePost(@RequestBody LikeRequest request) {
        LikeResponse response = postService.likePost(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/posts/add", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Post> addPost(@RequestBody Post post) {
        Post savedPost = postService.addPost(post);
        return ResponseEntity.ok(savedPost);
    }

    @PostMapping(value = "/posts/check-author", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<CheckAuthorResponse> checkPostAuthor(@RequestBody CheckAuthorRequest request) {
        CheckAuthorResponse response = postService.getAuthorInfo(request.getAuthorId());
        return ResponseEntity.ok(response);
    }
}

@Getter
@Setter
class SearchRequest {
    private String query;
    private String type; // "posts" 或 "authors"
}
