package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.FavoriteRequest;
import com.example.deeptalk.modules.community.dto.FavoriteStatusResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.PostFavorite;
import com.example.deeptalk.modules.community.repository.PostFavoriteRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.modules.auth.service.UserCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final PostFavoriteRepository favoriteRepository;
    private final PostRepository postRepository;
    private final UserCacheService userCacheService;

    @Transactional
    public FavoriteStatusResponse toggleFavorite(FavoriteRequest req) {
        boolean exists = favoriteRepository.existsByPostIdAndUserId(req.getPostId(), req.getUserId());
        if (req.isFavorite()) {
            if (!exists) {
                PostFavorite pf = new PostFavorite();
                pf.setPostId(req.getPostId());
                pf.setUserId(req.getUserId());
                favoriteRepository.save(pf);
            }
        } else {
            if (exists) {
                favoriteRepository.deleteByPostIdAndUserId(req.getPostId(), req.getUserId());
            }
        }
        FavoriteStatusResponse resp = new FavoriteStatusResponse();
        resp.setFavorited(favoriteRepository.existsByPostIdAndUserId(req.getPostId(), req.getUserId()));
        resp.setFavoritesCount(favoriteRepository.countByPostId(req.getPostId()));
        return resp;
    }

    public FavoriteStatusResponse getStatus(String postId, String userId) {
        FavoriteStatusResponse resp = new FavoriteStatusResponse();
        resp.setFavorited(favoriteRepository.existsByPostIdAndUserId(postId, userId));
        resp.setFavoritesCount(favoriteRepository.countByPostId(postId));
        return resp;
    }    /**
     * 获取用户收藏的帖子列表
     */
    public List<Post> getUserFavoritePosts(String userId) {
        List<String> postIds = favoriteRepository.findPostIdsByUserId(userId);
        if (postIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Post> posts = postRepository.findAllById(postIds);
          // 确保每个帖子的头像信息都是最新的
        for (Post post : posts) {
            if (post.getAuthorId() != null && !post.getAuthorId().equals("ai_assistant") && !post.getAuthorId().equals("ai-assistant")) {
                try {
                    // 从用户缓存服务获取最新的用户信息（包括头像）
                    Long authorLongId = Long.parseLong(post.getAuthorId());
                    Map<String, Object> userInfo = userCacheService.getUserInfo(authorLongId);
                    if (userInfo != null && userInfo.containsKey("avatar")) {
                        String avatar = (String) userInfo.get("avatar");
                        // 只有当获取到的头像不为空时才更新
                        if (avatar != null && !avatar.trim().isEmpty()) {
                            post.setAuthorAvatar(avatar);
                        }
                    }
                } catch (NumberFormatException e) {
                    // 如果authorId不是Long类型，继续使用原有的头像信息
                    System.out.println("AuthorId格式不正确，使用原有头像信息: " + post.getAuthorId());
                }
            }
        }
        
        return posts;
    }
}
