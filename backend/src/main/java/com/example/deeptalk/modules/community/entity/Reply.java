package com.example.deeptalk.modules.community.entity;

import javax.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import org.hibernate.annotations.GenericGenerator;

@Data
@Entity
@Table(name = "replies")
public class Reply {
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    @Column(name = "post_id", nullable = false)
    private String postId;

    @Column(nullable = false, length = 1000, columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String content;

    @Column(name = "author_id", nullable = false)
    private String authorId;

    @Column(name = "author_name", nullable = false, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String authorName;

    @Column(name = "author_avatar")
    private String authorAvatar;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_ai_generated", nullable = false)
    private Boolean isAiGenerated = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
