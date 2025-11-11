<template>
      <v-container fluid class="fill-height pa-0">
        <!-- 页面容器：左右各留空0.125 -->
        <div class="page-container">
          <!-- 返回按钮 -->
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            class="mb-4"
            @click="goBack"
            color="rgba(10, 100, 200, 0.8)"
          >
            返回
          </v-btn>

          <!-- 主要内容布局：两栏布局 0.7 + 0.3 -->
          <div class="content-layout">
            <!-- 左侧：编辑区域 -->
            <v-card class="post-content-card" elevation="1">
              <!-- 标题输入区域 - 高度0.2 -->
              <div class="title-section">
                <v-card-text class="title-input-area">
                  <h2 class="section-title">发布新帖</h2>
                  <v-text-field
                    v-model="postTitle"
                    placeholder="请输入帖子标题..."
                    variant="outlined"
                    density="comfortable"
                    :counter="100"
                    :rules="titleRules"
                    hide-details="auto"
                    class="title-input"
                  />
                </v-card-text>
              </div>

              <v-divider></v-divider>

              <!-- 正文输入区域 - 高度0.8 -->
              <div class="content-section">
                <v-card-text class="content-input-area">
                  <v-textarea
                    v-model="postContent"
                    placeholder="分享你的想法、经验或见解..."
                    variant="outlined"
                    :rows="18"
                    auto-grow
                    :counter="2000"
                    :rules="contentRules"
                    hide-details="auto"
                    class="content-input"
                  />
                  <div class="image-uploader">
                    <!-- 综合版：拖拽 + 点击 + 粘贴提示 -->
                    <div
                      class="image-drop-zone"
                      :class="{ dragging: isDragging }"
                      @click="pickImages"
                      @dragover.prevent
                      @dragenter.prevent="onDragEnter"
                      @dragleave.prevent="onDragLeave"
                      @drop.prevent="onDropFiles"
                    >
                      <div class="drop-zone-inner">
                        <v-icon size="48" color="primary">mdi-file-image-outline</v-icon>
                        <p class="dz-title">拖拽 / 点击 / 粘贴图片上传</p>
                        <p class="dz-desc">支持 JPG / PNG / WEBP · 单张 ≤5MB · 最多 9 张</p>
                        <v-btn size="small" variant="outlined" class="dz-btn">选择图片</v-btn>
                        <span class="paste-tip">也可使用 Ctrl+V粘贴图片</span>
                        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden-input" @change="onFilesPicked" />
                      </div>
                    </div>
                    <!-- 预览区 -->
                    <div v-if="imagePreviews.length" class="preview-grid">
                      <div v-for="(img, idx) in imagePreviews" :key="img.id" class="preview-item" draggable="true"
                           @dragstart="onDragStart(idx)" @dragover.prevent @drop="onDrop(idx)">
                        <img :src="img.url" alt="preview" />
                        <div class="preview-actions">
                          <v-chip size="x-small">{{ idx + 1 }}</v-chip>
                          <v-btn icon="mdi-close" size="x-small" color="error" variant="text" @click="removeImage(idx)" />
                        </div>
                      </div>
                    </div>
                    <div v-else class="preview-empty">未选择图片</div>
                  </div>
                </v-card-text>
              </div>
            </v-card>

            <!-- 右侧：操作区域 -->
            <v-card class="author-info-card" elevation="1">
              <v-card-text class="author-profile">
                <!-- 发布按钮 -->
                <div class="action-section">
                  <v-btn
                    color="primary"
                    size="large"
                    variant="elevated"
                    class="action-btn publish-btn"
                    :loading="isPublishing"
                    :disabled="!canPublish"
                    @click="handlePublish"
                    block
                  >
                    <v-icon left>mdi-send</v-icon>
                    发布帖子
                  </v-btn>

                  <!-- 清空按钮 -->
                  <v-btn
                    color="secondary"
                    size="large"
                    variant="outlined"
                    class="action-btn clear-btn"
                    :disabled="isPublishing"
                    @click="handleClear"
                    block
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    清空内容
                  </v-btn>
                </div>

                <!-- 字数统计 -->
                <div class="stats-section">
                  <div class="stat-item">
                    <span class="stat-number">{{ postTitle.length }}</span>
                    <span class="stat-label">标题字数 / 100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ postContent.length }}</span>
                    <span class="stat-label">正文字数 / 2000</span>
                  </div>
                </div>


              </v-card-text>
            </v-card>
          </div>

          <!-- 发布成功提示 -->
          <v-snackbar
            v-model="showSuccessMessage"
            color="success"
            timeout="3000"
            location="top"
          >
            发布成功！即将跳转到帖子详情页...
          </v-snackbar>

          <!-- 发布失败提示 -->
          <v-snackbar
            v-model="showErrorMessage"
            color="error"
            timeout="3000"
            location="top"
          >
            {{ errorMessage }}
          </v-snackbar>

          <!-- 清空确认对话框 -->
          <v-dialog v-model="showClearDialog" max-width="400">
            <v-card>
              <v-card-title>确认清空</v-card-title>
              <v-card-text>
                确定要清空所有输入内容吗？此操作不可撤销。
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" variant="text" @click="showClearDialog = false">
                  取消
                </v-btn>
                <v-btn color="error" variant="text" @click="confirmClear">
                  确认清空
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
      </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityController } from '../controllers/CommunityController'
