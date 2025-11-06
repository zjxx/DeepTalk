-- ============================================
-- DeepTalk MySQL数据库初始化脚本
-- ============================================
-- 说明：此脚本用于快速设置DeepTalk项目的MySQL数据库
-- 使用方法：
--   1. 连接到MySQL: mysql -u root -p
--   2. 执行此脚本: source setup-mysql.sql
--   或直接执行: mysql -u root -p < setup-mysql.sql
-- ============================================

-- 1. 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS deeptalk 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 2. 使用数据库
USE deeptalk;

-- 3. 创建专用用户（可选）
-- 如果想使用专用用户而非root，取消下面注释
-- CREATE USER IF NOT EXISTS 'deeptalk_user'@'localhost' IDENTIFIED BY 'DeepTalk@2024';
-- GRANT ALL PRIVILEGES ON deeptalk.* TO 'deeptalk_user'@'localhost';
-- FLUSH PRIVILEGES;

-- 4. 显示数据库信息
SELECT 
  'Database created successfully!' as Status,
  DATABASE() as Current_Database,
  @@character_set_database as Charset,
  @@collation_database as Collation;

-- 5. 说明
SELECT 
  'Important Notes:' as '=== 重要说明 ===',
  'JPA will auto-create tables on first startup' as 'Step_1',
  'Run: mvn clean compile' as 'Step_2',
  'Run: mvn spring-boot:run' as 'Step_3',
  'Expected tables: users, products, orders, user_models, posts, post_likes' as 'Expected_Result';

-- 6. 验证命令
-- 启动项目后，可以执行以下命令验证表是否创建成功：
-- SHOW TABLES;
-- DESCRIBE users;
-- DESCRIBE posts;

-- ============================================
-- 预期的表结构（JPA自动创建）
-- ============================================
/*

表1: users (用户表)
+-------------+--------------+
| Column      | Type         |
+-------------+--------------+
| id          | BIGINT       |
| username    | VARCHAR(255) |
| password    | VARCHAR(255) |
| email       | VARCHAR(255) |
| avatar_url  | VARCHAR(500) |
+-------------+--------------+

表2: products (商品表)
+-------------+--------------+
| Column      | Type         |
+-------------+--------------+
| id          | VARCHAR(36)  |
| name        | VARCHAR(255) |
| type        | VARCHAR(50)  |
| price       | DECIMAL      |
| description | TEXT         |
+-------------+--------------+

表3: orders (订单表)
+-------------+--------------+
| Column      | Type         |
+-------------+--------------+
| id          | VARCHAR(36)  |
| user_id     | BIGINT       |
| product_id  | VARCHAR(36)  |
| order_time  | DATETIME     |
+-------------+--------------+

表4: user_models (用户模型表)
+-------------+--------------+
| Column      | Type         |
+-------------+--------------+
| id          | VARCHAR(36)  |
| user_id     | BIGINT       |
| model_url   | VARCHAR(1000)|
| model_type  | VARCHAR(50)  |
+-------------+--------------+

表5: posts (帖子表)
+---------------+--------------+
| Column        | Type         |
+---------------+--------------+
| id            | VARCHAR(36)  |
| content       | TEXT         |
| author_name   | VARCHAR(100) |
| author_avatar | VARCHAR(500) |
| created_at    | DATETIME     |
| likes         | INT          |
| model_url     | VARCHAR(1000)|
| model_type    | VARCHAR(50)  |
+---------------+--------------+

表6: post_likes (点赞表)
+-------------+--------------+
| Column      | Type         |
+-------------+--------------+
| id          | BIGINT       |
| post_id     | VARCHAR(36)  |
| user_id     | BIGINT       |
| created_at  | DATETIME     |
+-------------+--------------+

*/
