package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class LikeResponse {
    private boolean success;
    private String message;
    private String postId;
    private int likes;
} 