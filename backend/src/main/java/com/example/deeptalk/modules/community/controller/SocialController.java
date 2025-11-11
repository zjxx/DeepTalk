package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.FollowActionRequest;
import com.example.deeptalk.modules.community.dto.FollowStatusResponse;
import com.example.deeptalk.modules.community.dto.FavoriteRequest;
import com.example.deeptalk.modules.community.dto.FavoriteStatusResponse;
import com.example.deeptalk.modules.community.dto.ReactionRequest;
import com.example.deeptalk.modules.community.dto.ReactionSummaryResponse;
import com.example.deeptalk.modules.community.dto.AuthorListResponse;
import com.example.deeptalk.modules.community.service.FollowService;
import com.example.deeptalk.modules.community.service.FavoriteService;
import com.example.deeptalk.modules.community.service.ReactionService;
import com.example.deeptalk.modules.community.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

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
        String tokenUserId = (String) httpRequest.getAttribute("userId");
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
            String tokenUserId = (String) httpRequest.getAttribute("userId");
            if (tokenUserId != null && !tokenUserId.isEmpty()) currentUserId = tokenUserId;
        }
        System.out.println("[Social] FOLLOW status user=" + currentUserId + ", target=" + targetAuthorId);
        return ResponseEntity.ok(followService.getStatus(currentUserId, targetAuthorId));
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
}
