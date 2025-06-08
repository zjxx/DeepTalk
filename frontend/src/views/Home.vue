<template>
  <v-container fluid class="home-container">
    <v-row>
      <!-- 主要内容区 -->
      <v-col cols="12">
        <!-- 欢迎区域 -->
        <v-card class="welcome-card mb-4">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar size="64" class="mr-4">
                <v-img :src="userAvatar" alt="用户头像"></v-img>
              </v-avatar>
              <div>
                <h2 class="text-h4 mb-2">欢迎回来，{{ username }}</h2>
                <p class="text-subtitle-1 text-grey">今天是 {{ currentDate }}，继续你的英语学习之旅吧！</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- 学习进度卡片 -->
        <v-card class="progress-card mb-4">
          <v-card-text>
            <h3 class="text-h6 mb-4">今日学习进度</h3>
            <v-row>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h4 mb-2">50</div>
                  <div class="text-subtitle-2">单词学习</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h4 mb-2">30</div>
                  <div class="text-subtitle-2">分钟口语</div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="text-center">
                  <div class="text-h4 mb-2">1</div>
                  <div class="text-subtitle-2">篇阅读</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row>
          <!-- 评分图表 -->
          <v-col cols="8">
            <ScoreChart />
          </v-col>

          <!-- 待办事项 -->
          <v-col cols="4">
            <TodoList />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ScoreChart from '../components/ScoreChart.vue'
import TodoList from '../components/TodoList.vue'
import { getUserAvatar } from '../controllers/userController'

const username = ref(localStorage.getItem('username') || '同学')
const userAvatar = ref(getUserAvatar())
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

onMounted(() => {
  // 监听头像更新事件
  window.addEventListener('avatar-updated', () => {
    userAvatar.value = getUserAvatar()
  })
})
</script>

<style scoped>
.home-container {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.welcome-card {
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: white;
}

.progress-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.text-h4 {
  font-weight: 600;
  margin: 0;
}

.text-subtitle-1 {
  opacity: 0.9;
}
</style>