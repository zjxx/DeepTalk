package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.*;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.service.PostService;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
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
    public ResponseEntity<SearchResult> searchCommunity(@RequestBody SearchRequest request) {
        List<Post> posts = postService.searchPosts(request.getQuery(), request.getType());
        SearchResult result = new SearchResult();
        result.setPosts(posts);
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/posts/like", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<LikeResponse> likePost(@RequestBody LikeRequest request) {
        LikeResponse response = postService.likePost(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/posts/add", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<AddPostResponse> addPost(@RequestBody AddPostRequest request) {
        try {
            Post post = request.getPost();
            String authorId = request.getAuthorId();
            
            // 从嵌套的 author 对象中获取信息并设置到 post 中
            post.setAuthorId(authorId);
            post.setAuthorName(post.getAuthor().getUsername());
            post.setAuthorAvatar("https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2");
            post.setLikesCount(0);
            post.setCreatedAt(LocalDateTime.now());
            
            System.out.println("addPost: " + post);
            System.out.println("addPostTitle: " + post.getTitle());
            System.out.println("addPostContent: " + post.getContent());
            System.out.println("addPostAuthorId: " + post.getAuthorId());
            System.out.println("addPostAuthorName: " + post.getAuthorName());
            System.out.println("addPostAuthorAvatar: " + post.getAuthorAvatar());
            System.out.println("addPostCreatedAt: " + post.getCreatedAt());
            System.out.println("addPostLikesCount: " + post.getLikesCount());
            
            Post savedPost = postService.addPost(post);
            AddPostResponse response = new AddPostResponse();
            response.setSuccess(true);
            response.setMessage("发帖成功");
            response.setPost(savedPost);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AddPostResponse response = new AddPostResponse();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            response.setPost(null);
            return ResponseEntity.internalServerError().body(response);
        }
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
