<template>
  <v-container class="security-settings-page">
    <div class="page-container">
      <div class="page-header">
        <h1>        <template>
          <v-container fluid>
            <div class="page-header">
              <h1>历史战绩</h1>
              <p class="subtitle">查看你近期的对战与评分记录，持续进步每一天！</p>
            </div>
            <v-row>
              <v-col v-for="(score, index) in scores" :key="index" cols="12">
                <v-card class="mx-auto score-card" max-width="800" elevation="4" rounded="xl">
                  <v-card-title class="text-h6 card-title">{{ score.type }}</v-card-title>
                  <v-card-text>
                    <div class="score-row">
                      <span class="score-type">{{ score.type }}</span>
                      <span class="score-info">难度: {{ score.difficulty }}</span>
                      <span class="score-info">CET等级: {{ score.cetLevel }}</span>
                      <span class="score-value">评分: <b>{{ score.score }}</b></span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>
        
        <script setup lang="ts">
        import { ref } from 'vue'
        
        const scores = ref([
          { type: 'AI智能对战', difficulty: '初级', cetLevel: 'CET-4', score: 85 },
          { type: '真人对战', difficulty: '中级', cetLevel: 'CET-6', score: 92 },
          { type: 'AI智能对战', difficulty: '高级', cetLevel: 'CET-4', score: 78 },
          { type: '真人对战', difficulty: '初级', cetLevel: 'CET-6', score: 88 },
          { type: 'AI智能对战', difficulty: '中级', cetLevel: 'CET-4', score: 90 },
        ])
        </script>
        
        <style scoped>
        .page-header {
          margin-bottom: 32px;
        }
        
        .page-header h1 {
          font-size: 28px;
          font-weight: 600;
          color: #1f1f1f;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: 16px;
          color: #666;
          margin: 0;
        }
        
        /* 其余样式保持不变 */
        .v-card.score-card {
          transition: transform 0.3s, box-shadow 0.3s;
          background: linear-gradient(135deg, #e0ecff 0%, #f5faff 100%);
          box-shadow: 0 4px 24px 0 rgba(80, 120, 200, 0.10);
          border-radius: 24px;
          margin-bottom: 24px;
        }
        
        .v-card.score-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 8px 32px 0 rgba(80, 120, 200, 0.18);
        }
        
        .card-title {
          text-align: center;
          font-weight: 700;
          color: #3b5998;
          letter-spacing: 2px;
        }
        
        .score-row {
          display: flex;
          gap: 32px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          font-size: 18px;
          padding: 12px 0;
        }
        
        .score-type {
          font-weight: 600;
          color: #4a90e2;
        }
        
        .score-info {
          color: #666;
        }
        
        .score-value {
          color: #ff6f61;
          font-size: 20px;
          font-weight: bold;
          letter-spacing: 1px;
        }
        </style>p>
      </div>
      
      <div class="settings-section">
        <div class="settings-card">
          <div class="card-content">
            <div class="description">
              <h3>修改名称</h3>
              <p>更改您的显示名称，这将影响其他用户看到您的名称</p>
            </div>
            <v-btn color="primary" @click="showConfirmDialog('修改名称')">修改名称</v-btn>
          </div>
        </div>

        <div class="settings-card">
          <div class="card-content">
            <div class="description">
              <h3>更换邮箱</h3>
              <p>更新您的邮箱地址，用于接收重要通知和找回密码</p>
            </div>
            <v-btn color="primary" @click="showConfirmDialog('更换邮箱')">更换邮箱</v-btn>
          </div>
        </div>

        <div class="settings-card">
          <div class="card-content">
            <div class="description">
              <h3>更改密码</h3>
              <p>定期更新密码可以提高账户安全性</p>
            </div>
            <v-btn color="primary" @click="showConfirmDialog('更改密码')">更改密码</v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          确认操作
        </v-card-title>
        <v-card-text>
          是否要进行{{ currentAction }}？
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="dialog = false">
            取消
          </v-btn>
          <v-btn color="primary" variant="text" @click="handleConfirm">
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 更改密码弹窗 -->
    <v-dialog v-model="passwordDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          更改密码
        </v-card-title>
        <v-card-text>
          <v-form ref="changePasswordForm" v-model="changePasswordValid" @submit.prevent="handleChangePassword">
            <v-text-field
              v-model="changePassword.email"
              label="邮箱"
              type="email"
              :rules="[rules.required, rules.email]"
              required
              :disabled="loading"
            ></v-text-field>

            <v-text-field
              v-model="changePassword.verificationCode"
              label="验证码"
              :rules="[rules.required]"
              required
              :disabled="loading"
            >
              <template v-slot:append>
                <v-btn
                  :disabled="loading || !changePassword.email || !isValidEmail(changePassword.email) || countdown > 0"
                  @click="sendChangePasswordCode"
                  :loading="sendingCode"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </v-btn>
              </template>
            </v-text-field>

            <v-text-field
              v-model="changePassword.newPassword"
              label="新密码"
              type="password"
              :rules="[rules.required, rules.password]"
              required
              :disabled="loading"
            ></v-text-field>

            <v-text-field
              v-model="changePassword.confirmPassword"
              label="确认新密码"
              type="password"
              :rules="[rules.required, rules.confirmPassword]"
              required
              :disabled="loading"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="passwordDialog = false">
            取消
          </v-btn>
          <v-btn
            color="primary"
            @click="handleChangePassword"
            :loading="loading"
            :disabled="!changePasswordValid"
          >
            确认修改
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { sendForgotPasswordCode, verifyForgotPasswordCode, resetPassword } from '../controllers/userController'
import userModel from '../models/user'

