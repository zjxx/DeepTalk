<template>
  <v-container fluid class="fill-height pa-0">
    <div class="my-favorites-container">
      <v-sheet class="main-content">
        <!-- 页面标题 -->
        <v-card class="header-section" flat>
          <div class="header-container">
            <v-btn icon variant="text" @click="goBack" class="back-button">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2 class="page-title">我的收藏</h2>
          </div>
        </v-card>

        <!-- 内容区域 -->
        <v-card class="content-section" elevation="1">
          <v-card-text class="posts-container">
            <!-- 加载状态 -->
            <div v-if="loading" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4 text-grey">加载中...</p>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" class="error-state text-center pa-8">
              <v-icon size="64" color="error">mdi-alert-circle</v-icon>
              <p class="mt-4 text-error">{{ error }}</p>
              <v-btn color="primary" variant="elevated" class="mt-4" @click="loadFavorites">
                重试
              </v-btn>
            </div>

            <!-- 帖子列表 -->
            <div v-else-if="favoritePosts.length > 0" class="posts-list">
              <div v-for="post in favoritePosts" :key="post.id" class="post-card">
                <v-card elevation="2" class="mb-4" @click="viewPost(post.id)">
                  <v-card-title class="post-title">{{ post.title }}</v-card-title>
                  <v-card-text class="post-content">
                    <div class="content-preview">{{ getContentPreview(post.content) }}</div>
                    
                    <!-- 图片展示 -->
                    <div v-if="post.imageUrls && post.imageUrls.length > 0" class="images-preview mt-3">
                      <v-img
                        v-for="(url, index) in post.imageUrls.slice(0, 3)"
                        :key="index"
                        :src="url"
                        class="preview-image"
                        cover
                      >
                        <template v-if="index === 2 && post.imageUrls.length > 3">
                          <div class="more-images-overlay">
                            +{{ post.imageUrls.length - 3 }}
                          </div>
                        </template>
                      </v-img>
                    </div>
                    
                    <!-- 作者信息 -->
                    <div class="author-info mt-3">
                      <v-avatar size="32" class="mr-2">
                        <v-img :src="post.authorAvatar || '/default-avatar.png'" />
                      </v-avatar>
                      <span class="author-name">{{ post.authorName }}</span>
                    </div>
                    
                    <div class="post-meta mt-3">
                      <v-chip size="small" variant="text" prepend-icon="mdi-thumb-up">
                        {{ post.likesCount || 0 }} 赞
                      </v-chip>
                      <v-chip size="small" variant="text" prepend-icon="mdi-clock-outline">
                        {{ formatDate(post.createdAt) }}
                      </v-chip>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" variant="text" @click.stop="viewPost(post.id)">
                      查看详情
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="orange" variant="text" @click.stop="toggleFavorite(post.id)">
                      <v-icon>mdi-star</v-icon>
                      取消收藏
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>

            <!-- 无数据状态 -->
            <div v-else class="empty-state text-center pa-8">
              <v-icon size="64" color="grey-lighten-1">mdi-star-outline</v-icon>
              <p class="mt-4 text-grey">您还没有收藏任何帖子</p>
              <v-btn color="primary" variant="elevated" class="mt-4" @click="goToCommunity">
                去社区逛逛
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SocialGetUserFavoritesAPI } from '../api/CommunityAPI'
import type { Post } from '../interface/CommunityInterface'
import { useSocialController } from '../controllers/SocialController'

const router = useRouter()
const { toggleFavorite: apiToggleFavorite } = useSocialController()

const loading = ref(false)
const error = ref<string | null>(null)
const favoritePosts = ref<Post[]>([])

// 获取当前登录用户信息
const getCurrentUser = () => {
  const raw = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  if (!raw) return null
  try {
    return JSON.parse(raw) as { userId: string; username: string; avatar?: string }
  } catch {
    return null
  }
}

const currentUser = getCurrentUser()
const currentUserId = currentUser?.userId || ''

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到社区
const goToCommunity = () => {
  router.push('/community')
}

// 查看帖子详情
const viewPost = (postId: string) => {
  router.push(`/post/${postId}`)
}

// 获取内容预览（截取前100个字符）
const getContentPreview = (content: string) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 加载用户收藏的帖子
const loadFavorites = async () => {
  if (!currentUserId) {
    error.value = '请先登录'
    router.push('/login')
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const posts = await SocialGetUserFavoritesAPI(currentUserId)
    favoritePosts.value = posts || []
  } catch (e) {
    console.error('加载收藏失败:', e)
    error.value = '加载收藏失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 取消收藏
const toggleFavorite = async (postId: string) => {
  try {
    const resp = await apiToggleFavorite(postId, currentUserId, false)
    if (resp && !resp.favorited) {
      // 从列表中移除该帖子
      favoritePosts.value = favoritePosts.value.filter(p => p.id !== postId)
    }
  } catch (e) {
    console.error('取消收藏失败', e)
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.my-favorites-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.main-content {
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
}

.header-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  color: white;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.content-section {
  margin: 20px;
  min-height: 500px;
}

.posts-container {
  padding: 20px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.post-content {
  color: #666;
}

.content-preview {
  line-height: 1.6;
}

.images-preview {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.preview-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
}

.more-images-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border-radius: 8px;
}

.author-info {
  display: flex;
  align-items: center;
}

.author-name {
  font-weight: 500;
  color: #333;
}

.post-meta {
  display: flex;
  gap: 12px;
}

.empty-state,
.error-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .my-favorites-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .posts-container {
    padding: 10px;
  }
}
</style>
