-- 将匿名用户的数据更新为正常用户 zjxx (id=2) 的信息
-- 用户信息：
--   id: 2
--   username: zjxx
--   email: 204876260@qq.com
--   password: $2a$10$wtVYHDEN94q.9Zdb7Ee.0uRF7l8AgQi8mn0aNcvm06iqWyP27YCkS
--   role: USER

USE deeptalk;

-- 开始事务
START TRANSACTION;

-- 1. 更新 posts 表中的匿名用户帖子
--    将 author_id 从 'anonymous' 改为 '2'
--    将 author_name 从 '匿名用户' 改为 'zjxx'
UPDATE posts
SET 
    author_id = '2',
    author_name = 'zjxx'
WHERE 
    author_id = 'anonymous' 
    OR author_name = '匿名用户';

-- 2. 更新 replies 表中的匿名用户回复（如果有的话）
UPDATE replies
SET 
    author_id = '2',
    author_name = 'zjxx'
WHERE 
    author_id = 'anonymous' 
    OR author_name = '匿名用户';

-- 3. 更新 post_likes 表中的匿名用户点赞（如果有的话）
UPDATE post_likes
SET user_id = '2'
WHERE user_id = 'anonymous';

-- 4. 更新 post_favorite 表中的匿名用户收藏（如果有的话）
UPDATE post_favorite
SET user_id = '2'
WHERE user_id = 'anonymous';

-- 5. 更新 author_follow 表中的匿名用户关注关系（如果有的话）
UPDATE author_follow
SET follower_id = '2'
WHERE follower_id = 'anonymous';

UPDATE author_follow
SET following_id = '2'
WHERE following_id = 'anonymous';

-- 6. 更新 post_reaction 表中的匿名用户反应（如果有的话）
UPDATE post_reaction
SET user_id = '2'
WHERE user_id = 'anonymous';

-- 提交事务
COMMIT;

-- 验证更新结果
SELECT '===== 更新后的posts表 =====' AS '';
SELECT id, author_id, author_name, title, created_at
FROM posts
WHERE author_id = '2'
ORDER BY created_at DESC;

SELECT '===== 检查是否还有匿名用户数据 =====' AS '';
SELECT COUNT(*) as anonymous_posts_count
FROM posts
WHERE author_id = 'anonymous' OR author_name = '匿名用户';

SELECT COUNT(*) as anonymous_replies_count
FROM replies
WHERE author_id = 'anonymous' OR author_name = '匿名用户';
