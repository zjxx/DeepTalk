package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Reply;
import lombok.Data;

@Data
public class AddReplyResponse {
    private boolean success;
    private String message;
    private Reply reply;
}
