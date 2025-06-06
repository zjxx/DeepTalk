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
        prepend-icon="mdi-account-cog"
        title="个人信息"
        value="profile"
        to="/profile"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-shield-account"
        title="隐私与安全"
        value="security"
        to="/security"
      ></v-list-item>
      <v-divider></v-divider>
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
      <v-list-item
        prepend-icon="mdi-sword-cross"
        title="口语对战"
        value="versus"
        to="/versus"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-calculator-variant"
        title="评分结果"
        value="evaluation"
        to="/evaluation"
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