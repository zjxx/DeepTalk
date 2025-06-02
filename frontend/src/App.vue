<template>
  <v-app>
    <v-app-bar app v-if="showNavbar">
      <Navbar />
    </v-app-bar>

    <v-navigation-drawer
      v-if="showSideDrawer"
      v-model="drawer"
      :rail="rail"
      permanent
      @click.stop="rail = false"
      app
    >
      <v-list>
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
          title="您的用户名或邮箱"
        >
          <template v-slot:append>
            <v-btn
              variant="text"
              icon="mdi-chevron-left"
              @click.stop="rail = !rail"
            ></v-btn>
          </template>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-account"
          title="个人信息"
          value="profile"
          to="/profile"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-shield-account"
          title="账号安全"
          value="security"
          to="/security"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-eye"
          title="隐私设置"
          value="privacy"
          to="/privacy"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          prepend-icon="mdi-post"
          title="我的帖子"
          value="posts"
          to="/posts"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-bookmark"
          title="我的收藏"
          value="favorites"
          to="/favorites"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-history"
          title="浏览历史"
          value="history"
          to="/history"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          prepend-icon="mdi-bell"
          title="系统通知"
          value="notifications"
          to="/notifications"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-message"
          title="互动消息"
          value="messages"
          to="/messages"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-email"
          title="私信"
          value="private-messages"
          to="/private-messages"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          prepend-icon="mdi-logout"
          title="退出登录"
          value="logout"
          @click="handleLogout"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { logoutApi } from './api/user'
import type { AxiosError } from 'axios'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const showNavbar = ref(false)
    const drawer = ref(true)
    const rail = ref(false)
    const showSideDrawer = ref(false)
    const snackbar = ref(false)
    const snackbarText = ref('')
    const snackbarColor = ref('success')

    const navRoutes = ['/profile', '/explore', '/community', '/shop', '/settings']
    
    const sideDrawerRoutes = ['/profile', '/']

    const checkRoute = () => {
      const currentPath = route.path
      showNavbar.value = navRoutes.includes(currentPath)
      showSideDrawer.value = sideDrawerRoutes.includes(currentPath)
    }

    watch(() => route.path, checkRoute)

    onMounted(checkRoute)

    const showMessage = (text: string, color: string = 'success') => {
      snackbarText.value = text
      snackbarColor.value = color
      snackbar.value = true
    }

    const handleLogout = async () => {
      try {
        const email = localStorage.getItem('savedEmail')
        if (email) {
          await logoutApi(email)
        }
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('savedEmail')
        localStorage.removeItem('savedPassword')
        showMessage('登出成功')
        router.push('/login')
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>
        showMessage(axiosError.response?.data?.message || '登出失败，请稍后重试', 'error')
      }
    }

    return {
      showNavbar,
      drawer,
      rail,
      showSideDrawer,
      handleLogout,
      snackbar,
      snackbarText,
      snackbarColor,
    }
  }
})
</script>

<style>
/* 移除原有的 .content 样式，Vuetify 的 v-main 会有自己的默认样式 */
/* .content {
  padding: 0 24px 24px;
  min-height: calc(100vh - 64px);
  background: #fff;
} */

/* 可以根据需要添加全局样式 */
</style> 