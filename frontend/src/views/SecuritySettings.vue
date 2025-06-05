<template>
  <v-container class="security-settings-page">
    <div class="page-container">
      <div class="page-header">
        <h1>隐私与安全</h1>
        <p class="subtitle">管理您的账户安全和隐私设置</p>
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
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SecuritySettingsPage',
  setup() {
    const dialog = ref(false)
    const currentAction = ref('')

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
          handleChangePassword()
          break
      }
    }

    const handleChangeName = () => {
      alert('修改名称功能开发中')
    }

    const handleChangeEmail = () => {
      alert('更换邮箱功能开发中')
    }

    const handleChangePassword = () => {
      alert('更改密码功能开发中')
    }

    return {
      dialog,
      currentAction,
      showConfirmDialog,
      handleConfirm
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