<template>
  <div class="live2d-container">
    <canvas id="live2d-canvas" class="live2d-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { initLive2DModel } from '../utils/live2d'

// 声明全局变量
declare global {
  interface Window {
    PIXI: typeof import('pixi.js')
    Live2DModel: typeof import('pixi-live2d-display').Live2DModel
  }
}

onMounted(async () => {
  try {
    await initLive2DModel({
      modelPath: '/live2d/miku/runtime/miku.model3.json',
      width: 400,
      height: 400,
      transparent: true,
      position: {
        scale: 0.25
      }
    })
  } catch (error) {
    console.error('初始化 Live2D 模型失败:', error)
  }
})
</script>

<style scoped>
.live2d-container {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 400px;
  height: 400px;
  background-color: transparent;
}

.live2d-canvas {
  width: 100%;
  height: 100%;
  border: 2px solid #ccc;
  border-radius: 8px;
}
</style> 