<template>
  <v-container fluid class="fill-height pa-0">
    <div class="my-posts-container">
      <v-sheet class="main-content">
        <!-- 页面标题 -->
        <v-card class="header-section" flat>
          <div class="header-container">
            <v-btn icon variant="text" @click="goBack" class="back-button">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <h2 class="page-title">我的帖子</h2>
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
              <v-btn color="primary" variant="elevated" class="mt-4" @click="loadUserPosts">
                重试
              </v-btn>
            </div>

            <!-- 帖子列表 -->
            <div v-else-if="userPosts.length > 0" class="posts-list">
              <div v-for="post in userPosts" :key="post.id" class="post-card">
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
                    <v-btn color="error" variant="text" @click.stop="confirmDelete(post.id)">
                      删除
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </div>
            </div>

            <!-- 无数据状态 -->
            <div v-else class="empty-state text-center pa-8">
              <v-icon size="64" color="grey-lighten-1">mdi-post-outline</v-icon>
              <p class="mt-4 text-grey">您还没有发布任何帖子</p>
              <v-btn color="primary" variant="elevated" class="mt-4" @click="goToCreatePost">
                发布第一篇帖子
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-sheet>
    </div>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">确认删除</v-card-title>
        <v-card-text>
          确定要删除这篇帖子吗？此操作无法撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" variant="text" @click="deletePost">确认删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示消息 -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityController } from '../controllers/CommunityController'
import type { Post } from '../interface/CommunityInterface'

const router = useRouter()
const { getUserPosts, deletePost: deletePostAPI, loading, error } = useCommunityController()

const userPosts = ref<Post[]>([])
const deleteDialog = ref(false)
const postToDelete = ref<string>('')
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// 获取当前用户信息
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

// 加载用户帖子
const loadUserPosts = async () => {
  if (!currentUser?.userId) {
    showSnackbar('请先登录', 'error')
    router.push('/login')
    return
  }

  try {
    const response = await getUserPosts(currentUser.userId)
    if (response.success) {
      userPosts.value = response.posts
    } else {
      showSnackbar(response.message || '加载失败', 'error')
    }
  } catch (e) {
    console.error('加载用户帖子失败:', e)
    showSnackbar('加载失败，请稍后重试', 'error')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 查看帖子详情
const viewPost = (postId: string) => {
  router.push(`/post/${postId}`)
}

// 去发帖页面
const goToCreatePost = () => {
  router.push('/post/create')
}

// 确认删除
const confirmDelete = (postId: string) => {
  postToDelete.value = postId
  deleteDialog.value = true
}

// 删除帖子
const deletePost = async () => {
  if (!postToDelete.value) {
    deleteDialog.value = false
    return
  }

  try {
    const response = await deletePostAPI(postToDelete.value)
    
    if (response.success) {
      showSnackbar('删除成功', 'success')
      // 从列表中移除已删除的帖子
      userPosts.value = userPosts.value.filter(post => post.id !== postToDelete.value)
    } else {
      showSnackbar(response.message || '删除失败', 'error')
    }
  } catch (e) {
    console.error('删除帖子失败:', e)
    const errorMessage = e instanceof Error ? e.message : '删除失败，请稍后重试'
    showSnackbar(errorMessage, 'error')
  } finally {
    deleteDialog.value = false
    postToDelete.value = ''
  }
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return date.toLocaleDateString('zh-CN')
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

// 获取内容预览
const getContentPreview = (content: string): string => {
  if (!content) return ''
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}

// 显示提示消息
const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  loadUserPosts()
})
</script>

<style scoped>
.my-posts-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
}

.main-content {
  width: 75%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
}

.header-section {
  width: 100%;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  flex-shrink: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.content-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding: 16px;
  padding-bottom: 8px;
}

.post-content {
  padding: 0 16px 16px 16px;
}

.content-preview {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.images-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  position: relative;
}

.more-images-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 600;
  border-radius: 8px;
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty-state,
.error-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .main-content {
    width: 95%;
  }

  .page-title {
    font-size: 20px;
  }

  .images-preview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .main-content {
    width: 100%;
    padding: 10px;
  }

  .images-preview {
    grid-template-columns: 1fr;
  }
}
</style>
