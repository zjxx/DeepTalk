package com.example.deeptalk.modules.community.dto;

import lombok.Data;

/**
 * 获取用户帖子请求
 */
@Data
public class GetUserPostsRequest {
    private String userId;
}
