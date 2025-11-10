package com.example.deeptalk.modules.community.dto;

import lombok.Data;
import java.util.List;

@Data
public class AuthorListResponse {
    private boolean success = true;
    private List<AuthorView> authors;
}
