package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class AddReplyRequest {
    private String postId;
    private String content;
    private String authorId;
    private String authorName;
    private String authorAvatar;
}
