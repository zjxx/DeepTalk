package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class FollowStatusResponse {
    private boolean followed;
    private long followerCount;
    private long followingCount;
}
