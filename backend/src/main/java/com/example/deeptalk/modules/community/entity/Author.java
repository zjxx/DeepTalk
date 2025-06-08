package com.example.deeptalk.modules.community.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Author {
    private String id;
    private String username;
    private String avatar;
    private int authorPosts;
    private int authorLikes;
} 