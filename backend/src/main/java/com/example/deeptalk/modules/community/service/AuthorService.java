package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.AuthorListResponse;
import com.example.deeptalk.modules.community.dto.AuthorView;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.repository.AuthorFollowRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
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

    // 简易推荐：按总获赞排序取前 N 位作者
    public AuthorListResponse listTopAuthors(String currentUserId, int limit) {
        List<Post> posts = postRepository.findAll();
        Map<String, List<Post>> byAuthor = posts.stream().collect(Collectors.groupingBy(Post::getAuthorId));

        List<AuthorView> views = new ArrayList<>();
        for (Map.Entry<String, List<Post>> e : byAuthor.entrySet()) {
            String authorId = e.getKey();
            List<Post> aps = e.getValue();
            int totalLikes = aps.stream().mapToInt(p -> p.getLikesCount() == null ? 0 : p.getLikesCount()).sum();
            AuthorView v = new AuthorView();
            v.setId(authorId);
            v.setUsername(aps.get(0).getAuthorName());
            v.setAvatar(aps.get(0).getAuthorAvatar());
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
