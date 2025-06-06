<template>
  <v-container fluid class="fill-height pa-0">
    <div class="community-container">
      <v-sheet class="main-content">
        <!-- 搜索栏 -->
        <v-card class="search-section" flat>
          <div class="search-container">
            <!-- 搜索类型下拉选择框 -->
            <v-select v-model="searchType" :items="searchOptions" item-title="text" item-value="value"
              variant="outlined" hide-details class="search-type-select" density="compact"></v-select>

            <!-- 搜索输入框 -->
            <v-text-field v-model="searchQuery" placeholder="搜索社区内容..." prepend-inner-icon="mdi-magnify"
              variant="outlined" hide-details class="search-input" @update:model-value="handleSearch"
              @keyup.enter="handleSearch"></v-text-field>

            <!-- 搜索按钮 -->
            <!-- 搜索按钮 -->
            <v-btn color="primary" variant="elevated" class="search-button" @click="handleSearch">
              搜索
            </v-btn>
          </div>
        </v-card>

        <!-- 三栏布局区域 -->
        <div class="content-layout">
          <!-- 左侧关注列表 -->
          <v-card class="left-sidebar" elevation="1">
            <v-card-title class="text-h6 font-weight-bold">关注列表</v-card-title>
            <v-card-text class="following-list">
              <!-- 这里后续添加关注列表组件 -->

            </v-card-text>
          </v-card>

          <!-- 中间主要内容区 -->
          <v-card class="center-content" elevation="1">
            <v-card-text class="posts-container">
              <!-- 加载状态 -->
              <div v-if="loading" class="text-center pa-4">
                <v-progress-circular indeterminate></v-progress-circular>
                <p class="mt-2">加载中...</p>
              </div>

              <!-- 帖子列表 -->
              <div v-else-if="posts.length > 0" class="posts-list">
                <PostPreview v-for="post in posts" :key="post.id" :post="post" @click="viewPost(post.id)"
                  @like="handleLike" @view-author="handleViewAuthor" />
              </div>

              <!-- 无数据状态 -->
              <div v-else class="empty-state text-center pa-8">
                <v-icon size="64" color="grey-lighten-1">mdi-post-outline</v-icon>
                <p class="mt-4 text-grey">暂无帖子数据</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- 右侧作者和工具箱 -->
          <div class="right-sidebar">
            <v-card class="author-section mb-4" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">推荐作者</v-card-title>
              <v-card-text>
                <!-- 这里后续添加作者组件 -->

              </v-card-text>
            </v-card>
            <v-card class="toolbox" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">工具箱</v-card-title>
              <v-card-text>
                <!-- 这里后续添加工具组件 -->

              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PostPreview from '../components/PostPreview.vue'
import { useCommunityController } from '../controllers/CommunityController'

const router = useRouter()

const {
  posts,
  loading,
  loadCommunityData,
  searchPosts,
  searchAuthors,
  likePost,
  checkAuthor
} = useCommunityController()

// 搜索相关状态
const searchQuery = ref('')
const searchType = ref('posts')

// 搜索选项
const searchOptions = [
  { text: '按内容搜索', value: 'posts' },
  { text: '按作者搜索', value: 'authors' }
]

// 处理搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  if (searchType.value === 'posts') {
    await searchPosts(searchQuery.value)
  } else if (searchType.value === 'authors') {
    await searchAuthors(searchQuery.value)
  }
}

// 查看帖子详情
const viewPost = (postId: string) => {
  router.push(`/post/${postId}`)
}

// 处理点赞
const handleLike = async (postId: string) => {
  try {
    const userId = 'current_user_id'
    await likePost(postId, userId)
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

// 查看作者信息
const handleViewAuthor = async (authorId: string) => {
  try {
    const authorInfo = await checkAuthor(authorId)
    console.log('作者信息:', authorInfo)
  } catch (error) {
    console.error('获取作者信息失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await loadCommunityData()
})
</script>

<style scoped>

.community-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
}

.main-content {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
}

.search-section {
  width: 100%;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow:  0 2px 8px rgba(0, 0, 0, 0.2);
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-type-select {
  width: 18%;
  flex-shrink: 0;
}

.search-input {
  width: 70%;
  flex-shrink: 0;
}

.search-button {
  width: 8%;
  flex-shrink: 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 0.1875fr 0.625fr 0.1875fr;
  gap: 20px;
  min-height: calc(100vh - 100px);
}

.left-sidebar,
.right-sidebar,
.center-content {
  border-radius: 8px;
  overflow: hidden;
}

.center-content {
  background: white;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.author-section {
  margin-bottom: 20px;
}

.toolbox {
  background: white;
}

.v-card-title {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.v-card-text {
  padding: 16px;
}

/* 修改响应式设计部分 */
/* @media (max-width: 960px) {
  .main-content {
    width: 95%;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .left-sidebar,
  .right-sidebar {
    position: static; //在移动端取消固定定位 
    max-height: none;
  }
} */
</style>

