package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.FavoriteRequest;
import com.example.deeptalk.modules.community.dto.FavoriteStatusResponse;
import com.example.deeptalk.modules.community.entity.PostFavorite;
import com.example.deeptalk.modules.community.repository.PostFavoriteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final PostFavoriteRepository favoriteRepository;

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
}
