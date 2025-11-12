-- 创建作者关注表
CREATE TABLE IF NOT EXISTS author_follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id VARCHAR(255) NOT NULL COMMENT '关注者ID',
    following_id VARCHAR(255) NOT NULL COMMENT '被关注者ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作者关注关系表';
