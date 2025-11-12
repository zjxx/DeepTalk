<template>
  <div id="userPageContainer" class="user-page">
    <div class="user">
      <div class="user-content-wrapper">
        <div class="avatar-section">
          <div class="avatar-container" @click="triggerFileInput">
            <v-avatar size="160" class="profile-avatar">
              <v-img :src="userAvatar" alt="用户头像"></v-img>
            </v-avatar>
            <div class="avatar-overlay">
              <div class="overlay-content">
                <v-icon color="white" size="large">mdi-camera</v-icon>
                <span class="overlay-text">点击修改头像</span>
              </div>
            </div>
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          >
        </div>
        <div class="info-section">
          <h2 class="text-h5 font-weight-bold">{{ username }}</h2>
          <p class="user-id-text text-grey-darken-1">id：{{ xiaohongshuId }}</p>
          <v-icon size="small" color="blue">mdi-gender-male</v-icon>
          <div class="data-info">
            <div class="user-interactions">
              <div>
                <span class="count">{{ followCount }}</span>
                <span class="shows">关注</span>
              </div>
              <div>
                <span class="count">{{ fanCount }}</span>
                <span class="shows">粉丝</span>
              </div>
              <div>
                <span class="count">{{ likesAndCollections }}</span>
                <span class="shows">获赞与收藏</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <v-divider class="my-4"></v-divider> -->

    <div class="profile-nav">
      <div
        class="nav-item"
        :class="{ active: activeTab === 'posts' }"
        @click="activeTab = 'posts'"
      >
        帖子
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'collections' }"
        @click="activeTab = 'collections'"
      >
        收藏
      </div>
    </div>

    <div class="tab-content">
      <!-- 帖子内容区域 -->
      <div v-if="activeTab === 'posts'">
        <!-- 加载状态 -->
        <div v-if="postsLoading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="postsError" class="error-state text-center pa-8">
          <v-icon size="64" color="error">mdi-alert-circle</v-icon>
          <p class="mt-4 text-error">{{ postsError }}</p>
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
      </div>

      <!-- 收藏内容区域 -->
      <div v-if="activeTab === 'collections'">
        <!-- 加载状态 -->
        <div v-if="favoritesLoading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="favoritesError" class="error-state text-center pa-8">
          <v-icon size="64" color="error">mdi-alert-circle</v-icon>
          <p class="mt-4 text-error">{{ favoritesError }}</p>
          <v-btn color="primary" variant="elevated" class="mt-4" @click="loadFavorites">
            重试
          </v-btn>
        </div>

        <!-- 收藏帖子列表 -->
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
      </div>
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

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
    </v-snackbar>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import userModel from '../models/user'
import { useSnackbar } from '../composables/useSnackbar'
import { getUserAvatar, setUserAvatar } from '../controllers/userController'
import { uploadAvatarApi, getUserInfoApi } from '../api/user'
import { useCommunityController } from '../controllers/CommunityController'
import { SocialGetUserFavoritesAPI } from '../api/CommunityAPI'
import { useSocialController } from '../controllers/SocialController'
import type { Post } from '../interface/CommunityInterface'

const router = useRouter()
const { snackbar, showSuccess, showError } = useSnackbar()
const { getUserPosts, deletePost: deletePostAPI } = useCommunityController()
const { toggleFavorite: apiToggleFavorite } = useSocialController()

const fileInput = ref<HTMLInputElement | null>(null)
const userAvatar = ref(getUserAvatar())
const username = ref(userModel.username)
const xiaohongshuId = ref(userModel.userId)
const followCount = ref(1)
const fanCount = ref(2)
const likesAndCollections = ref(0)
const isUploading = ref(false)

const activeTab = ref('posts') // 默认激活"帖子"选项卡

// 帖子相关状态
const userPosts = ref<Post[]>([])
const postsLoading = ref(false)
const postsError = ref<string | null>(null)
const deleteDialog = ref(false)
const postToDelete = ref<string>('')

// 收藏相关状态
const favoritePosts = ref<Post[]>([])
const favoritesLoading = ref(false)
const favoritesError = ref<string | null>(null)

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
const currentUserId = currentUser?.userId || xiaohongshuId.value

