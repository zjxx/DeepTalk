package com.example.deeptalk.modules.auth.dto;

import lombok.Data;

@Data
public class UpdateAvatarRequest {
    private String userId;
    private String avatar;
}
