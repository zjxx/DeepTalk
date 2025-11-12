# 我的帖子功能实现说明

## 功能概述
为社区页面添加了"我的帖子"功能，用户可以查看自己发布的所有帖子。

## 实现的功能

### 1. 前端功能
- ✅ 在社区页面工具箱中添加了"我的帖子"入口按钮
- ✅ 创建了独立的"我的帖子"页面 (`MyPosts.vue`)
- ✅ 支持查看用户发布的所有帖子列表
- ✅ 显示帖子的标题、内容预览、图片、点赞数和发布时间
- ✅ 支持点击查看帖子详情
- ✅ 支持跳转到发帖页面
- ✅ 预留了删除帖子功能的UI（待后端支持）
- ✅ 响应式设计，适配移动端

### 2. API 接口
**新增接口定义** (`CommunityInterface.ts`):
- `GetUserPostsRequest`: 获取用户帖子请求接口
- `GetUserPostsResponse`: 获取用户帖子响应接口

**API 端点** (`api.ts`):
- `USER_POSTS: '/api/community/posts/user'`

**API 调用** (`CommunityAPI.ts`):
- `CommunityGetUserPostsAPI()`: 调用后端获取用户帖子的API

### 3. 控制器方法
**CommunityController** (`CommunityController.ts`):
- `getUserPosts(userId: string)`: 获取指定用户的所有帖子

### 4. 路由配置
**新增路由** (`router.ts`):
```typescript
{
  path: '/my-posts',
  name: 'MyPosts',
  component: MyPosts,
  meta: { requiresAuth: true }
}
```

## 文件修改清单

### 新增文件
1. `frontend/src/views/MyPosts.vue` - 我的帖子页面组件

### 修改文件
1. `frontend/src/interface/CommunityInterface.ts`
   - 添加 `GetUserPostsRequest` 接口
   - 添加 `GetUserPostsResponse` 接口

2. `frontend/src/config/api.ts`
   - 添加 `USER_POSTS` API 端点

3. `frontend/src/api/CommunityAPI.ts`
   - 添加 `CommunityGetUserPostsAPI` 方法
   - 更新导入类型

4. `frontend/src/controllers/CommunityController.ts`
   - 添加 `getUserPosts` 方法
   - 导出 `getUserPosts` 方法
   - 更新导入类型

5. `frontend/src/router.ts`
   - 导入 `MyPosts` 组件
   - 添加 `/my-posts` 路由配置

6. `frontend/src/views/Community.vue`
   - 添加"我的帖子"按钮到工具箱
   - 添加 `goToMyPosts()` 方法
   - 更新样式

## 使用方式

### 访问我的帖子页面
1. **从社区页面**: 点击右侧工具箱中的"我的帖子"按钮（邮件图标）
2. **直接访问**: 导航到 `/my-posts` 路径

### 页面功能
- **查看帖子列表**: 显示所有自己发布的帖子
- **查看帖子详情**: 点击帖子卡片或"查看详情"按钮
- **发布新帖**: 点击"发布第一篇帖子"按钮（当没有帖子时）
- **返回**: 点击左上角返回按钮

### 帖子卡片展示信息
- 帖子标题
- 内容预览（最多150字）
- 图片预览（最多显示3张，有更多时显示数量）
- 点赞数
- 发布时间（相对时间，如"3天前"）

## 后端待实现

需要后端实现以下 API：

### 1. 获取用户帖子
```
POST /api/community/posts/user
Content-Type: application/json

请求体:
{
  "userId": "用户ID"
}

响应:
{
  "success": true,
  "message": "获取成功",
  "posts": [
    {
      "id": "帖子ID",
      "title": "标题",
      "content": "内容",
      "authorId": "作者ID",
      "authorName": "作者名",
      "authorAvatar": "头像URL",
      "likesCount": 10,
      "createdAt": "2024-01-15T10:30:00Z",
      "imageUrls": ["图片1", "图片2"]
    }
  ],
  "count": 1
}
```

### 2. 删除帖子（可选，未来扩展）
```
DELETE /api/community/posts/{postId}
```

## 技术栈
- Vue 3 Composition API
- TypeScript
- Vuetify 3
- Vue Router

## 注意事项
1. 用户必须登录才能访问"我的帖子"页面
2. 用户信息从 `localStorage` 或 `sessionStorage` 获取
3. 删除功能UI已实现，但需要后端API支持才能真正删除
4. 时间显示使用相对时间格式（如"3天前"），超过7天显示完整日期

## 测试建议
1. 测试未登录用户访问（应重定向到登录页）
2. 测试已登录用户查看帖子列表
3. 测试无帖子时的空状态显示
4. 测试点击帖子跳转到详情页
5. 测试图片预览功能
6. 测试响应式布局（移动端/桌面端）