// 加载用户帖子
const loadUserPosts = async () => {
  if (!currentUserId) {
    postsError.value = '请先登录'
    return
  }

  postsLoading.value = true
  postsError.value = null

  try {
    const response = await getUserPosts(currentUserId)
    if (response.success) {
      userPosts.value = response.posts
    } else {
      postsError.value = response.message || '加载失败'
    }
  } catch (e) {
    console.error('加载用户帖子失败:', e)
    postsError.value = '加载失败，请稍后重试'
  } finally {
    postsLoading.value = false
  }
}

// 加载用户收藏
const loadFavorites = async () => {
  if (!currentUserId) {
    favoritesError.value = '请先登录'
    return
  }
  
  favoritesLoading.value = true
  favoritesError.value = null
  
  try {
    const posts = await SocialGetUserFavoritesAPI(currentUserId)
    favoritePosts.value = posts || []
  } catch (e) {
    console.error('加载收藏失败:', e)
    favoritesError.value = '加载收藏失败，请稍后重试'
  } finally {
    favoritesLoading.value = false
  }
}

// 查看帖子详情
const viewPost = (postId: string) => {
  router.push(`/post/${postId}`)
}

// 去发帖页面
const goToCreatePost = () => {
  router.push('/post/create')
}

// 跳转到社区
const goToCommunity = () => {
  router.push('/community')
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
      showSuccess('删除成功')
      // 从列表中移除已删除的帖子
      userPosts.value = userPosts.value.filter(post => post.id !== postToDelete.value)
    } else {
      showError(response.message || '删除失败')
    }
  } catch (e) {
    console.error('删除帖子失败:', e)
    const errorMessage = e instanceof Error ? e.message : '删除失败，请稍后重试'
    showError(errorMessage)
  } finally {
    deleteDialog.value = false
    postToDelete.value = ''
  }
}

// 取消收藏
const toggleFavorite = async (postId: string) => {
  try {
    const resp = await apiToggleFavorite(postId, currentUserId, false)
    if (resp && !resp.favorited) {
      // 从列表中移除该帖子
      favoritePosts.value = favoritePosts.value.filter(p => p.id !== postId)
      showSuccess('已取消收藏')
    }
  } catch (e) {
    console.error('取消收藏失败', e)
    showError('操作失败，请稍后重试')
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

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'posts' && userPosts.value.length === 0 && !postsLoading.value) {
    loadUserPosts()
  } else if (newTab === 'collections' && favoritePosts.value.length === 0 && !favoritesLoading.value) {
    loadFavorites()
  }
})

// 页面加载时获取最新用户信息
onMounted(async () => {
  try {
    const userInfo = await getUserInfoApi()
    if (userInfo.avatar) {
      // 更新头像
      userAvatar.value = userInfo.avatar
      setUserAvatar(userInfo.avatar)
      console.log('✅ 从服务器获取头像:', userInfo.avatar)
    }
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    // 失败时使用本地缓存的头像
  }
  
  // 默认加载帖子
  loadUserPosts()
})

// 触发文件选择
const triggerFileInput = () => {
  if (isUploading.value) {
    showError('正在上传头像，请稍候...')
    return
  }
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showError('请选择图片文件')
      return
    }
    
    // 检查文件大小（限制为 2MB，与后端一致）
    if (file.size > 2 * 1024 * 1024) {
      showError('图片大小不能超过 2MB')
      return
    }
    
    // 检查文件格式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('仅支持 JPG、PNG、WEBP 格式')
      return
    }
    
    isUploading.value = true
    
    try {
      console.log('🚀 开始上传头像到七牛云...', {
        fileName: file.name,
        size: file.size,
        type: file.type
      })
      
      // 调用后端 API 上传头像到七牛云
      const response = await uploadAvatarApi(file, xiaohongshuId.value)
      
      if (response.success && response.avatarUrl) {
        // 更新 userController 中的头像
        setUserAvatar(response.avatarUrl)
        // 更新本地状态
        userAvatar.value = response.avatarUrl
        // 更新 localStorage 中的用户信息
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          const info = JSON.parse(userInfo)
          info.avatar = response.avatarUrl
          localStorage.setItem('userInfo', JSON.stringify(info))
        }
        showSuccess('头像更新成功')
        console.log('✅ 头像已上传到七牛云:', response.avatarUrl)
      } else {
        showError(response.message || '头像更新失败')
      }
    } catch (error) {
      console.error('❌ 上传头像失败:', error)
      showError('头像上传失败，请重试')
    } finally {
      isUploading.value = false
      // 清空 input，允许重复上传同一文件
      if (target) {
        target.value = ''
      }
    }
  }
}

