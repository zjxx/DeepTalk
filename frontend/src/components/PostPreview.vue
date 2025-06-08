<template>
  <v-card
    class="post-preview-card"
    elevation="2"
    hover
    @click="$emit('click')"
  >
    <v-card-text class="post-card-content">
      <!-- 帖子标题 -->
      <h3 class="post-title">{{ post.title }}</h3>
      
      <!-- 帖子内容前100字 -->
      <p class="post-content">{{ formatContent(post.content) }}</p>
      
      <!-- 底部信息 -->
      <div class="post-footer">
        <div class="post-meta">
          <span class="author-name">{{ post.author.username }}</span>
          <span class="post-time">{{ formatTime(post.CreateAt) }}</span>
        </div>
        <div class="post-likes">
          <v-icon size="16" color="red">mdi-heart</v-icon>
          <span>{{ post.likesCount }}</span>
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

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.post-preview-card {
  width: 100%;
  height: 200px;
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
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-content {
  flex: 1;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
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
</style>