package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.FollowActionRequest;
import com.example.deeptalk.modules.community.dto.FollowStatusResponse;
import com.example.deeptalk.modules.community.entity.AuthorFollow;
import com.example.deeptalk.modules.community.repository.AuthorFollowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final AuthorFollowRepository followRepository;

    @Transactional
    public FollowStatusResponse toggleFollow(FollowActionRequest req) {
        if (req.getUserId().equals(req.getTargetAuthorId())) {
            throw new IllegalArgumentException("不能关注自己");
        }
        boolean exists = followRepository.existsByFollowerIdAndFollowingId(req.getUserId(), req.getTargetAuthorId());
        if (req.isFollow()) {
            if (!exists) {
                AuthorFollow af = new AuthorFollow();
                af.setFollowerId(req.getUserId());
                af.setFollowingId(req.getTargetAuthorId());
                followRepository.save(af);
            }
        } else {
            if (exists) {
                followRepository.deleteByFollowerIdAndFollowingId(req.getUserId(), req.getTargetAuthorId());
            }
        }
        FollowStatusResponse resp = new FollowStatusResponse();
        resp.setFollowed(followRepository.existsByFollowerIdAndFollowingId(req.getUserId(), req.getTargetAuthorId()));
        resp.setFollowerCount(followRepository.countByFollowingId(req.getTargetAuthorId()));
        resp.setFollowingCount(followRepository.countByFollowerId(req.getUserId()));
        return resp;
    }

    public FollowStatusResponse getStatus(String currentUserId, String targetAuthorId) {
        FollowStatusResponse resp = new FollowStatusResponse();
        resp.setFollowed(followRepository.existsByFollowerIdAndFollowingId(currentUserId, targetAuthorId));
        resp.setFollowerCount(followRepository.countByFollowingId(targetAuthorId));
        resp.setFollowingCount(followRepository.countByFollowerId(currentUserId));
        return resp;
    }
}
