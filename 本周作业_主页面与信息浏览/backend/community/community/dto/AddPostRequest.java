package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Post;
import lombok.Data;

@Data
public class AddPostRequest {
    private String authorId;
    private Post post;
} 