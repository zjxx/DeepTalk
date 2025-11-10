package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class AuthorView {
    private String id;
    private String username;
    private String avatar;
    private int authorPosts;
    private int authorLikes;
    private long followerCount;
    private boolean followed; // 当前用户是否已关注
}
