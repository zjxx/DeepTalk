package com.example.deeptalk.modules.community.util;

import java.util.Arrays;
import java.util.List;

/**
 * 头像工具类
 * 为不同用户生成不同的头像URL
 */
public class AvatarUtil {
    
    // 多个不同风格的头像集合
    private static final List<String> AVATAR_SETS = Arrays.asList(
        // 小红书真实头像样式（不同用户）
        "https://sns-avatar-qc.xhscdn.com/avatar/645e4e6f000000001203d14a.jpg",
        "https://sns-avatar-qc.xhscdn.com/avatar/6426a7ab000000002703ab59.jpg", 
        "https://sns-avatar-qc.xhscdn.com/avatar/63f5b0b6000000002303a0cd.jpg",
        "https://sns-avatar-qc.xhscdn.com/avatar/645b3c99000000001203d0e9.jpg",
        "https://sns-avatar-qc.xhscdn.com/avatar/63e8f8b7000000002303a092.jpg",
        
        // UI Avatars - 根据名字生成的彩色头像
        "https://ui-avatars.com/api/?name=User&background=FF6B6B&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Member&background=4ECDC4&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Learner&background=45B7D1&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Student&background=FFA07A&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Teacher&background=98D8C8&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Expert&background=F7DC6F&color=333&size=200",
        "https://ui-avatars.com/api/?name=Master&background=BB8FCE&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Scholar&background=85C1E2&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Buddy&background=F8B500&color=fff&size=200",
        "https://ui-avatars.com/api/?name=Friend&background=52B788&color=fff&size=200"
    );
    
    // 默认头像（当无法生成时使用）
    private static final String DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=DeepTalk&background=4A90E2&color=fff&size=200";
    
    /**
     * 根据用户ID生成头像URL
     * @param userId 用户ID
     * @return 头像URL
     */
    public static String getAvatarByUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            return DEFAULT_AVATAR;
        }
        
        // 使用用户ID的hashCode来选择头像
        int index = Math.abs(userId.hashCode()) % AVATAR_SETS.size();
        return AVATAR_SETS.get(index);
    }
      /**
     * 根据用户名生成头像URL
     * @param username 用户名
     * @return 头像URL
     */
    public static String getAvatarByUsername(String username) {
        if (username == null || username.isEmpty()) {
            return DEFAULT_AVATAR;
        }
        
        // 使用用户名的 hashCode 从头像集合中选择一个
        // 这样不同用户会有不同的头像，但同一用户始终是同一个头像
        int index = Math.abs(username.hashCode()) % AVATAR_SETS.size();
        return AVATAR_SETS.get(index);
    }
    
    /**
     * 根据用户ID和用户名生成头像（优先使用ID确保一致性）
     * @param userId 用户ID
     * @param username 用户名
     * @return 头像URL
     */
    public static String getAvatar(String userId, String username) {
        if (userId != null && !userId.isEmpty()) {
            return getAvatarByUserId(userId);
        } else if (username != null && !username.isEmpty()) {
            return getAvatarByUsername(username);
        } else {
            return DEFAULT_AVATAR;
        }
    }
      /**
     * 获取AI助手的头像
     * @return AI助手头像URL
     */
    public static String getAIAvatar() {
        return "https://ui-avatars.com/api/?name=AI&background=4A90E2&color=fff&size=200&bold=true";
    }
}
