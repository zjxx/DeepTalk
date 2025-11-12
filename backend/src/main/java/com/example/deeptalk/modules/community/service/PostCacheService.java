package com.example.deeptalk.modules.community.service;

import com.example.deeptalk.modules.community.entity.Author;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.repository.PostRepository;
import com.example.deeptalk.modules.community.util.AvatarUtil;
import com.example.deeptalk.modules.auth.repository.UserRepository;
import com.example.deeptalk.modules.auth.entity.User;
import com.example.deeptalk.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 帖子缓存服务
 * 使用 Redis 缓存帖子数据，提升查询性能
 */
@Slf4j
@Service
public class PostCacheService {

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.example.deeptalk.modules.community.repository.PostImageRepository postImageRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Redis Key 前缀
    private static final String POST_DETAIL_PREFIX = "post:detail:";
    private static final String POST_LIST_KEY = "post:list:all";
    private static final String POST_HOT_LIST_KEY = "post:list:hot";
    private static final String POST_BY_AUTHOR_PREFIX = "post:list:author:";
    private static final String POST_SEARCH_PREFIX = "post:search:";

    // 缓存过期时间（秒）
    private static final long POST_DETAIL_EXPIRE = 1800;     // 30分钟
    private static final long POST_LIST_EXPIRE = 600;        // 10分钟
    private static final long POST_HOT_LIST_EXPIRE = 300;    // 5分钟
    private static final long POST_SEARCH_EXPIRE = 300;      // 5分钟

    /**
     * 获取帖子详情（带缓存）
     */
    public Post getPostById(String postId) {
        String key = POST_DETAIL_PREFIX + postId;
        
        // 先从缓存获取
        Post post = (Post) redisUtil.get(key);
        if (post != null) {
            log.info("从缓存获取帖子详情: {}", postId);
            return post;
        }

        // 缓存未命中，从数据库查询
        log.info("缓存未命中，从数据库查询帖子: {}", postId);
        post = postRepository.findById(postId).orElse(null);
        
        if (post != null) {
            // 组装 author 信息
            post = assembleAuthorInfo(post);
            // 存入缓存
            redisUtil.set(key, post, POST_DETAIL_EXPIRE);
        }
        
        return post;
    }

    /**
     * 获取所有帖子列表（带缓存）
     */
    @SuppressWarnings("unchecked")
    public List<Post> getAllPosts() {
        // 先从缓存获取
        List<Post> posts = (List<Post>) redisUtil.get(POST_LIST_KEY);
        if (posts != null && !posts.isEmpty()) {
            log.info("从缓存获取帖子列表，数量: {}", posts.size());
            return posts;
        }

        // 缓存未命中，从数据库查询
        log.info("缓存未命中，从数据库查询所有帖子");
        posts = postRepository.findAll();
        
        // 组装 author 信息
        posts = posts.stream()
                    .map(this::assembleAuthorInfo)
                    .collect(Collectors.toList());
        
        // 存入缓存
        if (!posts.isEmpty()) {
            redisUtil.set(POST_LIST_KEY, posts, POST_LIST_EXPIRE);
        }
        
        return posts;
    }

    /**
     * 搜索帖子（带缓存）
     */
    @SuppressWarnings("unchecked")
    public List<Post> searchPosts(String keyword) {
        String key = POST_SEARCH_PREFIX + keyword;
        
        // 先从缓存获取
        List<Post> posts = (List<Post>) redisUtil.get(key);
        if (posts != null) {
            log.info("从缓存获取搜索结果: {}, 数量: {}", keyword, posts.size());
            return posts;
        }

        // 缓存未命中，从数据库查询
        log.info("缓存未命中，从数据库搜索: {}", keyword);
        posts = postRepository.searchPosts(keyword);
        
        // 组装 author 信息
        posts = posts.stream()
                    .map(this::assembleAuthorInfo)
                    .collect(Collectors.toList());
        
        // 存入缓存
        if (!posts.isEmpty()) {
            redisUtil.set(key, posts, POST_SEARCH_EXPIRE);
        }
        
        return posts;
    }

    /**
     * 按作者搜索帖子（带缓存）
     */
    @SuppressWarnings("unchecked")
    public List<Post> searchPostsByAuthor(String keyword) {
        String key = POST_SEARCH_PREFIX + "author:" + keyword;
        
        // 先从缓存获取
        List<Post> posts = (List<Post>) redisUtil.get(key);
        if (posts != null) {
            log.info("从缓存获取作者搜索结果: {}, 数量: {}", keyword, posts.size());
            return posts;
        }

        // 缓存未命中，从数据库查询
        log.info("缓存未命中，从数据库搜索作者: {}", keyword);
        posts = postRepository.searchAuthors(keyword);
        
        // 组装 author 信息
        posts = posts.stream()
                    .map(this::assembleAuthorInfo)
                    .collect(Collectors.toList());
        
        // 存入缓存
        if (!posts.isEmpty()) {
            redisUtil.set(key, posts, POST_SEARCH_EXPIRE);
        }
        
        return posts;
    }

