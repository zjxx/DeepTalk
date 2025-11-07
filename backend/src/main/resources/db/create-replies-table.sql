-- 创建回复表
CREATE TABLE IF NOT EXISTS replies (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    content TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    author_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    author_avatar VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 查看表结构
DESCRIBE replies;

-- 查看现有回复
SELECT * FROM replies ORDER BY created_at DESC LIMIT 10;
