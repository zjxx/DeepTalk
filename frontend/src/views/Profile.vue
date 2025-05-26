<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6">
          <v-card-title class="text-h4 mb-6">
            个人资料
          </v-card-title>

          <v-card-text>
            <div class="d-flex align-center mb-6">
              <v-avatar size="64" color="primary" class="mr-4">
                <span class="text-h4">{{ userInitials }}</span>
              </v-avatar>
              <div>
                <div class="text-h6">{{ userModel.email }}</div>
                <div class="text-subtitle-1 text-medium-emphasis">已登录</div>
              </div>
            </div>

            <v-divider class="mb-6"></v-divider>

            <v-btn
              color="error"
              variant="outlined"
              block
              @click="handleLogout"
              :loading="loading"
            >
              退出登录
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import userModel from '../models/user'

const router = useRouter()
const loading = ref(false)

// 计算用户首字母作为头像
const userInitials = computed(() => {
  const email = userModel.email || ''
  return email.charAt(0).toUpperCase()
})

// 处理退出登录
const handleLogout = async () => {
  loading.value = true
  try {
    // 清除本地存储的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('savedEmail')
    localStorage.removeItem('savedPassword')
    // 清除用户模型数据
    userModel.email = ''
    userModel.token = ''
    userModel.isLoggedIn = false
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    console.error('退出失败:', error)
    alert('退出失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}
</style> 