package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.*;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.Author;
import com.example.deeptalk.modules.auth.entity.User;
import com.example.deeptalk.modules.community.service.PostService;
import com.example.deeptalk.service.TokenBlacklistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import javax.crypto.SecretKey;

@WebMvcTest(controllers = CommunityController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CommunityController.class)
public class CommunityControllerTest {

    @Configuration
    static class TestConfig {
        @Bean
        public SecretKey jwtSecretKey() {
            return new javax.crypto.spec.SecretKeySpec("testSecretKey123456789012345678901234567890".getBytes(), "HmacSHA256");
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private SecretKey jwtSecretKey;

    private Post testPost;
    private User testUser;
    private Author testAuthor;

    @BeforeEach
    void setUp() {
        // 创建测试用户
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        // 创建测试作者
        testAuthor = new Author();
        testAuthor.setId(testUser.getId().toString());
        testAuthor.setUsername(testUser.getUsername());
        testAuthor.setAvatar("https://example.com/avatar.jpg");

        // 创建测试帖子
        testPost = new Post();
        testPost.setId("1");
        testPost.setTitle("测试标题");
        testPost.setContent("测试内容");
        testPost.setAuthorId(testAuthor.getId());
        testPost.setAuthorName(testAuthor.getUsername());
        testPost.setAuthorAvatar(testAuthor.getAvatar());
        testPost.setLikesCount(0);
        testPost.setCreatedAt(LocalDateTime.now());
        testPost.setAuthor(testAuthor);

        // Mock TokenBlacklistService
        when(tokenBlacklistService.isBlacklisted(anyString())).thenReturn(false);
    }

    @Test
    void searchCommunitySuccess() throws Exception {
        // 准备测试数据
        List<Post> posts = Arrays.asList(testPost);
        SearchResult searchResult = new SearchResult();
        searchResult.setPosts(posts);

        // Mock service 行为
        when(postService.searchPosts(anyString(), anyString())).thenReturn(posts);

        // 准备请求数据
        SearchRequest request = new SearchRequest();
        request.setQuery("测试");
        request.setType("posts");

        // 执行测试
        mockMvc.perform(post("/api/community/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.posts[0].title").value("测试标题"))
                .andExpect(jsonPath("$.posts[0].content").value("测试内容"));
    }

    @Test
    void likePostSuccess() throws Exception {
        // 准备测试数据
        LikeRequest request = new LikeRequest();
        request.setPostId("1");
        request.setUserId("1");

        LikeResponse response = new LikeResponse();
        response.setSuccess(true);
        response.setMessage("点赞成功");
        response.setLikes(1);

        // Mock service 行为
        when(postService.likePost(any(LikeRequest.class))).thenReturn(response);

        // 执行测试
        mockMvc.perform(post("/api/community/posts/like")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("点赞成功"))
                .andExpect(jsonPath("$.likes").value(1));
    }

    @Test
    void addPostSuccess() throws Exception {
        // 准备测试数据
        AddPostRequest request = new AddPostRequest();
        request.setPost(testPost);
        request.setAuthorId(testAuthor.getId());

        AddPostResponse response = new AddPostResponse();
        response.setSuccess(true);
        response.setMessage("发帖成功");
        response.setPost(testPost);

        // Mock service 行为
        when(postService.addPost(any(Post.class))).thenReturn(testPost);

        // 执行测试
        mockMvc.perform(post("/api/community/posts/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("发帖成功"))
                .andExpect(jsonPath("$.post.title").value("测试标题"))
                .andExpect(jsonPath("$.post.content").value("测试内容"));
    }

    @Test
    void checkPostAuthorSuccess() throws Exception {
        // 准备测试数据
        CheckAuthorRequest request = new CheckAuthorRequest();
        request.setAuthorId(testAuthor.getId());

        CheckAuthorResponse response = new CheckAuthorResponse();
        response.setAuthor(testAuthor);

        // Mock service 行为
        when(postService.getAuthorInfo(anyString())).thenReturn(response);

        // 执行测试
        mockMvc.perform(post("/api/community/posts/check-author")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author.id").value(testAuthor.getId()))
                .andExpect(jsonPath("$.author.username").value(testAuthor.getUsername()))
                .andExpect(jsonPath("$.author.avatar").value(testAuthor.getAvatar()));
    }

    @Test
    void searchCommunityEmptyResult() throws Exception {
        // Mock service 行为返回空列表
        when(postService.searchPosts(anyString(), anyString())).thenReturn(List.of());

        // 准备请求数据
        SearchRequest request = new SearchRequest();
        request.setQuery("不存在的帖子");
        request.setType("posts");

        // 执行测试
        mockMvc.perform(post("/api/community/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.posts").isArray())
                .andExpect(jsonPath("$.posts").isEmpty());
    }

    @Test
    void likePostFailure() throws Exception {
        // 准备测试数据
        LikeRequest request = new LikeRequest();
        request.setPostId("1");
        request.setUserId("1");

        LikeResponse response = new LikeResponse();
        response.setSuccess(false);
        response.setMessage("点赞失败");
        response.setLikes(0);

        // Mock service 行为
        when(postService.likePost(any(LikeRequest.class))).thenReturn(response);

        // 执行测试
        mockMvc.perform(post("/api/community/posts/like")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("点赞失败"))
                .andExpect(jsonPath("$.likes").value(0));
    }

    @Test
    void addPostFailure() throws Exception {
        // 准备测试数据
        AddPostRequest request = new AddPostRequest();
        request.setPost(testPost);
        request.setAuthorId(testAuthor.getId());

        // Mock service 行为抛出异常
        when(postService.addPost(any(Post.class))).thenThrow(new RuntimeException("发帖失败"));

        // 执行测试
        mockMvc.perform(post("/api/community/posts/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void checkPostAuthorNotFound() throws Exception {
        // 准备测试数据
        CheckAuthorRequest request = new CheckAuthorRequest();
        request.setAuthorId("nonexistent");

        CheckAuthorResponse response = new CheckAuthorResponse();
        response.setAuthor(null);

        // Mock service 行为
        when(postService.getAuthorInfo(anyString())).thenReturn(response);

        // 执行测试
        mockMvc.perform(post("/api/community/posts/check-author")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author").isEmpty());
    }
} 