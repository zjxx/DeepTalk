<template>
  <v-container fluid class="fill-height pa-0">
    <div class="community-container">
      <v-sheet class="main-content">
        <!-- 搜索栏 -->
        <v-card class="search-section" flat>
  <div class="search-container">
    <!-- 搜索类型下拉选择框 -->
    <v-select
      v-model="searchType"
      :items="searchOptions"
      item-title="text"
      item-value="value"
      variant="outlined"
      hide-details
      class="search-type-select"
      density="compact"
    ></v-select>
    
    <!-- 搜索输入框 -->
    <v-text-field
      v-model="searchQuery"
      placeholder="搜索社区内容..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      hide-details
      class="search-input"
      @update:model-value="handleSearch"
      @keyup.enter="handleSearch"
    ></v-text-field>

    <!-- 搜索按钮 -->
    <!-- 搜索按钮 -->
    <v-btn
      color="primary"
      variant="elevated"
      class="search-button"
      @click="handleSearch"
    >
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
              <!-- 这里后续添加帖子列表组件 -->

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
import { ref } from 'vue'
import { useCommunityController } from '../controllers/CommunityController'

const {
  searchPosts,
  searchAuthors
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

