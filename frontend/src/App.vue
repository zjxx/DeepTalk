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
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { logout } from './controllers/userController'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
  },
  setup() {
    const route = useRoute()
    
    const showNavbar = ref(false)
    const drawer = ref(true)
    const rail = ref(false)
    const showSideDrawer = ref(false)

    const navRoutes = ['/home', '/profile', '/explore', '/community', '/shop', '/settings']
    
    const sideDrawerRoutes = ['/profile', '/']

    const checkRoute = () => {
      const currentPath = route.path
      showNavbar.value = navRoutes.includes(currentPath)
      showSideDrawer.value = sideDrawerRoutes.includes(currentPath)
    }

    watch(() => route.path, checkRoute)

    onMounted(checkRoute)

    const handleLogout = async () => {
      try {
        await logout()
      } catch (error) {
        console.error('登出失败:', error)
        alert(error instanceof Error ? error.message : '登出失败，请重试')
      }
    }

    return {
      showNavbar,
      drawer,
      rail,
      showSideDrawer,
      handleLogout,
    }
  }
})
</script>

<style>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style> 