import type { AddPostRequest } from '../interface/CommunityInterface'
import { getUserAvatar } from '../controllers/userController'

const router = useRouter()

const {
  addPost,
  addPostWithImages
} = useCommunityController()

// 表单数据
const postTitle = ref('')
const postContent = ref('')
const isPublishing = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const errorMessage = ref('')
const showClearDialog = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const imageFiles = ref<File[]>([])
const imagePreviews = ref<{ id: string; url: string }[]>([])
let dragIndex = -1
const isDragging = ref(false)

const genId = () => (crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : Math.random().toString(36).slice(2)

// 表单验证规则
const titleRules = [
  (v: string) => !!v || '标题不能为空',
  (v: string) => v.length <= 100 || '标题不能超过100个字符',
  (v: string) => v.length >= 2 || '标题至少需要2个字符'
]

const contentRules = [
  (v: string) => !!v || '内容不能为空',
  (v: string) => v.length <= 2000 || '内容不能超过2000个字符',
  (v: string) => v.length >= 10 || '内容至少需要10个字符'
]

// 计算属性：是否可以发布
const canPublish = computed(() => {
  return postTitle.value.trim().length >= 2 && 
         postTitle.value.trim().length <= 100 &&
         postContent.value.trim().length >= 10 && 
         postContent.value.trim().length <= 2000 &&
         !isPublishing.value
})

// 从本地/会话存储获取当前登录用户
const getCurrentUser = () => {
  const raw = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
  if (!raw) return null
  try {
    return JSON.parse(raw) as { userId: string; username: string; avatar?: string }
  } catch {
    return null
  }
}

const pickImages = () => fileInput.value?.click()

const addFiles = (files: File[]) => {
  const remain = 9 - imageFiles.value.length
  const append = files.slice(0, Math.max(0, remain)).filter(f => {
    const okType = ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    const okSize = f.size <= 5 * 1024 * 1024
    return okType && okSize
  })
  append.forEach(f => {
    imageFiles.value.push(f)
    imagePreviews.value.push({ id: genId(), url: URL.createObjectURL(f) })
  })
}

// 选择文件回调
const onFilesPicked = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []) as File[]
  addFiles(files)
  ;(e.target as HTMLInputElement).value = ''
}

// 粘贴上传：仅在本页挂载时监听
const handlePaste = (e: ClipboardEvent) => {
  const items = Array.from(e.clipboardData?.items || [])
  const files: File[] = []
  for (const item of items) {
    if (item.kind === 'file') {
      const f = item.getAsFile()
      if (f && f.type.startsWith('image/')) files.push(f)
    }
  }
  if (files.length) {
    addFiles(files)
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onBeforeUnmount(() => {
  document.removeEventListener('paste', handlePaste)
})

const removeImage = (idx: number) => {
  URL.revokeObjectURL(imagePreviews.value[idx].url)
  imagePreviews.value.splice(idx, 1)
  imageFiles.value.splice(idx, 1)
}

const onDragStart = (idx: number) => { dragIndex = idx }
const onDrop = (idx: number) => {
  if (dragIndex === -1 || dragIndex === idx) return
  const [p] = imagePreviews.value.splice(dragIndex, 1)
  const [f] = imageFiles.value.splice(dragIndex, 1)
  imagePreviews.value.splice(idx, 0, p)
  imageFiles.value.splice(idx, 0, f)
  dragIndex = -1
}

const onDragEnter = () => { isDragging.value = true }
const onDragLeave = () => { isDragging.value = false }
const onDropFiles = (e: DragEvent) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || []) as File[]
  if (!files.length) return
  addFiles(files)
}

// 处理发布
const handlePublish = async () => {
  if (!canPublish.value) return

  // 校验登录用户
  const currentUser = getCurrentUser()
  if (!currentUser || !currentUser.userId || !currentUser.username) {
    errorMessage.value = '未登录或登录信息失效，请先登录后再发布'
    showErrorMessage.value = true
    return
  }

  isPublishing.value = true
  
  try {
    if (imageFiles.value.length > 0) {
      const res = await addPostWithImages(postTitle.value.trim(), postContent.value.trim(), imageFiles.value)
      if (res.success) {
        showSuccessMessage.value = true
        postTitle.value = ''
        postContent.value = ''
        imagePreviews.value.forEach(p => URL.revokeObjectURL(p.url))
        imagePreviews.value = []
        imageFiles.value = []
        setTimeout(() => {
          if (res.post?.id) router.push(`/post/${res.post.id}`)
          else router.push('/community')
        }, 1200)
      } else {
        errorMessage.value = res.message || '发布失败，请稍后重试'
        showErrorMessage.value = true
      }
    } else {
      // 走原文字发帖
      const postRequest: AddPostRequest = {
        authorId: currentUser.userId,
        post: {
          id: '',
          title: postTitle.value.trim(),
          content: postContent.value.trim(),
          author: {
            id: currentUser.userId,
            username: currentUser.username,
            avatar: currentUser.avatar || getUserAvatar(),
            authorLikes: 0,
            authorPosts: 0
          },
          likesCount: 0,
          createdAt: new Date().toISOString()
        }
      }
      const response = await addPost(postRequest)
      if (response && response.success) {
        showSuccessMessage.value = true
        postTitle.value = ''
        postContent.value = ''
        setTimeout(() => {
          if (response.post && response.post.id) router.push(`/post/${response.post.id}`)
          else router.push('/community')
        }, 1200)
      } else {
        errorMessage.value = response?.message || '发布失败，请稍后重试'
        showErrorMessage.value = true
      }
    }
  } catch (error) {
    console.error('发布失败:', error)
    errorMessage.value = '网络错误，发布失败，请稍后重试'
    showErrorMessage.value = true
  } finally {
    isPublishing.value = false
  }
}

