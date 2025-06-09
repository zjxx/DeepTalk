package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    @Query("SELECT p FROM Post p WHERE p.title LIKE %:keyword% OR p.content LIKE %:keyword%")
    List<Post> searchPosts(@Param("keyword") String keyword);

    @Query("SELECT p FROM Post p WHERE p.authorName LIKE %:keyword%")
    List<Post> searchAuthors(@Param("keyword") String keyword);

    @Query("SELECT p FROM Post p WHERE p.authorId = :authorId")
    List<Post> findByAuthorId(@Param("authorId") String authorId);
} 