// 导出函数供模板使用
defineExpose({
  triggerFileInput,
  handleFileChange
})

</script>

<style scoped>
.user-page {
  background-color: #fff; /* 移除灰色背景 */
  padding-top: 20px; /* 顶部间距 */
  margin: 0 auto;
  max-width: 1000px; /* 设置最大宽度并居中 */
}

.user {
  background-color: #fff; /* 用户信息区域背景色 */
  padding: 20px;
  box-shadow: none;
  border-radius: 0;
}

.user-content-wrapper {
  display: flex;
  align-items: stretch; /* 使子项等高 */
}

.avatar-section {
  flex-shrink: 0; /* 防止头像区域缩小 */
  margin-right: 20px; /* 头像与信息间距 */
  display: flex;
  align-items: center; /* 垂直居中头像 wrapper */
  justify-content: center; /* 水平居中头像 wrapper */
  /* 尝试让头像区域的宽度等于其由右侧内容确定的高度 */
  width: 184px; /* 显式设置一个宽度，基于截图的高度 */
  height: auto; /* 高度由 align-items: stretch 决定 */
  aspect-ratio: 1 / 1; /* 保持宽高比 */
}

.avatar-container {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  width: 160px;
  height: 160px;
}

.profile-avatar {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.overlay-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.info-section {
  flex-grow: 1;
  display: flex; /* 使 info-section 成为 flex 容器 */
  flex-direction: column; /* 垂直排列子元素 */
  justify-content: space-between; /* 在垂直方向上平均分配空间 */
}

.avatar {
  margin-right: 20px; /* 头像与信息间距 */
  width: auto;
  height: auto;
}

.basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-basic {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-redId {
  font-size: 14px;
  color: #888;
}

.user-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #555;
}

.user-tags {
  margin-top: 8px;
}

.gender .v-icon {
  vertical-align: middle;
}

.user-id-text {
  font-size: 12px; /* 设置字体大小为 12px */
}

.data-info {
  margin-top: auto; /* 将此元素推到 flex 容器的底部 */
}

.user-interactions {
  display: flex;
  gap: 20px; /* 统计数据之间的间距 */
}

.user-interactions .count {
  font-weight: bold;
  margin-right: 4px;
}

.user-interactions .shows {
  font-size: 14px;
  color: #888;
}

.profile-nav {
  display: flex;
  justify-content: space-around; /* 使项目之间有空间 */
  margin-top: 20px; /* 与分割线的间距 */
  font-size: 16px;
  border-bottom: 1px solid #eee; /* 添加底部细线 */
}

.nav-item {
  cursor: pointer;
  padding: 10px;
  position: relative; /* 用于底部激活指示线 */
}

.nav-item.active {
  color: #000; /* 激活状态字体颜色 */
  font-weight: bold; /* 激活状态字体加粗 */
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-color: #1890ff; 
}

v-divider {
  margin-top: 20px;
}

.tab-content {
  margin-top: 20px; /* 与导航的间距 */
  padding: 0 20px; /* 内容内边距 */
}

/* 删除与选项卡相关的样式 */
/*
.reds-sticky-box {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.reds-tabs-list {
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.reds-tab-item {
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  color: #555;
  flex-grow: 1;
  text-align: center;
  border-right: 1px solid #eee;
}

.reds-tab-item:last-child {
  border-right: none;
}

.reds-tab-item.active {
  color: #000;
  font-weight: bold;
  border-bottom: 2px solid red;
}
*/

/* 删除与内容区域相关的样式 */
/*
.feeds-tab-container {
   margin: 20px auto;\n   max-width: 1000px;\n}
*/

.divider {
  height: 1px;
  background-color: #eee;
  margin: 0 auto;
  max-width: 1000px; /* 适当调整最大宽度，或移除 */
}

/* 帖子列表样式 */
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

.author-info {
  display: flex;
  align-items: center;
}

.author-name {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.post-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.empty-state,
.error-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

</style>