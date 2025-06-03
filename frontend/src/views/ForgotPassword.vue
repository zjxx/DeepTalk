<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters>
      <!-- 左侧图片区域 -->
      <v-col
        cols="6"
        class="d-none d-md-flex align-center justify-center bg-grey-lighten-4 login-image-col"
      >
        <img src="/images/login-banner.png" alt="DeepTalk忘记密码" class="login-banner" />
      </v-col>

      <!-- 右侧表单区域 -->
      <v-col cols="12" md="6" class="d-flex align-center justify-center">
        <v-sheet class="pa-8" width="100%" max-width="600">
          <h2 class="text-h4 font-weight-bold mb-6">忘记密码</h2>

          <!-- 时间线 -->
          <v-timeline direction="horizontal" class="mb-8" side="end">
            <v-timeline-item :dot-color="currentStep >= 1 ? 'primary' : 'grey'" size="small">
              <div
                class="text-center mb-2"
                :class="currentStep >= 1 ? 'text-primary' : 'text-grey'"
              >
                输入邮箱
              </div>
            </v-timeline-item>

            <v-timeline-item :dot-color="currentStep >= 2 ? 'primary' : 'grey'" size="small">
              <div
                class="text-center mb-2"
                :class="currentStep >= 2 ? 'text-primary' : 'text-grey'"
              >
                验证码验证
              </div>
            </v-timeline-item>

            <v-timeline-item :dot-color="currentStep >= 3 ? 'primary' : 'grey'" size="small">
              <div
                class="text-center mb-2"
                :class="currentStep >= 3 ? 'text-primary' : 'text-grey'"
              >
                重设密码
              </div>
            </v-timeline-item>
          </v-timeline>

          <!-- 步骤1：输入邮箱 -->
          <v-form
            v-if="currentStep === 1"
            @submit.prevent="handleEmailSubmit"
            class="forgot-password-form"
          >
            <v-text-field
              v-model="email"
              label="邮箱地址"
              type="email"
              variant="outlined"
              hide-details
              required
              class="form-field"
            ></v-text-field>

            <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-6">
              发送验证码
            </v-btn>
          </v-form>

          <!-- 步骤2：验证码验证 -->
          <v-form
            v-if="currentStep === 2"
            @submit.prevent="handleVerificationSubmit"
            class="forgot-password-form"
          >
            <div class="text-center mb-6">验证码已发送至 {{ maskEmail(email) }}</div>

            <v-otp-input
              v-model="verificationCode"
              :disabled="validating"
              variant="outlined"
              length="6"
              class="otp-input mb-6"
              @update:model-value="onVerificationCodeChange"
            ></v-otp-input>

            <div class="d-flex justify-space-between align-center">
              <v-btn
                variant="text"
                color="primary"
                class="text-none"
                :disabled="countdown > 0"
                @click="sendVerificationCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '重新发送' }}
              </v-btn>

              <v-btn type="submit" color="primary" :loading="validating"> 验证 </v-btn>
            </div>
          </v-form>

          <!-- 步骤3：重设密码 -->
          <v-form
            v-if="currentStep === 3"
            @submit.prevent="handleResetPassword"
            class="forgot-password-form"
          >
            <v-text-field
              v-model="newPassword"
              label="新密码"
              type="password"
              variant="outlined"
              hide-details
              required
              class="form-field"
            ></v-text-field>

            <v-text-field
              v-model="confirmPassword"
              label="确认新密码"
              type="password"
              variant="outlined"
              hide-details
              required
              class="form-field mt-4"
            ></v-text-field>

            <v-btn type="submit" color="primary" block size="large" :loading="loading" class="mt-6">
              重置密码
            </v-btn>
          </v-form>

          <div class="text-center mt-6">
            <v-btn variant="text" color="primary" class="text-none" to="/login"> 返回登录 </v-btn>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { sendForgotPasswordCode, verifyForgotPasswordCode, resetPassword } from '../controllers/userController'

const router = useRouter()
const currentStep = ref(1)
const email = ref('')
const verificationCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const validating = ref(false)
const countdown = ref(0)

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

const handleEmailSubmit = async () => {
  if (!validateEmail(email.value)) {
    alert('请输入有效的邮箱地址')
    return
  }

  loading.value = true
  try {
    console.log('准备发送验证码到:', email.value)
    await sendForgotPasswordCode(email.value)
    console.log('验证码发送成功')
    startCountdown()
    currentStep.value = 2
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert(error instanceof Error ? error.message : '发送验证码失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const sendVerificationCode = async () => {
  if (countdown.value > 0) return

  try {
    console.log('准备重新发送验证码到:', email.value)
    await sendForgotPasswordCode(email.value)
    console.log('验证码重新发送成功')
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert(error instanceof Error ? error.message : '发送验证码失败，请稍后重试')
  }
}

const handleVerificationSubmit = async () => {
  if (!verificationCode.value) {
    alert('请输入验证码')
    return
  }

  validating.value = true
  try {
    console.log('验证码:', verificationCode.value)
    const resetToken = await verifyForgotPasswordCode(email.value, verificationCode.value)
    console.log('获取到重置令牌:', resetToken)
    // 保存重置令牌
    localStorage.setItem('resetToken', resetToken)
    currentStep.value = 3
  } catch (error) {
    console.error('验证失败:', error)
    alert(error instanceof Error ? error.message : '验证失败，请检查验证码')
  } finally {
    validating.value = false
  }
}

const onVerificationCodeChange = (value: string) => {
  if (value.length === 6) {
    handleVerificationSubmit()
  }
}

const handleResetPassword = async () => {
  if (!validatePassword(newPassword.value)) {
    if (newPassword.value.length < 6) {
      alert('密码长度至少为6个字符')
    } else if (!/[a-zA-Z]/.test(newPassword.value)) {
      alert('密码必须包含字母')
    } else if (!/[0-9]/.test(newPassword.value)) {
      alert('密码必须包含数字')
    }
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const resetToken = localStorage.getItem('resetToken')
    if (!resetToken) {
      throw new Error('重置令牌已失效，请重新验证')
    }

    console.log('准备重置密码:', {
      resetToken,
      newPassword: newPassword.value
    })
    await resetPassword(resetToken, newPassword.value)
    console.log('密码重置成功')
    // 清除重置令牌
    localStorage.removeItem('resetToken')
    router.push('/login')
  } catch (error) {
    console.error('重置密码失败:', error)
    alert(error instanceof Error ? error.message : '重置密码失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-container {
  padding: 0;
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

.forgot-password-form {
  width: 100%;
}

.form-field {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.otp-input {
  --v-field-border-opacity: 0.2;
  --v-field-border-color: rgb(var(--v-theme-on-surface));
}
</style>
