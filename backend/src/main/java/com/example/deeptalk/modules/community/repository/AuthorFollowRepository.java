package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.AuthorFollow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthorFollowRepository extends JpaRepository<AuthorFollow, Long> {
    boolean existsByFollowerIdAndFollowingId(String followerId, String followingId);
    long countByFollowingId(String followingId);
    long countByFollowerId(String followerId);
    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
