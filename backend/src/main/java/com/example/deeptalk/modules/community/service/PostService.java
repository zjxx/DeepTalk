package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.dto.LikeRequest;
import com.example.deeptalk.modules.community.dto.LikeResponse;
import com.example.deeptalk.modules.community.dto.CheckAuthorResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.PostLike;
import com.example.deeptalk.modules.community.entity.Author;
import com.example.deeptalk.modules.community.entity.PostImage;
import com.example.deeptalk.modules.community.repository.PostLikeRepository;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.modules.community.repository.PostImageRepository;
import com.example.deeptalk.modules.community.repository.ReplyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;    
    @Autowired
    private PostLikeRepository postLikeRepository;
    
    @Autowired
    private AsyncReplyService asyncReplyService;
    
    @Autowired
    private PostCacheService postCacheService;
      @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private ReplyRepository replyRepository;

    public List<Post> searchPosts(String keyword, String type) {
        // 使用缓存服务
        if (keyword == null || keyword.trim().isEmpty()) {
            return postCacheService.getAllPosts();
        } else if ("authors".equals(type)) {
            return postCacheService.searchPostsByAuthor(keyword);
        } else {
            return postCacheService.searchPosts(keyword);
        }
    }    
    
    @Transactional
    public Post addPost(Post post) {
        // 使用缓存服务保存（会自动清除缓存）
        Post savedPost = postCacheService.savePost(post);
          // 保存图片
        if (post.getImageUrls() != null) {
            int order = 0;
            for (String url : post.getImageUrls()) {
                PostImage img = new PostImage();
                img.setPostId(savedPost.getId());
                img.setUrl(url);
                img.setSortOrder(order++);
                postImageRepository.save(img);
            }
        }
        
        // 异步生成AI回复（通过独立的Service确保异步生效）
        try {
            asyncReplyService.generateAIReplyAsync(savedPost);
        } catch (Exception e) {
            // AI回复生成失败不应该影响发帖
            System.err.println("AI回复生成失败，但不影响发帖: " + e.getMessage());
        }
        
        return savedPost;
    }

    @Transactional
    public LikeResponse likePost(LikeRequest request) {
        try {
            String postId = request.getPostId();
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
    }    /**
     * 获取指定用户的所有帖子
     */
    public List<Post> getPostsByUserId(String userId) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
    }    /**
     * 删除帖子
     */
    @Transactional
    public boolean deletePost(String postId, String userId) {
        try {
            // 查找帖子
            Post post = postRepository.findById(postId).orElse(null);
            if (post == null) {
                return false;
            }
            
            // 验证是否为帖子作者
            if (!post.getAuthorId().equals(userId)) {
                throw new RuntimeException("无权删除此帖子");
            }
            
            // 删除帖子的回复
            replyRepository.deleteByPostId(postId);
            
            // 删除帖子相关的图片记录
            postImageRepository.deleteByPostId(postId);
            
            // 删除帖子的点赞记录
            postLikeRepository.deleteByPostId(postId);
              // 删除帖子
            postRepository.deleteById(postId);
            
            // 清除缓存
            postCacheService.clearAllCache();
            
            return true;
        } catch (Exception e) {
            throw new RuntimeException("删除帖子失败: " + e.getMessage());
        }
    }
}