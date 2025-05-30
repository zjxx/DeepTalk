<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()

onMounted(() => {})
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
