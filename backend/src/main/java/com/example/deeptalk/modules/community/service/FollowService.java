package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.FollowActionRequest;
import com.example.deeptalk.modules.community.dto.FollowStatusResponse;
import com.example.deeptalk.modules.community.dto.AuthorView;
import com.example.deeptalk.modules.community.entity.AuthorFollow;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.repository.AuthorFollowRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.modules.community.util.AvatarUtil;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.modules.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {
    private final AuthorFollowRepository followRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

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
    
    /**
     * 获取用户关注的作者列表
     */
    public List<AuthorView> getFollowingList(String userId) {
        List<AuthorFollow> follows = followRepository.findByFollowerId(userId);
        List<AuthorView> result = new ArrayList<>();
        
        for (AuthorFollow follow : follows) {
            String authorId = follow.getFollowingId();
            
            // 从帖子中获取作者信息
            List<Post> authorPosts = postRepository.findByAuthorId(authorId);
            if (authorPosts.isEmpty()) {
                continue; // 该作者没有帖子，跳过
            }
              Post firstPost = authorPosts.get(0);
            int totalLikes = authorPosts.stream()
                .mapToInt(p -> p.getLikesCount() == null ? 0 : p.getLikesCount())
                .sum();
              AuthorView view = new AuthorView();
            view.setId(authorId);
            view.setUsername(firstPost.getAuthorName());
              // 优先从数据库读取用户真实头像
            String avatarUrl = null;
            try {
                Long authorUserId = Long.parseLong(authorId);
                User user = userRepository.findById(authorUserId).orElse(null);
                if (user != null && user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                    avatarUrl = user.getAvatar();
                }
            } catch (NumberFormatException ex) {
                // userId 不是数字格式，使用动态生成
            }
            
            // 如果数据库没有头像，使用 AvatarUtil 动态生成
            if (avatarUrl == null || avatarUrl.isEmpty()) {
                avatarUrl = AvatarUtil.getAvatar(authorId, firstPost.getAuthorName());
            }
            
            view.setAvatar(avatarUrl);
            view.setAuthorPosts(authorPosts.size());
            view.setAuthorLikes(totalLikes);
            view.setFollowerCount(followRepository.countByFollowingId(authorId));
            view.setFollowed(true); // 这个列表中的都是已关注的
            
            result.add(view);
        }
        
        // 按关注时间倒序排列（最新关注的在前）
        result.sort((a, b) -> Long.compare(b.getFollowerCount(), a.getFollowerCount()));
        
        return result;
    }
}
