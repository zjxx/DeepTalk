package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.AuthorListResponse;
import com.example.deeptalk.modules.community.dto.AuthorView;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.repository.AuthorFollowRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.modules.community.util.AvatarUtil;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.modules.auth.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorService {
    private final PostRepository postRepository;
    private final AuthorFollowRepository followRepository;
    private final UserRepository userRepository;

    // 简易推荐：按总获赞排序取前 N 位作者
    public AuthorListResponse listTopAuthors(String currentUserId, int limit) {
        List<Post> posts = postRepository.findAll();
        Map<String, List<Post>> byAuthor = posts.stream().collect(Collectors.groupingBy(Post::getAuthorId));        List<AuthorView> views = new ArrayList<>();
        for (Map.Entry<String, List<Post>> e : byAuthor.entrySet()) {
            String authorId = e.getKey();
            List<Post> aps = e.getValue();            int totalLikes = aps.stream().mapToInt(p -> p.getLikesCount() == null ? 0 : p.getLikesCount()).sum();
            
            String authorName = aps.get(0).getAuthorName();
              // 优先从数据库读取用户真实头像
            String avatarUrl = null;
            try {
                Long userId = Long.parseLong(authorId);
                User user = userRepository.findById(userId).orElse(null);
                if (user != null && user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                    avatarUrl = user.getAvatar();
                }
            } catch (NumberFormatException ex) {
                // userId 不是数字格式，使用动态生成
            }
            
            // 如果数据库没有头像，使用 AvatarUtil 动态生成
            if (avatarUrl == null || avatarUrl.isEmpty()) {
                avatarUrl = AvatarUtil.getAvatar(authorId, authorName);
            }
            
            AuthorView v = new AuthorView();
            v.setId(authorId);
            v.setUsername(authorName);
            v.setAvatar(avatarUrl);
            v.setAuthorPosts(aps.size());
            v.setAuthorLikes(totalLikes);
            v.setFollowerCount(followRepository.countByFollowingId(authorId));
            v.setFollowed(currentUserId != null && followRepository.existsByFollowerIdAndFollowingId(currentUserId, authorId));
            views.add(v);
        }

        views.sort((a,b) -> Long.compare(b.getFollowerCount(), a.getFollowerCount()));
        if (views.size() > limit) views = views.subList(0, limit);

        AuthorListResponse resp = new AuthorListResponse();
        resp.setAuthors(views);
        return resp;
    }
}
