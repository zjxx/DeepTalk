package com.example.deeptalk.modules.auth.dto;

import lombok.Data;

@Data
public class UpdateAvatarResponse {
    private boolean success;
    private String message;
    private String avatar;
}
