package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.PostFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {
    boolean existsByPostIdAndUserId(String postId, String userId);
    void deleteByPostIdAndUserId(String postId, String userId);
    long countByPostId(String postId);
}
