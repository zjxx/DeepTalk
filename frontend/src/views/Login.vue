<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters>
      <!-- 左侧图片占位区域 -->
      <v-col cols="6" class="d-none d-md-flex align-center justify-center bg-grey-lighten-4">
        <v-sheet class="pa-4" width="70%" max-width="400">
          <v-icon size="100" color="grey-lighten-1">mdi-image</v-icon>
        </v-sheet>
      </v-col>

      <!-- 右侧登录表单区域 -->
      <v-col cols="12" md="6" class="d-flex align-center justify-center">
        <v-sheet class="pa-8" width="100%" max-width="400">
          <h2 class="text-h4 font-weight-bold mb-6">登录</h2>
          
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="邮箱地址"
              type="email"
              variant="outlined"
              :rules="[v => !!v || '请输入邮箱地址', v => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址']"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="密码"
              type="password"
              variant="outlined"
              :rules="[
                v => !!v || '请输入密码',
                v => v.length >= 8 || '密码至少需要8个字符'
              ]"
              required
            >
              <template v-slot:append>
                <v-tooltip text="密码必须包含至少8个字符，包括字母、数字和符号">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" color="grey">mdi-information</v-icon>
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>

            <div class="d-flex justify-space-between align-center mb-6">
              <v-checkbox
                v-model="rememberMe"
                label="记住我"
                hide-details
                density="compact"
              ></v-checkbox>
              <v-btn
                variant="text"
                color="primary"
                class="text-none"
                to="/forgot-password"
              >
                忘记密码？
              </v-btn>
            </div>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
            >
              登录
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            还没有账号？
            <v-btn
              variant="text"
              color="primary"
              class="text-none"
              to="/register"
            >
              立即注册
            </v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '../controllers/userController'
import type { LoginRequest } from '../interface/auth'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const loginRequest: LoginRequest = {
      email: email.value,
      password: password.value
    }
    await login(loginRequest, rememberMe.value)
  } catch (error) {
    // 错误处理已经在 controller 中完成
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-container {
  padding: 0;
}
</style>