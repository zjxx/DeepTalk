<template>
  <v-container fluid class="fill-height pa-0">
    <div class="home-container">
      <!-- 使用 Navbar 组件 -->
      <Navbar />
      
      <v-sheet class="main-content">
        <!-- 双栏布局区域 -->
        <div class="content-layout">
          <!-- 左侧主要内容区 -->
          <v-card class="content-section" elevation="1">
            <v-card-text class="content-container">
              <!-- 这里后续添加内容列表组件 -->
            </v-card-text>
          </v-card>

          <!-- 右侧信息栏 -->
          <v-card class="info-section" elevation="1">
            <v-card-title class="text-h6 font-weight-bold">个人信息</v-card-title>
            <v-card-text>
              <!-- 这里后续添加个人信息组件 -->
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-title class="text-h6 font-weight-bold">推荐关注</v-card-title>
            <v-card-text>
              <!-- 这里后续添加推荐关注组件 -->
            </v-card-text>
          </v-card>
        </div>
      </v-sheet>
    </div>
  </v-container>
</template>


<script setup lang="ts">
import Navbar from '../components/Navbar.vue';
</script>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;  /* 修改为纵向排列 */
  position: absolute; /* 添加固定定位 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.main-content {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
  flex: 1;  /* 让主内容区域占满剩余空间 */
}

/* 移除原导航栏相关样式 */
.content-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  min-height: calc(100vh - 140px);
}

.content-section,
.info-section {
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.v-card-title {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.v-card-text {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 960px) {
  .main-content {
    width: 90%;
  }

  .content-layout {
    grid-template-columns: 1fr;
  }

  .info-section {
    display: none;
  }
}
</style>