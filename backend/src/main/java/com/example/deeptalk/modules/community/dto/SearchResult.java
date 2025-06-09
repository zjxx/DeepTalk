package com.example.deeptalk.modules.community.dto;

import com.example.deeptalk.modules.community.entity.Post;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SearchResult {
    private List<Post> posts;
} 