// 处理清空
const handleClear = () => {
  // 检查是否有内容需要清空
  if (postTitle.value.trim() || postContent.value.trim()) {
    showClearDialog.value = true
  } else {
    // 如果没有内容，直接提示
    errorMessage.value = '当前没有需要清空的内容'
    showErrorMessage.value = true
  }
}

// 确认清空
const confirmClear = () => {
  postTitle.value = ''
  postContent.value = ''
  showClearDialog.value = false
  
  // 可选：显示清空成功的提示
  console.log('内容已清空')
}

// 返回社区
const goBack = () => {
  // 检查是否有未保存的内容
  if (postTitle.value.trim() || postContent.value.trim()) {
    // 使用浏览器原生确认对话框
    if (confirm('你有未保存的内容，确定要离开吗？')) {
      router.push('/community')
    }
  } else {
    // 没有内容直接返回
    router.push('/community')
  }
}
</script>

<style scoped>
/* 页面容器：左右各留空0.125 */
.page-container {
  margin: 0 auto;
  max-width: 1200px;
  width: 75%;
  min-height: calc(90vh);
  display: flex;
  flex-direction: column;
}

/* 返回按钮容器 - 保持不变 */
.mb-4 {
  width: 10%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(65, 65, 217, 0.2);
}

/* 两栏布局：改回与PostDetail一致的0.7 + 0.3，确保右侧有足够空间 */
.content-layout {
  display: grid;
  grid-template-columns: 0.7fr 0.3fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

/* 左侧编辑器卡片 - 添加与PostDetail一致的flex布局 */
.post-content-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题输入区域 - 高度0.2 */
.title-section {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.title-input-area {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: #333;
}

.title-input {
  font-size: 18px;
}

/* 正文输入区域 - 高度0.8，添加flex: 1确保占满剩余空间 */
.content-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.content-input-area {
  flex: 1;
  padding: 24px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
}

.content-input {
  flex: 1;
  font-size: 16px;
}

/* 右侧操作卡片 */
.author-info-card {
  height: fit-content;
  position: sticky;
  top: 84px;
}

.author-profile {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 4px;
}

.action-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 统计信息 - 与PostDetail的author-stats样式一致 */
.stats-section {
  display: flex;
  justify-content: space-around;
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
  text-align: center;
}

/* 提示信息 - 替代PostDetail的extension-area */
.tips-section {
  padding: 16px;
  background-color: #e3f2fd;
  border-radius: 8px;
}

.tips-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 12px 0;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 4px;
}

/* 响应式设计 - 与PostDetail一致 */
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

  .title-section {
    min-height: 120px;
  }

  .action-section {
    flex-direction: row;
    gap: 12px;
  }

  .stats-section {
    justify-content: space-between;
    padding: 12px 16px;
  }
}

@media (max-width: 600px) {
  .action-section {
    flex-direction: column;
  }

  .author-profile {
    padding: 16px;
  }

  .tips-section {
    padding: 12px;
  }
}

/* 上传区样式（恢复拖拽区域） */
.image-drop-zone { border:2px dashed #90caf9; background:#f5f9ff; border-radius:12px; padding:32px 16px; text-align:center; cursor:pointer; transition:.2s; position:relative; }
.image-drop-zone.dragging { background:#e3f2fd; border-color:#1976d2; }
.drop-zone-inner { display:flex; flex-direction:column; align-items:center; gap:8px; }
.dz-title { font-size:16px; font-weight:600; margin:4px 0 0; color:#1976d2; }
.dz-desc { font-size:12px; color:#666; margin:0; }
.dz-btn { margin-top:4px; }
.paste-tip { font-size:12px; color:#666; }
.image-uploader { margin-top:16px; display:flex; flex-direction:column; gap:12px; }
.hidden-input { display: none; }
.preview-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
.preview-item { position:relative; border:1px solid #eee; border-radius:8px; overflow:hidden; }
.preview-item img { width:100%; height:120px; object-fit:cover; display:block; }
.preview-actions { position:absolute; top:4px; right:4px; display:flex; gap:6px; align-items:center; }
.preview-empty { color:#888; font-size:13px; }
</style>