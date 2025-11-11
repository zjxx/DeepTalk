package com.example.deeptalk.modules.community.controller;

import com.example.deeptalk.modules.community.dto.*;
import com.example.deeptalk.modules.community.entity.Post;
import com.example.deeptalk.modules.community.entity.Reply;
import com.example.deeptalk.modules.community.service.PostService;
import com.example.deeptalk.modules.community.service.ReplyService;
import com.example.deeptalk.modules.community.service.QiniuStorageService;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

@Slf4j
@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {
    @Autowired
    private PostService postService;
    
    @Autowired
    private ReplyService replyService;

    @Autowired
    private QiniuStorageService qiniuStorageService;

    @PostMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SearchResult> searchCommunity(@RequestBody SearchRequest request) {
        List<Post> posts = postService.searchPosts(request.getQuery(), request.getType());
        SearchResult result = new SearchResult();
        result.setPosts(posts);
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = "/posts/latest", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<SearchResult> getLatestPosts() {
        System.out.println("📥 获取最新帖子请求");
       List<Post> posts = postService.searchPosts("","posts");
        SearchResult response = new SearchResult();
        response.setPosts(posts);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/posts/like", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<LikeResponse> likePost(@RequestBody LikeRequest request) {
        LikeResponse response = postService.likePost(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/posts/add", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<AddPostResponse> addPost(@RequestBody AddPostRequest request, HttpServletRequest httpRequest) {
        try {
            Post post = request.getPost();
            // 从认证拦截器注入的请求属性中获取用户
            String tokenUserId = (String) httpRequest.getAttribute("userId");
            String tokenUsername = (String) httpRequest.getAttribute("username");

            // 服务器端作为真实来源：优先使用token中的信息
            String effectiveAuthorId = tokenUserId != null ? tokenUserId : request.getAuthorId();
            String effectiveAuthorName = tokenUsername != null ? tokenUsername
                    : (post.getAuthor() != null && post.getAuthor().getUsername() != null ? post.getAuthor().getUsername() : post.getAuthorName());
            String defaultAvatar = "https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2";
            String effectiveAvatar = (post.getAuthor() != null && post.getAuthor().getAvatar() != null && !post.getAuthor().getAvatar().isEmpty())
                    ? post.getAuthor().getAvatar()
                    : (post.getAuthorAvatar() != null && !post.getAuthorAvatar().isEmpty() ? post.getAuthorAvatar() : defaultAvatar);
            
            // 设置到post中，覆盖客户端传入
            post.setAuthorId(effectiveAuthorId);
            post.setAuthorName(effectiveAuthorName != null ? effectiveAuthorName : "匿名用户");
            post.setAuthorAvatar(effectiveAvatar);
            post.setLikesCount(0);
            post.setCreatedAt(LocalDateTime.now());
            
            System.out.println("addPost: " + post);
            System.out.println("addPostTitle: " + post.getTitle());
            System.out.println("addPostContent: " + post.getContent());
            System.out.println("addPostAuthorId: " + post.getAuthorId());
            System.out.println("addPostAuthorName: " + post.getAuthorName());
            System.out.println("addPostAuthorAvatar: " + post.getAuthorAvatar());
            System.out.println("addPostCreatedAt: " + post.getCreatedAt());
            System.out.println("addPostLikesCount: " + post.getLikesCount());
            
            Post savedPost = postService.addPost(post);
            AddPostResponse response = new AddPostResponse();
            response.setSuccess(true);
            response.setMessage("发帖成功");
            response.setPost(savedPost);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            AddPostResponse response = new AddPostResponse();
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            response.setPost(null);
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping(value = "/posts/add-with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<AddPostWithImagesResponse> addPostWithImages(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            HttpServletRequest httpRequest) {
        long start = System.currentTimeMillis();
        String tokenUserId = (String) httpRequest.getAttribute("userId");
        String tokenUsername = (String) httpRequest.getAttribute("username");
        String rawContentType = httpRequest.getContentType();
        log.info("[AddPostWithImages] raw Content-Type='{}'", rawContentType);
        log.debug("[AddPostWithImages] headers UA='{}'", httpRequest.getHeader("User-Agent"));
        if (title == null || title.isEmpty()) log.warn("[AddPostWithImages] title empty");
        if (content == null || content.isEmpty()) log.warn("[AddPostWithImages] content empty");
        if (images == null) {
            log.warn("[AddPostWithImages] images list is null (no part received)");
        }
        log.info("[AddPostWithImages] start, title='{}', contentLen={}, imagesCount={}, userId={}, username={}",
                title, content != null ? content.length() : 0, images != null ? images.size() : 0, tokenUserId, tokenUsername);
        try {
            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);

            String defaultAvatar = "https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2";

            post.setAuthorId(tokenUserId != null ? tokenUserId : "anonymous");
            post.setAuthorName(tokenUsername != null ? tokenUsername : "匿名用户");
            post.setAuthorAvatar(defaultAvatar);
            post.setLikesCount(0);
            post.setCreatedAt(LocalDateTime.now());

            List<String> uploadedUrls = new ArrayList<>();
            if (images != null) {
                int maxImages = 9;
                for (int i = 0; i < Math.min(images.size(), maxImages); i++) {
                    MultipartFile img = images.get(i);
                    if (img == null || img.isEmpty()) {
                        log.warn("[AddPostWithImages] skip empty file at index {}", i);
                        continue;
                    }
                    log.info("[AddPostWithImages] uploading idx={}, name={}, size={}B, type={}", i, img.getOriginalFilename(), img.getSize(), img.getContentType());
                    String url = qiniuStorageService.uploadImage(img, "community/" + LocalDateTime.now().getYear());
                    uploadedUrls.add(url);
                }
            }
            post.setImageUrls(uploadedUrls);

            Post savedPost = postService.addPost(post);

            AddPostWithImagesResponse resp = new AddPostWithImagesResponse();
            resp.setSuccess(true);
            resp.setMessage("发帖成功");
            resp.setPost(savedPost);
            resp.setImageUrls(uploadedUrls);
            log.info("[AddPostWithImages] success, postId={}, uploaded={}", savedPost.getId(), uploadedUrls.size());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("[AddPostWithImages] failed: {}", e.getMessage(), e);
            AddPostWithImagesResponse resp = new AddPostWithImagesResponse();
            resp.setSuccess(false);
            resp.setMessage("发帖失败: " + e.getMessage());
            resp.setPost(null);
            resp.setImageUrls(List.of());
            return ResponseEntity.internalServerError().body(resp);
        } finally {
            log.info("[AddPostWithImages] end, cost={}ms", System.currentTimeMillis() - start);
        }
    }

    @PostMapping(value = "/posts/check-author", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<CheckAuthorResponse> checkPostAuthor(@RequestBody CheckAuthorRequest request) {
        CheckAuthorResponse response = postService.getAuthorInfo(request.getAuthorId());
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取帖子的回复列表
     */
    @GetMapping(value = "/posts/{postId}/replies", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<GetRepliesResponse> getReplies(@PathVariable String postId) {
        try {
            System.out.println("📥 获取帖子回复，postId: " + postId);
            List<Reply> replies = replyService.getRepliesByPostId(postId);
            
            GetRepliesResponse response = new GetRepliesResponse();
            response.setSuccess(true);
            response.setMessage("获取回复成功");
            response.setReplies(replies);
            response.setCount(replies.size());
            
            System.out.println("✅ 返回 " + replies.size() + " 条回复");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 获取回复失败: " + e.getMessage());
            e.printStackTrace();
            
            GetRepliesResponse response = new GetRepliesResponse();
            response.setSuccess(false);
            response.setMessage("获取回复失败: " + e.getMessage());
            response.setReplies(List.of());
            response.setCount(0);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping(value = "/ping", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Map<String, Object>> ping(HttpServletRequest req) {
        Map<String, Object> m = new HashMap<>();
        m.put("ok", true);
        m.put("uri", req.getRequestURI());
        m.put("time", System.currentTimeMillis());
        return ResponseEntity.ok(m);
    }

    @PostMapping(value = "/posts/debug-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Map<String, Object>> debugUpload(
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            HttpServletRequest httpRequest) {
        String rawContentType = httpRequest.getContentType();
        log.info("[DebugUpload] raw Content-Type='{}'", rawContentType);
        Map<String, Object> m = new HashMap<>();
        m.put("received", true);
        m.put("title", title);
        m.put("contentLen", content == null ? 0 : content.length());
        m.put("imagesCount", images == null ? null : images.size());
        List<Map<String, Object>> files = new ArrayList<>();
        if (images != null) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile f = images.get(i);
                Map<String, Object> fi = new HashMap<>();
                fi.put("index", i);
                fi.put("name", f.getOriginalFilename());
                fi.put("size", f.getSize());
                fi.put("type", f.getContentType());
                files.add(fi);
            }
        }
        m.put("files", files);
        return ResponseEntity.ok(m);
    }
}

@Getter
@Setter
class SearchRequest {
    private String query;
    private String type; // "posts" 或 "authors"
}
