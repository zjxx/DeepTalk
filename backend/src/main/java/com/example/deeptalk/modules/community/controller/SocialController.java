package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.FollowActionRequest;
import com.example.deeptalk.modules.community.dto.FollowStatusResponse;
import com.example.deeptalk.modules.community.dto.FavoriteRequest;
import com.example.deeptalk.modules.community.dto.FavoriteStatusResponse;
import com.example.deeptalk.modules.community.dto.ReactionRequest;
import com.example.deeptalk.modules.community.dto.ReactionSummaryResponse;
import com.example.deeptalk.modules.community.dto.AuthorListResponse;
import com.example.deeptalk.modules.community.dto.AuthorView;
import com.example.deeptalk.modules.community.service.FollowService;
import com.example.deeptalk.modules.community.service.FavoriteService;
import com.example.deeptalk.modules.community.service.ReactionService;
import com.example.deeptalk.modules.community.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SocialController {
    private final FollowService followService;
    private final FavoriteService favoriteService;
    private final ReactionService reactionService;
    private final AuthorService authorService;

    @PostMapping(value = "/follow", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<FollowStatusResponse> follow(@RequestBody FollowActionRequest request, HttpServletRequest httpRequest) {
        // 安全地获取Token中的用户信息
        Object userIdObj = httpRequest.getAttribute("userId");
        String tokenUserId = userIdObj != null ? String.valueOf(userIdObj) : null;
        
        if (tokenUserId != null && !tokenUserId.isEmpty()) {
            request.setUserId(tokenUserId); // 以服务端认证为准
        }
        System.out.println("[Social] FOLLOW action user=" + request.getUserId() + ", target=" + request.getTargetAuthorId() + ", follow=" + request.isFollow());
        return ResponseEntity.ok(followService.toggleFollow(request));
    }

    @GetMapping(value = "/follow/status", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<FollowStatusResponse> status(@RequestParam(required = false) String currentUserId,
                                                       @RequestParam String targetAuthorId,
                                                       HttpServletRequest httpRequest) {
        if (currentUserId == null || currentUserId.isEmpty()) {
            // 安全地获取Token中的用户信息
            Object userIdObj = httpRequest.getAttribute("userId");
            String tokenUserId = userIdObj != null ? String.valueOf(userIdObj) : null;
            
            if (tokenUserId != null && !tokenUserId.isEmpty()) currentUserId = tokenUserId;
        }
        System.out.println("[Social] FOLLOW status user=" + currentUserId + ", target=" + targetAuthorId);
        return ResponseEntity.ok(followService.getStatus(currentUserId, targetAuthorId));
    }
    
    /**
     * 获取用户关注的作者列表
     */
    @GetMapping(value = "/follow/list", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<AuthorListResponse> getFollowingList(@RequestParam(required = false) String userId,
                                                                HttpServletRequest httpRequest) {
        if (userId == null || userId.isEmpty()) {
            // 从 Token 中获取用户 ID
            Object userIdObj = httpRequest.getAttribute("userId");
            String tokenUserId = userIdObj != null ? String.valueOf(userIdObj) : null;
            
            if (tokenUserId != null && !tokenUserId.isEmpty()) {
                userId = tokenUserId;
            }
        }
        
        System.out.println("[Social] GET following list for user=" + userId);
        
        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<AuthorView> followingList = followService.getFollowingList(userId);
        AuthorListResponse response = new AuthorListResponse();
        response.setAuthors(followingList);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/favorite", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<FavoriteStatusResponse> favorite(@RequestBody FavoriteRequest request) {
        return ResponseEntity.ok(favoriteService.toggleFavorite(request));
    }

    @GetMapping(value = "/favorite/status", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<FavoriteStatusResponse> favoriteStatus(@RequestParam String postId, @RequestParam String userId) {
        return ResponseEntity.ok(favoriteService.getStatus(postId, userId));
    }

    @PostMapping(value = "/reaction", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<ReactionSummaryResponse> react(@RequestBody ReactionRequest request) {
        return ResponseEntity.ok(reactionService.react(request));
    }

    @GetMapping(value = "/reaction/summary", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<ReactionSummaryResponse> summary(@RequestParam String postId, @RequestParam String userId) {
        return ResponseEntity.ok(reactionService.summary(postId, userId));
    }

    @GetMapping(value = "/authors/recommend", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<AuthorListResponse> recommendAuthors(@RequestParam(required = false) String currentUserId,
                                                               @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(authorService.listTopAuthors(currentUserId, limit));
    }

    @GetMapping(value = "/favorite/posts", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<List<com.example.deeptalk.modules.community.entity.Post>> getUserFavorites(
            @RequestParam String userId,
            HttpServletRequest httpRequest) {
        // 安全地获取Token中的用户信息
        Object userIdObj = httpRequest.getAttribute("userId");
        String tokenUserId = userIdObj != null ? String.valueOf(userIdObj) : null;
        
        // 优先使用token中的userId，确保用户只能查看自己的收藏
        String effectiveUserId = (tokenUserId != null && !tokenUserId.isEmpty()) ? tokenUserId : userId;
        
        System.out.println("[Social] GET user favorites userId=" + effectiveUserId);
        return ResponseEntity.ok(favoriteService.getUserFavoritePosts(effectiveUserId));
    }
}
