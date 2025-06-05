<template>
  <v-app>
    <v-app-bar app>
      <Navbar />
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height pa-0">
        <v-sheet class="main-content">
          <!-- 返回按钮 -->
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            class="mb-4"
            @click="goBack"
          >
            返回社区
          </v-btn>

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <p class="mt-4">加载中...</p>
          </div>

          <!-- 主要内容布局 -->
          <div v-else-if="currentPost" class="content-layout">
            <!-- 左侧和中间：帖子详情 -->
            <v-card class="post-detail-card" elevation="1">
              <!-- 帖子头部 -->
              <v-card-text class="post-header">
                <div class="author-section">
                  <v-avatar size="48" class="mr-3">
                    <v-img :src="currentPost.author.avatar || '/default-avatar.png'" />
                  </v-avatar>
                  <div class="author-info">
                    <h3 class="author-name">{{ currentPost.author.username }}</h3>
                    <p class="post-time">{{ formatTime(currentPost.time) }}</p>
                  </div>
                </div>
                
                <v-btn
                  :icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'"
                  :color="isLiked ? 'red' : 'grey'"
                  variant="text"
                  @click="handleLike"
                >
                </v-btn>
              </v-card-text>

              <v-divider></v-divider>

              <!-- 帖子内容 -->
              <v-card-text class="post-content">
                <h1 class="post-title">{{ currentPost.title }}</h1>
                <div class="post-body">{{ currentPost.content }}</div>
              </v-card-text>

              <v-divider></v-divider>

              <!-- 点赞统计 -->
              <v-card-text class="post-stats">
                <div class="stat-item">
                  <v-icon size="20" color="red">mdi-heart</v-icon>
                  <span>{{ currentPost.likes }} 点赞</span>
                </div>
              </v-card-text>
            </v-card>

            <!-- 右侧：作者信息 -->
            <v-card class="author-info-card" elevation="1">
              <v-card-text class="author-profile">
                <v-avatar size="80" class="mb-3">
                  <v-img :src="currentPost.author.avatar || '/default-avatar.png'" />
                </v-avatar>
                <h2 class="author-name">{{ currentPost.author.username }}</h2>
                
                <div class="author-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ currentPost.author.posts }}</span>
                    <span class="stat-label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ currentPost.author.likes }}</span>
                    <span class="stat-label">获赞</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- 帖子不存在 -->
          <div v-else class="empty-state text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-file-document-remove</v-icon>
            <p class="mt-4 text-grey">帖子不存在</p>
            <v-btn color="primary" @click="goBack" class="mt-4">返回社区</v-btn>
          </div>
        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import { useCommunityController } from '../controllers/CommunityController'
import type { Post } from '../interface/CommunityInterface'

const route = useRoute()
const router = useRouter()

const {
  posts,
  loading,
  loadCommunityData,
  likePost
} = useCommunityController()

const currentPost = ref<Post | null>(null)
const isLiked = ref(false)

const postId = computed(() => route.params.id as string)

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

// 加载帖子详情
const loadPostDetail = async () => {
  if (posts.value.length === 0) {
    await loadCommunityData()
  }
  
  const post = posts.value.find(p => p.id === postId.value)
  if (post) {
    currentPost.value = post
  }
}

// 处理点赞
const handleLike = async () => {
  if (!currentPost.value) return
  
  try {
    const userId = 'current_user_id'
    const result = await likePost(currentPost.value.id, userId)
    
    isLiked.value = !isLiked.value
    currentPost.value.likes = result.likes
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 返回社区
const goBack = () => {
  router.push('/community')
}

onMounted(() => {
  loadPostDetail()
})
</script>

<style scoped>
.main-content {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.post-detail-card {
  width: 100%;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.author-section {
  display: flex;
  align-items: center;
}

.author-info .author-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.post-time {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

.post-content {
  padding: 20px;
}

.post-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
}

.post-body {
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-stats {
  padding: 16px 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.author-info-card {
  height: fit-content;
  position: sticky;
  top: 84px;
}

.author-profile {
  text-align: center;
  padding: 20px;
}

.author-profile .author-name {
  font-size: 18px;
  font-weight: 600;
  margin: 8px 0 16px 0;
}

.author-stats {
  display: flex;
  justify-content: space-around;
}

.author-stats .stat-item {
  flex-direction: column;
  gap: 4px;
}

.stat-number {
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .main-content {
    width: 95%;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .author-info-card {
    position: static;
  }
}
</style>