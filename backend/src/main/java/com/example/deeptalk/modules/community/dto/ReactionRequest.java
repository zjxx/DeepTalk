package com.example.deeptalk.modules.community.dto;

import lombok.Data;

@Data
public class ReactionRequest {
    private String postId;
    private String userId;
    private String type;   // like,love,laugh,sad,angry
    private boolean add;   // true 添加，false 移除
}
