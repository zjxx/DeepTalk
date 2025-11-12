package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.PostFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostFavoriteRepository extends JpaRepository<PostFavorite, Long> {
    boolean existsByPostIdAndUserId(String postId, String userId);
    void deleteByPostIdAndUserId(String postId, String userId);
    long countByPostId(String postId);
    
    @Query("SELECT pf.postId FROM PostFavorite pf WHERE pf.userId = :userId ORDER BY pf.createdAt DESC")
    List<String> findPostIdsByUserId(@Param("userId") String userId);
}
