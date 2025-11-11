package com.example.deeptalk.modules.community.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ReactionSummaryResponse {
    private String postId;
    private Map<String, Long> counters; // 各类型计数
    private String myReaction;          // 当前用户选中的类型(如果单选场景)
}
