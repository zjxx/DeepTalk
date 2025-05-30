<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters>
      <!-- 左侧图片占位区域 -->
      <v-col
        cols="6"
        class="d-none d-md-flex align-center justify-center bg-grey-lighten-4 login-image-col"
      >
        <img src="/images/login-banner.png" alt="DeepTalk登录" class="login-banner" />
      </v-col>

      <!-- 右侧登录表单区域 -->
      <v-col cols="12" md="6" class="d-flex align-center justify-center">
        <v-sheet class="pa-8" width="100%" max-width="400">
          <h2 class="text-h4 font-weight-bold mb-6">登录</h2>

          <v-form @submit.prevent="handleLogin" class="login-form">
            <v-text-field
              v-model="email"
              label="邮箱地址"
              type="email"
              variant="outlined"
              hide-details
              required
              class="form-field"
            ></v-text-field>

            <div class="password-field-container">
              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                variant="outlined"
                hide-details
                required
                class="form-field"
              ></v-text-field>
              <v-tooltip text="密码必须包含至少6个字符，包括字母、数字和符号">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" color="grey" class="password-info-icon"
                    >mdi-information</v-icon
                  >
                </template>
              </v-tooltip>
            </div>

            <div class="d-flex justify-space-between align-center mb-6">
              <v-checkbox
                v-model="rememberMe"
                label="记住我"
                hide-details
                density="compact"
                class="text-body-2"
              ></v-checkbox>
              <v-btn
                variant="text"
                color="primary"
                class="text-none forgot-password-btn"
                to="/forgot-password"
              >
                忘记密码？
              </v-btn>
            </div>

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              登录
            </v-btn>
          </v-form>

          <div class="text-center mt-6 register-section">
            <span class="register-text">还没有账号？</span>
            <v-btn variant="text" color="primary" class="text-none register-btn" to="/register">
              立即注册
            </v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { login, autoLogin } from '../controllers/userController'
import type { LoginRequest } from '../interface/auth'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)

// 在组件挂载时尝试自动登录
onMounted(async () => {
  loading.value = true
  try {
    const success = await autoLogin()
    if (success) {
      // 自动登录成功，直接跳转到个人资料页
      window.location.href = '/profile'
    }
  } catch (error) {
    console.error('自动登录失败: ', error)
  } finally {
    loading.value = false
  }
})

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

const handleLogin = async () => {
  // 验证邮箱格式
  if (!validateEmail(email.value)) {
    alert('请输入有效的邮箱地址')
    return
  }

  // 验证密码
  if (!validatePassword(password.value)) {
    alert('密码长度至少为6个字符')
    return
  }

  loading.value = true
  try {
    const loginRequest: LoginRequest = {
      email: email.value,
      password: password.value,
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

.register-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.register-text,
.register-btn,
.forgot-password-btn {
  font-size: 15px;
  line-height: 1;
}

.login-image-col {
  height: 100vh;
  padding: 0 !important;
}

.login-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-form {
  width: 100%;
}

.form-field {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-field + .password-field-container {
  margin-top: 20px; /* 添加输入框之间的间距 */
}

.password-field-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.password-info-icon {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}
</style>
