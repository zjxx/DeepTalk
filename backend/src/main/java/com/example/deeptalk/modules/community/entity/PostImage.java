package com.example.deeptalk.modules.community.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.GenericGenerator;

@Data
@Entity
@Table(name = "post_images")
public class PostImage {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(name = "url", nullable = false, length = 1024, columnDefinition = "VARCHAR(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String url;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
