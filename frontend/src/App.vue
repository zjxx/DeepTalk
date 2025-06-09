<template>
  <v-app>
    <v-app-bar app v-if="showNavbar">
      <Navbar />
    </v-app-bar>

    <Sidebar v-if="showSidebar" />
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import UserModel from './models/user'

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    Sidebar
  },
  setup() {
    const route = useRoute()
    const showNavbar = ref(false)
    const showSidebar = ref(false)
  

    // 定义需要显示导航栏的路由
    const navRoutes = ['/home', '/explore', '/community', '/shop', '/shop/live2d/:id', '/settings', '/security', '/privacy', '/profile','/repositories','/historical-scores','/matching', '/versus', '/evaluation', '/post/:id', '/post/create']
    // 定义需要显示侧边栏的路由
    const sidebarRoutes = ['/home', '/profile', '/', '/security', '/privacy',  '/repositories','/historical-scores']


    // 从 localStorage 恢复用户信息
    const restoreUserInfo = () => {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const { username, avatar } = JSON.parse(userInfo)
        UserModel.username = username
        UserModel.avatar = avatar
        UserModel.isLoggedIn = true
      }
    }

    
    // 检查是否应该显示导航栏
    const shouldShowNavbar = (path: string) => {
      // 精确匹配
      if (navRoutes.includes(path)) {
        return true
      }
      
      // 动态路由匹配
      if (path.startsWith('/post/') && path !== '/post/create') {
        return true
      }      

      return false
    }

    // 监听路由变化
    watch(() => route.path, (newPath) => {
      showNavbar.value = shouldShowNavbar(newPath)
      showSidebar.value = sidebarRoutes.includes(newPath)
    }, { immediate: true })

    // 组件挂载时检查路由和恢复用户信息
    onMounted(() => {
      const currentPath = route.path
      showNavbar.value = navRoutes.includes(currentPath)
      showSidebar.value = sidebarRoutes.includes(currentPath)
  
      
      // 恢复用户信息
      restoreUserInfo()
    })

    return {
      showNavbar,
      showSidebar
    }
  }
})
</script>

<style>
.v-application {
  min-height: 100vh;
}

/* 确保主内容区域从导航栏下方开始 */
.v-main {
  padding-top: 64px !important; /* 导航栏的高度 */
}
</style> 