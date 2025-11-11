package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.PostReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    boolean existsByPostIdAndUserIdAndType(String postId, String userId, String type);
    void deleteByPostIdAndUserIdAndType(String postId, String userId, String type);
    long countByPostIdAndType(String postId, String type);
    List<PostReaction> findByPostIdAndUserId(String postId, String userId);
}
