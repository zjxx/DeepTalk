package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class FavoriteRequest {
    private String postId;
    private String userId;
    private boolean favorite;
}
