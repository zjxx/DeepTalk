<template>
  <a-layout-header class="header">
    <div class="logo">DeepTalk</div>
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="horizontal"
      class="main-menu"
    >
      <a-menu-item key="home">
        <router-link to="/home">
          <home-outlined />
          主页
        </router-link>
      </a-menu-item>
      
      <a-menu-item key="explore">
        <router-link to="/explore">
          <compass-outlined />
          探索
        </router-link>
      </a-menu-item>
      <a-menu-item key="community">
        <router-link to="/community">
          <team-outlined />
          社区
        </router-link>
      </a-menu-item>
      <a-menu-item key="shop">
        <router-link to="/shop">
          <shop-outlined />
          商店
        </router-link>
      </a-menu-item>
    </a-menu>
    <a-dropdown>
      <div class="user-info">
        <v-avatar size="40" class="ml-2">
          <v-img :src="userAvatar" alt="用户头像"></v-img>
        </v-avatar>
        <span class="username">{{ username }}</span>
      </div>
      <template #overlay>
        <a-menu class="user-dropdown-menu">
          <a-menu-item key="logout" @click="handleLogout">
            <logout-outlined />
            退出登录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  HomeOutlined,
  CompassOutlined,
  TeamOutlined,
  ShopOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { logout, getUserAvatar } from '../controllers/userController'
import userModel from '../models/user'

const userAvatar = ref(getUserAvatar())
const username = ref(userModel.username)
const selectedKeys = ref<string[]>(['home'])

// 监听头像变化
watch(() => getUserAvatar(), (newAvatar) => {
  userAvatar.value = newAvatar
}, { immediate: true })

// 监听自定义头像更新事件
const handleAvatarUpdate = (event: Event) => {
  const customEvent = event as CustomEvent
  userAvatar.value = customEvent.detail.avatar
}

onMounted(() => {
  window.addEventListener('avatar-updated', handleAvatarUpdate)
})

onUnmounted(() => {
  window.removeEventListener('avatar-updated', handleAvatarUpdate)
})

const handleLogout = async () => {
  try {
    await logout()
    // 登出成功后已经在 userController 中跳转到登录页，这里无需额外操作
  } catch (error) {
    console.error('登出失败:', error)
    alert(error instanceof Error ? error.message : '登出失败，请重试')
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0;
  background: #fff;
  box-shadow: none;
  width: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  padding: 0 24px;
  width: 256px; /* 设置logo宽度与侧边栏展开时一致 */
  flex-shrink: 0; /* 防止logo被压缩 */
  text-align: center; /* 使内容居中 */
}

.main-menu {
  flex: 1;
  border-bottom: none;
}

.main-menu :deep(.ant-menu-item) {
  min-width: 120px !important;
  text-align: center;
}

.ant-menu-horizontal.ant-menu-root {
  line-height: 64px;
  border-bottom: none;
}

.ant-menu-horizontal.ant-menu-root > .ant-menu-item,
.ant-menu-horizontal.ant-menu-root > .ant-menu-submenu {
  padding: 0 16px; /* 进一步增加左右内边距 */
  min-width: 100px; /* 设置最小宽度 */
  text-align: center; /* 文字居中 */
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 24px;
}

.username {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.85);
}

:deep(.ant-dropdown-menu) {
  min-width: 100px !important;
  padding: 4px 0;
}

:deep(.ant-dropdown-menu-item) {
  text-align: center !important;
  padding: 8px 16px !important;
  line-height: 1.5 !important;
}

:deep(.ant-dropdown-menu-item .anticon) {
  margin-right: 8px;
}
</style> 