export default defineComponent({
  name: 'SecuritySettingsPage',
  setup() {
    const dialog = ref(false)
    const currentAction = ref('')
    const passwordDialog = ref(false)
    const loading = ref(false)
    const sendingCode = ref(false)
    const countdown = ref(0)
    const changePasswordValid = ref(false)

    const changePassword = ref({
      email: userModel.email,
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    })

    const rules = {
      required: (v: string) => !!v || '此项为必填项',
      email: (v: string) => /.+@.+\..+/.test(v) || '请输入有效的邮箱地址',
      password: (v: string) => v.length >= 6 || '密码长度至少为6位',
      confirmPassword: (v: string) => v === changePassword.value.newPassword || '两次输入的密码不一致'
    }

    const isValidEmail = (email: string) => {
      return /.+@.+\..+/.test(email)
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

    const sendChangePasswordCode = async () => {
      if (!changePassword.value.email || !isValidEmail(changePassword.value.email)) {
        return
      }

      sendingCode.value = true
      try {
        await sendForgotPasswordCode(changePassword.value.email)
        startCountdown()
      } catch (error) {
        console.error('发送验证码失败:', error)
        alert(error instanceof Error ? error.message : '发送验证码失败')
      } finally {
        sendingCode.value = false
      }
    }

    const handleChangePassword = async () => {
      if (!changePasswordValid.value) {
        return
      }

      loading.value = true
      try {
        // 验证验证码
        const resetToken = await verifyForgotPasswordCode(
          changePassword.value.email,
          changePassword.value.verificationCode
        )

        // 重置密码
        await resetPassword(resetToken, changePassword.value.newPassword)

        alert('密码修改成功')
        // 清空表单并关闭弹窗
        changePassword.value = {
          email: userModel.email,
          verificationCode: '',
          newPassword: '',
          confirmPassword: ''
        }
        passwordDialog.value = false
      } catch (error) {
        console.error('修改密码失败:', error)
        alert(error instanceof Error ? error.message : '修改密码失败')
      } finally {
        loading.value = false
      }
    }

    const showConfirmDialog = (action: string) => {
      currentAction.value = action
      dialog.value = true
    }

    const handleConfirm = () => {
      dialog.value = false
      switch (currentAction.value) {
        case '修改名称':
          handleChangeName()
          break
        case '更换邮箱':
          handleChangeEmail()
          break
        case '更改密码':
          passwordDialog.value = true
          break
      }
    }

    const handleChangeName = () => {
      alert('修改名称功能开发中')
    }

    const handleChangeEmail = () => {
      alert('更换邮箱功能开发中')
    }

    return {
      dialog,
      currentAction,
      passwordDialog,
      loading,
      sendingCode,
      countdown,
      changePasswordValid,
      changePassword,
      rules,
      showConfirmDialog,
      handleConfirm,
      handleChangeName,
      handleChangeEmail,
      handleChangePassword,
      sendChangePasswordCode,
      isValidEmail
    }
  }
})
</script>

<style scoped>
.security-settings-page {
  min-height: 100vh;
  background: #fff;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.settings-section {
  padding: 0;
}

.settings-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.settings-card:last-child {
  margin-bottom: 0;
}

.card-content {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  flex: 1;
}

.description h3 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #1f1f1f;
}

.description p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style> 