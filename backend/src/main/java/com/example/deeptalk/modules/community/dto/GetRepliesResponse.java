package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Reply;
import lombok.Data;
import java.util.List;

@Data
public class GetRepliesResponse {
    private boolean success;
    private String message;
    private List<Reply> replies;
    private int count;
}
