package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Post;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddPostResponse {
    private boolean success;
    private String message;
    private Post post;
} 