<template>
  <v-app>
    <v-app-bar app>
      <Navbar />
    </v-app-bar>

    <v-main>
      <v-container fluid class="fill-height pa-0">
        <!-- 页面容器：左右各留空0.125 -->
        <div class="page-container">
          <!-- 返回按钮 -->
          <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack"
            color="rgba(10, 100, 200, 0.8)">
            返回
          </v-btn>

          <!-- 加载状态 -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <p class="mt-4">加载中...</p>
          </div>

          <!-- 主要内容布局：两栏布局 0.7 + 0.3 -->
          <div v-else-if="currentPost" class="content-layout">
            <!-- 左侧：帖子主要内容 -->
            <v-card class="post-content-card" elevation="1">
              <!-- 标题和点赞按钮 -->
              <v-card-text class="post-header">
                <h1 class="post-title">{{ currentPost.title }}</h1>
                <v-btn :icon="isLiked ? 'mdi-heart' : 'mdi-heart-outline'" :color="isLiked ? 'red' : 'grey'"
                  variant="text" size="large" :loading="isProcessingLike" :disabled="isProcessingLike"
                  @click="handleLike">
                </v-btn>
              </v-card-text>

              <!-- 时间行 -->
              <v-card-text class="post-time-section">
                <span class="post-time">{{ formatTime(currentPost.createdAt) }}</span>
                <span class="post-likes">
                  <v-icon size="16" color="red">mdi-heart</v-icon>
                  {{ currentPost.likesCount }} 点赞
                </span>
              </v-card-text>

              <v-divider></v-divider>

              <!-- 正文内容 -->
              <v-card-text class="post-body-section">
                <div class="post-body">{{ currentPost.content }}</div>
              </v-card-text>
            </v-card>

            <!-- 右侧：作者信息 -->
            <v-card class="author-info-card" elevation="1">
              <v-card-text class="author-profile">
                <!-- 作者头像和名称 -->
                <div class="author-basic-info">
                  <v-avatar size="80" class="mb-3">
                    <v-img :src="currentPost.author.avatar || '/default-avatar.png'" />
                  </v-avatar>
                  <h2 class="author-name">{{ currentPost.author.username }}</h2>
                </div>

                <!-- 作者统计信息 -->
                <div class="author-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ currentPost.author.authorPosts }}</span>
                    <span class="stat-label">帖子</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ currentPost.author.authorLikes }}</span>
                    <span class="stat-label">获赞</span>
                  </div>
                </div>

                <!-- 预留扩展空间 -->
                <div class="extension-area">
                  <!-- 这里预留给未来功能扩展 -->
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
        </div>
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
const isProcessingLike = ref(false)

const postId = computed(() => route.params.id as string)

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

  // 添加加载状态防止重复点击
  const isProcessing = ref(false)
  if (isProcessing.value) return

  isProcessing.value = true

  try {
    const userId = 'current_user_id'
    const result = await likePost(currentPost.value.id, userId)

    // 只有成功时才更新UI
    isLiked.value = !isLiked.value
    currentPost.value.likesCount = result.likes
  } catch (error) {
    console.error('点赞失败:', error)

    // 点赞失败时按钮保持原样，不做任何UI更新
    // 可选：显示错误提示
  } finally {
    isProcessing.value = false
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
/* 页面容器：左右各留空0.125 */
.page-container {
  margin: 0 12.5%;
  padding: 20px 0;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

/* 返回按钮容器 - 控制在左侧0.2的范围内 */
.mb-4 {
  width: 10%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(65, 65, 217, 0.2);
}

/* 两栏布局：0.7 + 0.3 */
.content-layout {
  display: grid;
  grid-template-columns: 0.7fr 0.3fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

/* 左侧帖子内容卡片 */
.post-content-card {
  height: 100%;
  flex-direction: column;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  padding-bottom: 16px;
  flex-shrink: 0;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 16px;
}

.post-time-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px 16px 24px;
}

.post-time {
  font-size: 14px;
  color: #666;
}

.post-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.post-body-section {
  padding: 24px;
  padding-top: 16px;
}

.post-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

/* 右侧作者信息卡片 */
.author-info-card {
  height: fit-content;
  position: sticky;
  top: 84px;
}

.author-profile {
  padding: 24px;
  text-align: center;
}

.author-basic-info {
  margin-bottom: 20px;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #333;
}

.author-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding: 16px 0;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #1976d2;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 预留扩展空间 */
.extension-area {
  min-height: 100px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.extension-area::before {
  content: "预留扩展区域";
}

.empty-state {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .page-container {
    margin: 0 5%;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .author-info-card {
    position: static;
  }

  .post-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-title {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>