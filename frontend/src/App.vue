<template>
  <v-app>
    <v-app-bar app v-if="showNavbar">
      <Navbar />
    </v-app-bar>

    <Sidebar v-if="showSideDrawer" />

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

export default defineComponent({
  name: 'App',
  components: {
    Navbar,
    Sidebar
  },
  setup() {
    const route = useRoute()
    
    const showNavbar = ref(false)
    const showSideDrawer = ref(false)

    const navRoutes = ['/home', '/explore', '/community', '/shop', '/settings', '/security', '/privacy', '/profile', '/messages', '/private-messages']
    const sideDrawerRoutes = ['/home', '/profile', '/', '/security', '/privacy',  '/messages', '/private-messages']

    const checkRoute = () => {
      const currentPath = route.path
      console.log('当前路由路径:', currentPath);
      console.log('navRoutes 包含当前路径:', navRoutes.includes(currentPath));
      showNavbar.value = navRoutes.includes(currentPath)
      showSideDrawer.value = sideDrawerRoutes.includes(currentPath)
    }

    watch(() => route.path, checkRoute)

    onMounted(checkRoute)

    return {
      showNavbar,
      showSideDrawer
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