    /**
     * 获取作者的所有帖子（带缓存）
     */
    @SuppressWarnings("unchecked")
    public List<Post> getPostsByAuthor(String authorId) {
        String key = POST_BY_AUTHOR_PREFIX + authorId;
        
        // 先从缓存获取
        List<Post> posts = (List<Post>) redisUtil.get(key);
        if (posts != null) {
            log.info("从缓存获取作者帖子: {}, 数量: {}", authorId, posts.size());
            return posts;
        }

        // 缓存未命中，从数据库查询
        log.info("缓存未命中，从数据库查询作者帖子: {}", authorId);
        posts = postRepository.findByAuthorId(authorId);
        
        // 组装 author 信息
        posts = posts.stream()
                    .map(this::assembleAuthorInfo)
                    .collect(Collectors.toList());
        
        // 存入缓存
        if (!posts.isEmpty()) {
            redisUtil.set(key, posts, POST_LIST_EXPIRE);
        }
        
        return posts;
    }

    /**
     * 保存帖子并清除相关缓存
     */
    public Post savePost(Post post) {
        Post savedPost = postRepository.save(post);
        
        // 清除相关缓存
        clearPostCaches(savedPost);
        
        log.info("保存帖子并清除缓存: {}", savedPost.getId());
        return savedPost;
    }

    /**
     * 更新帖子并清除缓存
     */
    public void updatePost(Post post) {
        postRepository.save(post);
        
        // 清除相关缓存
        clearPostCaches(post);
        
        log.info("更新帖子并清除缓存: {}", post.getId());
    }

    /**
     * 删除帖子并清除缓存
     */
    public void deletePost(String postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post != null) {
            postRepository.deleteById(postId);
            clearPostCaches(post);
            log.info("删除帖子并清除缓存: {}", postId);
        }
    }

    /**
     * 清除所有帖子相关缓存
     */
    public void clearAllPostCaches() {
        // 清除列表缓存
        redisUtil.del(POST_LIST_KEY);
        redisUtil.del(POST_HOT_LIST_KEY);
        
        // 注意：这里无法清除所有详情缓存和搜索缓存
        // 建议使用 Redis 的 SCAN 命令或设置合理的过期时间
        
        log.info("清除所有帖子列表缓存");
    }

    /**
     * 清除特定帖子的相关缓存
     */
    private void clearPostCaches(Post post) {
        // 清除帖子详情缓存
        String detailKey = POST_DETAIL_PREFIX + post.getId();
        redisUtil.del(detailKey);
        
        // 清除列表缓存
        redisUtil.del(POST_LIST_KEY);
        redisUtil.del(POST_HOT_LIST_KEY);
        
        // 清除作者相关缓存
        if (post.getAuthorId() != null) {
            String authorKey = POST_BY_AUTHOR_PREFIX + post.getAuthorId();
            redisUtil.del(authorKey);
        }
        
        // 注意：搜索缓存无法精确清除，等待自动过期
    }    /**
     * 组装帖子的作者信息
     */    private Post assembleAuthorInfo(Post post) {
        Author author = new Author();
        author.setId(post.getAuthorId());
        author.setUsername(post.getAuthorName());
        
        // 优先从数据库读取用户真实头像，如果没有则使用动态生成的头像
        String avatarUrl = null;
        try {
            Long userId = Long.parseLong(post.getAuthorId());
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                avatarUrl = user.getAvatar();
                log.debug("[AssembleAuthor] 使用数据库头像, userId={}, avatar={}", userId, avatarUrl);
            }
        } catch (NumberFormatException e) {
            log.debug("[AssembleAuthor] userId 不是数字格式: {}", post.getAuthorId());
        }
        
        // 如果数据库没有头像，使用 AvatarUtil 动态生成
        if (avatarUrl == null || avatarUrl.isEmpty()) {
            avatarUrl = AvatarUtil.getAvatar(post.getAuthorId(), post.getAuthorName());
            log.debug("[AssembleAuthor] 使用动态生成头像, userId={}, avatar={}", post.getAuthorId(), avatarUrl);
        }
        
        author.setAvatar(avatarUrl);
        post.setAuthorAvatar(avatarUrl);
        
        // 查询作者发帖数和获赞数
        List<Post> authorPosts = postRepository.findByAuthorId(post.getAuthorId());
        author.setAuthorPosts(authorPosts.size());
        int totalLikes = authorPosts.stream()
                                   .mapToInt(Post::getLikesCount)
                                   .sum();
        author.setAuthorLikes(totalLikes);
        
        post.setAuthor(author);
        // 填充图片URL
        try {
            List<String> urls = postImageRepository.findByPostIdOrderBySortOrderAsc(post.getId())
                    .stream().map(img -> img.getUrl()).collect(Collectors.toList());
            post.setImageUrls(urls);
        } catch (Exception ignore) {}
        return post;
    }

    /**
     * 预热缓存：将热门帖子加载到 Redis
     */
    public void warmUpCache() {
        log.info("开始预热帖子缓存...");
        
        // 加载所有帖子到缓存
        List<Post> allPosts = postRepository.findAll();
        
        // 缓存每个帖子详情
        for (Post post : allPosts) {
            post = assembleAuthorInfo(post);
            String key = POST_DETAIL_PREFIX + post.getId();
            redisUtil.set(key, post, POST_DETAIL_EXPIRE);
        }
        
        // 缓存帖子列表
        redisUtil.set(POST_LIST_KEY, allPosts, POST_LIST_EXPIRE);
        
        log.info("缓存预热完成，共缓存 {} 个帖子", allPosts.size());
    }

    /**
     * 清除所有帖子缓存
     */
    public void clearAllCache() {
        log.info("清除所有帖子缓存...");
        
        // 清除列表缓存
        redisUtil.del(POST_LIST_KEY);
        redisUtil.del(POST_HOT_LIST_KEY);
        
        log.info("帖子缓存已清除");
    }
}
