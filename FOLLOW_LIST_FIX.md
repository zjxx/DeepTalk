# 关注列表显示问题修复说明

## 问题描述
帖子卡片上显示"已关注"，但左侧的关注列表中却没有展示该作者。

## 问题原因
当用户点击关注按钮后：
1. ✅ `followedAuthors` Set 被正确更新（用于显示关注状态）
2. ❌ `followingAuthors` 数组没有同步更新（用于左侧列表显示）

这导致了两个数据源不一致的问题。

## 解决方案

### 1. 修改 `toggleFollow` 函数
在关注/取消关注操作成功后，同步更新关注列表：

```typescript
const toggleFollow = async (authorId: string) => {
  // ...existing code...
  try {
    const resp = await apiToggleFollow(currentUserId, authorId, !wasFollowed)
    if (!resp) { /* ...error handling... */ }
    
    if (resp.followed) {
      followedAuthors.value.add(authorId)
      // 🔧 关注成功后，重新加载关注列表
      await loadFollowingList()
    } else {
      followedAuthors.value.delete(authorId)
      // 🔧 取消关注后，从列表中移除
      followingAuthors.value = followingAuthors.value.filter(a => a.id !== authorId)
    }
  } catch (e) {
    // ...error handling...
  }
}
```

### 2. 修改 `toggleFollowSidebar` 函数
同样在右侧推荐作者的关注操作中添加列表同步：

```typescript
const toggleFollowSidebar = async (a: { id: string; followed: boolean }) => {
  // ...existing code...
  try {
    const resp = await apiToggleFollow(currentUserId, a.id, !wasFollowed)
    if (!resp) { /* ...error handling... */ }
    
    a.followed = resp.followed
    
    // 🔧 同步更新关注状态和列表
    if (resp.followed) {
      followedAuthors.value.add(a.id)
      await loadFollowingList()
    } else {
      followedAuthors.value.delete(a.id)
      followingAuthors.value = followingAuthors.value.filter(author => author.id !== a.id)
    }
  } catch (e) {
    // ...error handling...
  }
}
```

## 测试步骤

### 方式一：使用测试页面
1. 打开 `test-follow-list.html`
2. 输入你的用户ID（可以从浏览器控制台 localStorage 获取）
3. 测试关注/取消关注功能
4. 验证关注列表 API 返回正确数据

### 方式二：在实际应用中测试
1. 登录应用
2. 在社区页面点击某个作者的"关注"按钮
3. 检查：
   - ✅ 按钮变为"已关注"
   - ✅ 左侧关注列表立即显示该作者
4. 点击"已关注"取消关注
5. 检查：
   - ✅ 按钮变为"关注"
   - ✅ 左侧关注列表移除该作者

## 后端验证

### 检查数据库表是否创建
```sql
USE deeptalk;
SHOW TABLES LIKE 'author_follow';
DESCRIBE author_follow;
```

### 检查关注数据
```sql
SELECT * FROM author_follow WHERE follower_id = 'YOUR_USER_ID';
```

## 已修改的文件
1. `frontend/src/views/Community.vue` - 更新关注操作逻辑
2. `test-follow-list.html` - 新增测试页面

## 注意事项
1. 确保后端服务正在运行（端口 8080）
2. 确保 MySQL 数据库已启动（端口 3307）
3. 确保 `author_follow` 表已创建（JPA 会自动创建）
4. 如果问题依然存在，检查浏览器控制台的网络请求和错误信息
