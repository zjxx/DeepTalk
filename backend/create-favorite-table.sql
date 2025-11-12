-- ============================================
-- DeepTalk 收藏表创建脚本
-- ============================================
-- 说明：此脚本用于创建帖子收藏功能的数据库表
-- 使用方法：
--   1. 连接到MySQL: mysql -u root -p
--   2. 使用数据库: use deeptalk;
--   3. 执行此脚本: source create-favorite-table.sql
-- ============================================

USE deeptalk;

-- 创建收藏表
CREATE TABLE IF NOT EXISTS post_favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '收藏记录ID',
    post_id VARCHAR(36) NOT NULL COMMENT '帖子ID',
    user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
    UNIQUE KEY uk_post_user (post_id, user_id) COMMENT '同一用户不能重复收藏同一帖子',
    INDEX idx_user_id (user_id) COMMENT '用户ID索引，用于查询用户的收藏列表',
    INDEX idx_post_id (post_id) COMMENT '帖子ID索引，用于查询帖子的收藏数量',
    INDEX idx_created_at (created_at) COMMENT '创建时间索引，用于按时间排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子收藏表';

-- 验证表创建成功
SELECT 
    'Table created successfully!' as Status,
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'deeptalk' 
AND TABLE_NAME = 'post_favorites';

-- 显示表结构
DESCRIBE post_favorites;
