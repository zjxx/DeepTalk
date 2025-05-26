<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters>
      <!-- 左侧图片区域 -->
      <v-col cols="6" class="d-none d-md-flex align-center justify-center bg-grey-lighten-4 login-image-col">
        <img 
          src="/images/login-banner.png" 
          alt="DeepTalk注册" 
          class="login-banner"
        />
      </v-col>

      <!-- 右侧注册表单区域 -->
      <v-col cols="12" md="6" class="d-flex align-center justify-center">
        <v-sheet class="pa-8" width="100%" max-width="400">
          <h2 class="text-h4 font-weight-bold mb-6">注册</h2>
          
          <v-form @submit.prevent="handleRegister" class="register-form">
            <v-text-field
              v-model="username"
              label="用户名"
              variant="outlined"
              hide-details
              required
              class="form-field"
            ></v-text-field>

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
              <v-tooltip text="密码必须包含至少6个字符，且必须同时包含字母和数字">
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" color="grey" class="password-info-icon">mdi-information</v-icon>
                </template>
              </v-tooltip>
            </div>

            <v-text-field
              v-model="confirmPassword"
              label="确认密码"
              type="password"
              variant="outlined"
              hide-details
              required
              class="form-field"
            ></v-text-field>

            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              class="mt-6"
            >
              注册
            </v-btn>
          </v-form>

          <div class="text-center mt-6 register-section">
            <span class="register-text">已有账号？</span>
            <v-btn
              variant="text"
              color="primary"
              class="text-none register-btn"
              to="/login"
            >
              立即登录
            </v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- 验证码弹窗 -->
    <v-dialog v-model="showVerificationDialog" max-width="420">
      <v-card class="py-12 px-8 text-center mx-auto">
        <h3 class="text-h6 mb-2">
          请输入验证码
        </h3>

        <div class="mb-6">验证码已发送至 {{ maskEmail(email) }}</div>

        <v-otp-input
          v-model="verificationCode"
          :disabled="validating"
          variant="outlined"
          length="6"
          class="otp-input"
          @update:model-value="onVerificationCodeChange"
        ></v-otp-input>

        <div class="mt-4">
          <v-btn
            variant="text"
            color="primary"
            class="text-none"
            :disabled="countdown > 0"
            @click="sendVerificationCode"
          >
            {{ countdown > 0 ? `${countdown}秒后重试` : '重新发送' }}
          </v-btn>
        </div>

        <div class="d-flex justify-center mt-6">
          <v-btn
            :loading="validating"
            class="text-none"
            color="primary"
            height="40"
            width="135"
            @click="validateCode"
          >
            验证
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const verificationCode = ref('')
const loading = ref(false)
const countdown = ref(0)
const showVerificationDialog = ref(false)
const validating = ref(false)

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  const hasMinLength = password.length >= 6
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  return hasMinLength && hasLetter && hasNumber
}

const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@')
  const maskedName = name.slice(0, 3) + '*'.repeat(name.length - 3)
  return `${maskedName}@${domain}`
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendVerificationCode = async () => {
  if (!validateEmail(email.value)) {
    alert('请输入有效的邮箱地址')
    return
  }
  
  try {
    // TODO: 调用发送验证码的API
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

const validateCode = async () => {
  if (!verificationCode.value) {
    alert('请输入验证码')
    return
  }

  validating.value = true
  try {
    // TODO: 调用验证码验证API
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    showVerificationDialog.value = false
    router.push('/login')
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    validating.value = false
  }
}

const handleRegister = async () => {
  // 验证用户名
  if (!username.value.trim()) {
    alert('请输入用户名')
    return
  }

  // 验证邮箱格式
  if (!validateEmail(email.value)) {
    alert('请输入有效的邮箱地址')
    return
  }

  // 验证密码
  if (!validatePassword(password.value)) {
    if (password.value.length < 6) {
      alert('密码长度至少为6个字符')
    } else if (!/[a-zA-Z]/.test(password.value)) {
      alert('密码必须包含字母')
    } else if (!/[0-9]/.test(password.value)) {
      alert('密码必须包含数字')
    }
    return
  }

  // 验证确认密码
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    // TODO: 调用注册API
    await sendVerificationCode()
    showVerificationDialog.value = true
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

const onVerificationCodeChange = (value: string) => {
  if (value.length === 6) {
    validateCode()
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
.register-btn {
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

.register-form {
  width: 100%;
}

.form-field {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.form-field + .password-field-container,
.form-field + .form-field,
.password-field-container + .form-field {
  margin-top: 20px;
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
  top: 34%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.otp-input {
  --v-field-border-opacity: 0.2;
  --v-field-border-color: rgb(var(--v-theme-on-surface));
}
</style>