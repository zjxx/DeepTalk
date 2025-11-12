package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Post;
import lombok.Data;
import java.util.List;

/**
 * 获取用户帖子响应
 */
@Data
public class GetUserPostsResponse {
    private boolean success;
    private String message;
    private List<Post> posts;
    private int count;
}
