-- 为 users 表添加 avatar 字段
-- 执行日期: 2025-11-12

USE deeptalk;

-- 添加 avatar 列（如果不存在）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) DEFAULT NULL 
COMMENT '用户头像URL';

-- 查看表结构
DESC users;

SELECT '✅ Avatar 字段已成功添加到 users 表' AS status;
