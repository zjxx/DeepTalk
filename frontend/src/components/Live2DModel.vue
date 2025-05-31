<template>
  <div ref="live2dContainer" class="live2d-container" :style="containerStyle">
    <!-- 模型加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <div class="mt-2">加载模型中...</div>
    </div>
    
    <!-- 模型加载失败时的备用头像 -->
    <div v-else-if="!modelLoaded" class="fallback-avatar">
      <v-avatar size="80" :color="getAvatarColor()" class="mb-3">
        <span class="text-h4">{{ getAvatarInitial() }}</span>
      </v-avatar>
      <div class="text-body-2">{{ characterType === 'ai' ? 'AI助手' : '模型加载失败' }}</div>
    </div>
    
    <!-- Live2D模型容器 -->
    <canvas 
      v-else
      ref="live2dCanvas" 
      class="live2d-canvas"
      :width="width"
      :height="height"
    ></canvas>
    
    <!-- 说话状态指示器 -->
    <div v-if="modelLoaded && isSpeaking" class="speaking-indicator">
      <v-icon color="success" class="speaking-icon">mdi-microphone</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

interface Props {
  modelUrl?: string
  width?: number
  height?: number
  isSpeaking?: boolean
  characterType?: 'user' | 'partner' | 'ai'
}

const props = withDefaults(defineProps<Props>(), {
  modelUrl: '',
  width: 280,
  height: 280,
  isSpeaking: false,
  characterType: 'user'
})

const live2dContainer = ref<HTMLDivElement>()
const live2dCanvas = ref<HTMLCanvasElement>()
const loading = ref(true)
const modelLoaded = ref(false)

// 计算容器样式
const containerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`
}))

// 获取头像颜色
const getAvatarColor = (): string => {
  const colors = {
    user: 'primary',
    partner: 'secondary', 
    ai: 'success'
  }
  return colors[props.characterType] || 'primary'
}

// 获取头像首字母
const getAvatarInitial = (): string => {
  const initials = {
    user: 'U',
    partner: 'P',
    ai: 'AI'
  }
  return initials[props.characterType] || 'U'
}

// 获取模型URL
const getModelUrl = (): string => {
  if (props.modelUrl) return props.modelUrl
  
  const defaultUrls = {
    user: '/models/user/user.model3.json',
    partner: '/models/partner/partner.model3.json',
    ai: '/models/ai/ai.model3.json'
  }
  return defaultUrls[props.characterType] || defaultUrls.user
}

// 初始化Live2D模型
const initLive2D = async () => {
  loading.value = true
  modelLoaded.value = false
  
  try {
    // 检查模型文件是否存在
    const modelUrl = getModelUrl()
    const response = await fetch(modelUrl)
    
    if (!response.ok) {
      throw new Error(`模型文件不存在: ${modelUrl}`)
    }
    
    // TODO: 这里集成真实的Live2D库
    // 目前使用模拟实现
    await simulateModelLoading()
    
    console.log(`${props.characterType} 模型加载成功:`, modelUrl)
    modelLoaded.value = true
  } catch (error) {
    console.warn(`Live2D模型加载失败:`, error)
    modelLoaded.value = false
  } finally {
    loading.value = false
  }
}

// 模拟模型加载过程
const simulateModelLoading = async (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟绘制简单的模型替代
      if (live2dCanvas.value) {
        const ctx = live2dCanvas.value.getContext('2d')
        if (ctx) {
          // 清除画布
          ctx.clearRect(0, 0, props.width, props.height)
          
          // 绘制简单的人物轮廓
          const centerX = props.width / 2
          const centerY = props.height / 2
          
          // 绘制头部
          ctx.fillStyle = getAvatarColor() === 'primary' ? '#2196F3' : 
                          getAvatarColor() === 'secondary' ? '#FF9800' : '#4CAF50'
          ctx.beginPath()
          ctx.arc(centerX, centerY - 20, 40, 0, 2 * Math.PI)
          ctx.fill()
          
          // 绘制身体
          ctx.fillStyle = '#E0E0E0'
          ctx.fillRect(centerX - 30, centerY + 20, 60, 80)
          
          // 绘制文字
          ctx.fillStyle = '#FFFFFF'
          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(getAvatarInitial(), centerX, centerY - 15)
        }
      }
      resolve()
    }, 1500) // 模拟1.5秒加载时间
  })
}

// 播放说话动画
const playAnimation = (animationType: 'idle' | 'speak' | 'interact') => {
  if (!modelLoaded.value || !live2dCanvas.value) return
  
  const ctx = live2dCanvas.value.getContext('2d')
  if (!ctx) return
  
  // 简单的动画效果
  if (animationType === 'speak') {
    // 说话时添加一些简单的效果
    const centerX = props.width / 2
    const centerY = props.height / 2
    
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY - 20, 50, 0, 2 * Math.PI)
    ctx.stroke()
  }
  
  console.log(`${props.characterType} 播放动画:`, animationType)
}

// 监听说话状态变化
watch(() => props.isSpeaking, (newValue) => {
  if (modelLoaded.value) {
    playAnimation(newValue ? 'speak' : 'idle')
  }
})

// 监听模型URL变化
watch(() => [props.modelUrl, props.characterType], () => {
  initLive2D()
}, { immediate: false })

onMounted(async () => {
  await nextTick()
  initLive2D()
})

onBeforeUnmount(() => {
  // 清理资源
  console.log('清理Live2D资源')
})
</script>

<style scoped>
.live2d-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(245, 245, 245, 0.9);
  z-index: 10;
}

.fallback-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.live2d-canvas {
  border-radius: 8px;
}

.speaking-indicator {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(76, 175, 80, 0.9);
  border-radius: 50%;
  padding: 8px;
  z-index: 5;
}

.speaking-icon {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>