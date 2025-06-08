package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.LikeRequest;
import com.example.deeptalk.modules.community.dto.LikeResponse;
import com.example.deeptalk.modules.community.dto.CheckAuthorRequest;
import com.example.deeptalk.modules.community.dto.CheckAuthorResponse;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.Author;
import com.example.deeptalk.modules.community.service.PostService;
import com.example.deeptalk.service.TokenBlacklistService;
import com.example.deeptalk.config.TestConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommunityController.class)
@Import(TestConfig.class)
@ActiveProfiles("test")
public class CommunityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PostService postService;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private javax.crypto.SecretKey jwtSecretKey;

    private Post testPost;
    private LikeResponse testLikeResponse;
    private Author testAuthor;

    @BeforeEach
    void setUp() {
        testPost = new Post();
        testPost.setId(1L);
        testPost.setTitle("测试帖子");
        testPost.setContent("测试内容");
        testPost.setAuthorId("user123");

        testLikeResponse = new LikeResponse();
        testLikeResponse.setSuccess(true);
        testLikeResponse.setMessage("点赞成功");

        testAuthor = new Author();
        testAuthor.setId("user123");
        testAuthor.setUsername("测试用户");
        testAuthor.setAvatar("");
        testAuthor.setPosts(1);
        testAuthor.setLikes(0);
    }

    @Test
    void searchCommunity() throws Exception {
        when(postService.searchPosts("测试", "posts")).thenReturn(Arrays.asList(testPost));

        SearchRequest request = new SearchRequest();
        request.setQuery("测试");
        request.setType("posts");

        mockMvc.perform(post("/api/community/search")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("测试帖子"))
                .andExpect(jsonPath("$[0].content").value("测试内容"));
    }

    @Test
    void likePost() throws Exception {
        when(postService.likePost(any(LikeRequest.class))).thenReturn(testLikeResponse);

        LikeRequest request = new LikeRequest();
        request.setPostId("1");
        request.setUserId("user123");

        mockMvc.perform(post("/api/community/posts/like")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("点赞成功"));
    }

    @Test
    void addPost() throws Exception {
        when(postService.addPost(any(Post.class))).thenReturn(testPost);

        mockMvc.perform(post("/api/community/posts/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPost)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("测试帖子"))
                .andExpect(jsonPath("$.content").value("测试内容"));
    }

    @Test
    void checkPostAuthor() throws Exception {
        CheckAuthorResponse response = new CheckAuthorResponse();
        response.setAuthor(testAuthor);
        when(postService.getAuthorInfo("user123")).thenReturn(response);

        CheckAuthorRequest request = new CheckAuthorRequest();
        request.setAuthorId("user123");

        mockMvc.perform(post("/api/community/posts/check-author")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.author.id").value("user123"))
                .andExpect(jsonPath("$.author.username").value("测试用户"));
    }
} 