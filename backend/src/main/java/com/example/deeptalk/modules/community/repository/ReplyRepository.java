package com.example.deeptalk.modules.community.repository;

import com.example.deeptalk.modules.community.entity.Reply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReplyRepository extends JpaRepository<Reply, String> {
    List<Reply> findByPostIdOrderByCreatedAtAsc(String postId);
    
    long countByPostId(String postId);
}
