-- 清空社区所有数据的 SQL 脚本
-- 警告：此操作不可逆，将删除所有帖子、回复和点赞数据

-- 1. 禁用外键检查（如果有外键约束）
SET FOREIGN_KEY_CHECKS = 0;

-- 2. 清空回复表
TRUNCATE TABLE replies;

-- 3. 清空点赞表
TRUNCATE TABLE post_likes;

-- 4. 清空帖子表
TRUNCATE TABLE posts;

-- 5. 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 显示清空结果
SELECT 'Posts cleared' AS status, COUNT(*) AS count FROM posts
UNION ALL
SELECT 'Replies cleared' AS status, COUNT(*) AS count FROM replies
UNION ALL
SELECT 'Likes cleared' AS status, COUNT(*) AS count FROM post_likes;
