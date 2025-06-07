package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class LikeRequest {
    private String postId;
    private String userId;
} 