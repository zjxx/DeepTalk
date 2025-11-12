<template>
  <v-card
    class="post-preview-card"
    elevation="2"
    hover
    @click="$emit('click')"
  >
    <v-card-text class="post-card-content">
      <div class="post-main-content">
        <!-- 左侧文字内容区 -->
        <div class="post-text-area">
          <!-- 帖子标题 -->
          <h3 class="post-title">{{ post.title }}</h3>
          
          <!-- 帖子内容前100字 -->
          <p class="post-content">{{ formatContent(post.content) }}</p>
          
          <!-- 底部信息 -->
          <div class="post-footer">
            <div class="post-meta">
              <span class="author-name">{{ post.author.username }}</span>
              <span class="post-time">{{ formatTime(post.createdAt) }}</span>
            </div>
            <div class="post-likes">
              <v-icon size="16" color="red">mdi-heart</v-icon>
              <span>{{ post.likesCount }}</span>
            </div>
          </div>
        </div>
        
        <!-- 右侧配图缩略图（最多显示1张） -->
        <div v-if="post.imageUrls && post.imageUrls.length" class="post-thumbnail">
          <v-img
            :src="post.imageUrls[0]"
            class="thumb-img"
            cover
          >
            <div v-if="post.imageUrls.length > 1" class="image-count-badge">
              <v-icon size="12" color="white">mdi-image-multiple</v-icon>
              <span>{{ post.imageUrls.length }}</span>
            </div>
          </v-img>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Post } from '../interface/CommunityInterface'

defineProps<{
  post: Post
}>()

defineEmits<{
  click: []
  like: [postId: string]
  'view-author': [authorId: string]
}>()

// 格式化内容 - 前100字，超出添加"..."，不足以空格补齐
const formatContent = (content: string) => {
  if (content.length > 100) {
    return content.substring(0, 100) + '...'
  } else {
    return content.padEnd(100, ' ')
  }
}

// 格式化时间 - 适配后端时间格式
const formatTime = (time: string) => {
  // 处理后端时间格式：2025-06-08T20:57:39.744338
  const date = new Date(time)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '时间格式错误'
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  // 超过30天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.post-preview-card {
  width: 100%;
  min-height: 160px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 16px;
}

.post-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-card-content {
  padding: 16px;
  padding-top: 48px;
  min-height: 160px;
}

.post-main-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  min-height: 112px;
}

.post-text-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 112px;
  justify-content: space-between;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  line-height: 1.4;
}

.post-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  word-break: break-all;
  max-height: 42px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.post-thumbnail {
  flex-shrink: 0;
  width: 110px;
  height: 110px;
}

.thumb-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.image-count-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>