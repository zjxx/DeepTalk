<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click.stop="rail = false"
    app
  >
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-account"
        title="首页"
        value="home"
        to="/home"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-shield-account"
        title="账号安全"
        value="security"
        to="/security"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-cog"
        title="个人信息"
        value="profile"
        to="/profile"
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
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Sidebar',
  setup() {
    const drawer = ref(true)
    const rail = ref(false)

    return {
      drawer,
      rail
    }
  }
})
</script> 