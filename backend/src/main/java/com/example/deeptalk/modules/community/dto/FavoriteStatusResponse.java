package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class FavoriteStatusResponse {
    private boolean favorited;
    private long favoritesCount;
}
