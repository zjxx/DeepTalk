-- 修复 avatar 字段数据类型
-- 将 VARCHAR(500) 改为 MEDIUMTEXT 以支持 Base64 图片存储

USE deeptalk;

-- 修改 avatar 列的数据类型
ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT;

-- 验证修改
DESCRIBE users;

SELECT 'Avatar 字段已成功修改为 MEDIUMTEXT 类型' AS status;
