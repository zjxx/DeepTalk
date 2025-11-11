package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.ReactionRequest;
import com.example.deeptalk.modules.community.dto.ReactionSummaryResponse;
import com.example.deeptalk.modules.community.entity.PostReaction;
import com.example.deeptalk.modules.community.repository.PostReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReactionService {
    private final PostReactionRepository reactionRepository;

    private static final String[] SUPPORTED = {"like","love","laugh","sad","angry"};

    @Transactional
    public ReactionSummaryResponse react(ReactionRequest req) {
        validateType(req.getType());
        boolean exists = reactionRepository.existsByPostIdAndUserIdAndType(req.getPostId(), req.getUserId(), req.getType());
        if (req.isAdd()) {
            if (!exists) {
                PostReaction r = new PostReaction();
                r.setPostId(req.getPostId());
                r.setUserId(req.getUserId());
                r.setType(req.getType());
                reactionRepository.save(r);
            }
        } else {
            if (exists) {
                reactionRepository.deleteByPostIdAndUserIdAndType(req.getPostId(), req.getUserId(), req.getType());
            }
        }
        return buildSummary(req.getPostId(), req.getUserId());
    }

    public ReactionSummaryResponse summary(String postId, String userId) {
        return buildSummary(postId, userId);
    }

    private ReactionSummaryResponse buildSummary(String postId, String userId) {
        Map<String, Long> counters = new HashMap<>();
        String myReaction = null;
        for (String t : SUPPORTED) {
            long c = reactionRepository.countByPostIdAndType(postId, t);
            counters.put(t, c);
        }
        List<PostReaction> mine = reactionRepository.findByPostIdAndUserId(postId, userId);
        // 单选场景：取第一个
        if (!mine.isEmpty()) {
            myReaction = mine.get(0).getType();
        }
        ReactionSummaryResponse resp = new ReactionSummaryResponse();
        resp.setPostId(postId);
        resp.setCounters(counters);
        resp.setMyReaction(myReaction);
        return resp;
    }

    private void validateType(String type) {
        for (String t : SUPPORTED) {
            if (t.equals(type)) return;
        }
        throw new IllegalArgumentException("不支持的反应类型: " + type);
    }
}
