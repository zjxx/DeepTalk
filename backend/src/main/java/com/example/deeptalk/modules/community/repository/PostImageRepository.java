package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, String> {
    List<PostImage> findByPostIdOrderBySortOrderAsc(String postId);
    void deleteByPostId(String postId);
}
