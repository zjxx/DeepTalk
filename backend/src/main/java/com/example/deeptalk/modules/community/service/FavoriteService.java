package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.FavoriteRequest;
import com.example.deeptalk.modules.community.dto.FavoriteStatusResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.PostFavorite;
import com.example.deeptalk.modules.community.repository.PostFavoriteRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final PostFavoriteRepository favoriteRepository;
    private final PostRepository postRepository;

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
    }

    /**
     * 获取用户收藏的帖子列表
     */
    public List<Post> getUserFavoritePosts(String userId) {
        List<String> postIds = favoriteRepository.findPostIdsByUserId(userId);
        if (postIds.isEmpty()) {
            return new ArrayList<>();
        }
        return postRepository.findAllById(postIds);
    }
}
