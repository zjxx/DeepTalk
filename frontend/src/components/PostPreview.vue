<template>
  <v-card
    class="post-preview"
    elevation="2"
    hover
    @click="$emit('click')"
  >
    <v-card-text class="post-content">
      <div class="post-header">
        <div class="author-info" @click.stop="$emit('view-author', post.author.id)">
          <v-avatar size="32" class="mr-2">
            <v-img :src="post.author.avatar || '/default-avatar.png'" />
          </v-avatar>
          <div>
            <div class="author-name">{{ post.author.username }}</div>
            <div class="post-time">{{ formatTime(post.time) }}</div>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click.stop="$emit('like', post.id)"
        >
          <v-icon>mdi-heart-outline</v-icon>
        </v-btn>
      </div>

      <h3 class="post-title">{{ post.title }}</h3>
      <p class="post-excerpt">{{ truncateContent(post.content) }}</p>

      <div class="post-footer">
        <div class="post-stats">
          <span class="stat-item">
            <v-icon size="16">mdi-heart</v-icon>
            {{ post.likes }}
          </span>
        </div>
        <v-chip size="small" color="primary" variant="outlined">
          查看详情
        </v-chip>
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

// 截取内容
const truncateContent = (content: string, maxLength = 100) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}
</script>

<style scoped>
.post-preview {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.post-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-content {
  padding: 16px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.author-name {
  font-weight: 500;
  font-size: 14px;
}

.post-time {
  font-size: 12px;
  color: #666;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
}

.post-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}
</style>