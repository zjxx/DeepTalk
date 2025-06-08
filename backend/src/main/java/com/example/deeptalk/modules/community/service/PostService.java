package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.LikeRequest;
import com.example.deeptalk.modules.community.dto.LikeResponse;
import com.example.deeptalk.modules.community.dto.CheckAuthorResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.PostLike;
import com.example.deeptalk.modules.community.entity.Author;
import com.example.deeptalk.modules.community.repository.PostLikeRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    public List<Post> searchPosts(String keyword, String type) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return postRepository.findAll();
        }

        if ("authors".equals(type)) {
            return postRepository.searchAuthors(keyword);
        } else {
            // 默认搜索帖子（标题和内容）
            return postRepository.searchPosts(keyword);
        }
    }

    @Transactional
    public Post addPost(Post post) {
        return postRepository.save(post);
    }

    @Transactional
    public LikeResponse likePost(LikeRequest request) {
        try {
            Long postId = Long.parseLong(request.getPostId());
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("帖子不存在"));

            // 检查是否已经点赞
            if (postLikeRepository.existsByPostIdAndUserId(postId, request.getUserId())) {
                return new LikeResponse() {{
                    setSuccess(false);
                    setMessage("您已经点赞过该帖子");
                    setPostId(request.getPostId());
                    setLikes(post.getLikesCount());
                }};
            }

            // 创建点赞记录
            PostLike postLike = new PostLike();
            postLike.setPostId(postId);
            postLike.setUserId(request.getUserId());
            postLikeRepository.save(postLike);

            // 更新帖子点赞数
            post.setLikesCount(post.getLikesCount() + 1);
            postRepository.save(post);

            return new LikeResponse() {{
                setSuccess(true);
                setMessage("点赞成功");
                setPostId(request.getPostId());
                setLikes(post.getLikesCount());
            }};
        } catch (Exception e) {
            return new LikeResponse() {{
                setSuccess(false);
                setMessage("点赞失败：" + e.getMessage());
                setPostId(request.getPostId());
                setLikes(0);
            }};
        }
    }

    public List<Post> getPostsByAuthor(String authorId) {
        return postRepository.findByAuthorId(authorId);
    }

    public CheckAuthorResponse getAuthorInfo(String authorId) {
        // 获取作者的所有帖子
        List<Post> authorPosts = postRepository.findByAuthorId(authorId);
        
        // 计算总获赞数
        int totalLikes = authorPosts.stream()
                .mapToInt(Post::getLikesCount)
                .sum();
        
        Author author = new Author();
        author.setId(authorId);
        author.setUsername(authorPosts.isEmpty() ? "未知用户" : authorPosts.get(0).getAuthorName());
        author.setAvatar(authorPosts.isEmpty() ? "" : authorPosts.get(0).getAuthorAvatar());
        author.setAuthorPosts(authorPosts.size());
        author.setAuthorLikes(totalLikes);

        CheckAuthorResponse response = new CheckAuthorResponse();
        response.setAuthor(author);
        return response;
    }
} 