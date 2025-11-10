package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class FollowActionRequest {
    private String targetAuthorId;
    private String userId;
    private boolean follow;
}
