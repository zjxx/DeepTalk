<template>
  <v-container fluid class="versus-container">
    <v-row class="versus-row">
      <!-- 顶部信息栏 -->
      <v-col cols="12" class="py-1">
        <v-card class="mb-2">
          <v-card-text class="text-center">
            <div class="text-h5 mb-2">口语对战 - {{ matchType }}</div>
            <div class="text-body-1">
              当前主题: <span class="font-weight-bold">{{ currentTopic }}</span>
            </div>
            <v-chip color="primary" class="mt-2">
              <v-icon start>mdi-clock-outline</v-icon>
              剩余时间: {{ formatTime(remainingTime) }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 共享的 PIXI Canvas 容器 -->
      <v-col cols="12" class="pixi-canvas-wrapper-col">
        <div class="pixi-canvas-container" ref="pixiContainerRef">
          <!-- PIXI Canvas 将被添加到这里 -->
          <!-- Live2DModel 组件现在是这个共享Canvas的逻辑子元素 -->
          <!-- 它们的实际渲染由PIXI控制，定位通过initialX/Y -->
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="userModelRef" 
            :app="pixiAppInstance as PIXI.Application"
            type="user"
            modelPath="/live2d/miku/runtime/miku.model3.json"
            :initialX="canvasWidth * 0.25" 
            :initialY="canvasHeight * 0.5"
            :scale="0.22" 
          />
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="partnerModelRef"
            :app="pixiAppInstance as PIXI.Application"
            type="partner"
            modelPath="/live2d/miku/runtime/miku.model3.json" 
            :initialX="canvasWidth * 0.75" 
            :initialY="canvasHeight * 0.5"
            :scale="0.22"
          />
        </div>
      </v-col>

      <!-- 用户模型信息卡片 -->
      <v-col cols="12" md="6" class="model-column model-column-overlay">
        <v-card class="model-card transparent-card">
          <v-card-title class="text-center white-text py-2">
            您 ({{ userModelComputed.email || '用户' }})
          </v-card-title>
          <v-card-actions class="d-flex justify-center py-2">
            <v-chip :color="isUserSpeaking ? 'success' : 'grey'" class="mr-2">
              {{ isUserSpeaking ? '正在发言' : '等待中' }}
            </v-chip>
            <v-btn color="primary" variant="outlined" :icon="userMuted ? 'mdi-microphone-off' : 'mdi-microphone'" @click="toggleMute('user')"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 对方模型信息卡片 -->
      <v-col cols="12" md="6" class="model-column model-column-overlay">
        <v-card class="model-card transparent-card">
          <v-card-title class="text-center white-text py-2">
            {{ matchType === '真人对战' ? '对方' : 'AI助手' }}
          </v-card-title>
          <v-card-actions class="d-flex justify-center py-2">
            <v-chip :color="isPartnerSpeaking ? 'success' : 'grey'" class="mr-2">
              {{ isPartnerSpeaking ? '正在发言' : '等待中' }}
            </v-chip>
            <v-btn v-if="matchType === '真人对战'" disabled color="grey" variant="outlined" icon="mdi-volume-high"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 对话提示区域 -->
      <v-col cols="12" class="py-1">
        <v-card class="prompt-card">
          <v-card-title>
            <v-icon start color="primary" class="mr-2">mdi-text-box-outline</v-icon>
            对话提示
          </v-card-title>
          <v-card-text>
            <div class="prompt-text">{{ currentPrompt }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 控制面板 -->
      <v-col cols="12" class="py-1">
        <v-card>
          <v-card-text class="d-flex justify-space-between align-center flex-wrap">
            <v-btn-group class="my-2">
              <v-btn prepend-icon="mdi-play" color="success" @click="startMatch" :disabled="matchStarted">
                开始对话
              </v-btn>
              <v-btn prepend-icon="mdi-skip-next" @click="nextTopic" :disabled="!matchStarted">
                下一话题
              </v-btn>
            </v-btn-group>

            <div class="d-flex my-2">
              <v-select
                v-model="matchType"
                :items="['真人对战', 'AI辅助']"
                density="compact"
                hide-details
                class="match-type-select mr-2"
                @update:model-value="changeMatchType"
              ></v-select>
              
              <v-select
                v-model="difficultyLevel"
                :items="['初级', '中级', '高级']"
                density="compact"
                hide-details
                class="difficulty-select mr-2"
              ></v-select>
            </div>

            <v-btn color="error" prepend-icon="mdi-exit-to-app" @click="endMatch" class="my-2">
              结束对战
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 实时转写面板 -->
      <v-col cols="12" v-if="matchStarted" class="py-1">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>实时转写</span>
            <v-chip color="info" size="small">Beta</v-chip>
          </v-card-title>
          <v-card-text>
            <div class="transcript-container">
              <div v-for="(message, index) in transcriptMessages" :key="index" 
                   class="transcript-message" :class="{'user-message': message.isUser}">
                <strong>{{ message.isUser ? '您' : (matchType === '真人对战' ? '对方' : 'AI助手') }}:</strong>
                {{ message.text }}
              </div>
              <div v-if="transcriptMessages.length === 0" class="text-center text-grey">
                开始对话后，语音将在此处显示...
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Live2DModel from '../components/Live2DModel.vue'
import * as PIXI from 'pixi.js'

// 为子组件引用创建类型别名
type Live2DModelComponent = InstanceType<typeof Live2DModel>

const router = useRouter()

// PIXI App refs and state
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const userModelRef = ref<Live2DModelComponent | null>(null)
const partnerModelRef = ref<Live2DModelComponent | null>(null)
let resizeObserver: ResizeObserver | null = null
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// 状态变量
const matchStarted = ref(false)
const remainingTime = ref(300)
const userMuted = ref(false)
const isUserSpeaking = ref(false)
const isPartnerSpeaking = ref(false)
const matchType = ref('真人对战')
const difficultyLevel = ref('中级')
const userModelComputed = computed(() => ({ email: 'test@example.com' }))

// 对战内容
const topics = ref([
  'What do you think about online education?',
  'How important is it to learn a foreign language?',
  'Describe your favorite travel experience.',
  'What are the advantages and disadvantages of social media?',
  'How do you manage stress and maintain work-life balance?'
])
const currentTopicIndex = ref(0)
const currentTopic = computed(() => topics.value[currentTopicIndex.value])

const prompts = ref([
  'Share your personal experiences with this topic.',
  'Discuss both the advantages and disadvantages.',
  'Compare the situation in different countries.',
  'What changes do you expect in the future?',
  'How has your opinion on this evolved over time?'
])
const currentPromptIndex = ref(0)
const currentPrompt = computed(() => prompts.value[currentPromptIndex.value])

// 转写消息
interface TranscriptMessage {
  isUser: boolean
  text: string
}
const transcriptMessages = ref<TranscriptMessage[]>([
  // { isUser: true, text: 'I believe online education provides flexibility for students.' },
  // { isUser: false, text: 'That\'s true, but it lacks the social interaction of traditional classrooms.' }
])

// 计时器
let timerInterval: number | null = null

// 格式化时间
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 开始对战
const startMatch = () => {
  matchStarted.value = true
  startTimer()
  userModelRef.value?.playMotion('Flick', undefined)
  setTimeout(() => {
    isUserSpeaking.value = true
  }, 2000)
  
  setTimeout(() => {
    isUserSpeaking.value = false
    transcriptMessages.value.push({ 
      isUser: true, 
      text: 'I think this topic is really interesting because it affects all of us in our daily lives.'
    })
    partnerModelRef.value?.setExpression('F01')
    setTimeout(() => {
      isPartnerSpeaking.value = true
      setTimeout(() => {
        isPartnerSpeaking.value = false
        transcriptMessages.value.push({ 
          isUser: false, 
          text: matchType.value === '真人对战' 
            ? 'Yes, I agree. What specific aspects do you find most relevant?'
            : 'That\'s an insightful observation. Could you elaborate on which aspects you find most impactful in your personal experience?'
        })
      }, 3000)
    }, 1000)
  }, 5000)
}

// 开始计时器
const startTimer = () => {
  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      endMatch()
    }
  }, 1000)
}

// 切换静音状态
const toggleMute = (who: 'user' | 'partner') => {
  if (who === 'user') {
    userMuted.value = !userMuted.value
    if (userMuted.value) {
      userModelRef.value?.setExpression('MouthOff')
    } else {
      userModelRef.value?.setExpression('MouthOn')
    }
  }
}

// 下一个话题
const nextTopic = () => {
  currentTopicIndex.value = (currentTopicIndex.value + 1) % topics.value.length
  currentPromptIndex.value = (currentPromptIndex.value + 1) % prompts.value.length
  transcriptMessages.value = []
}

// 更改对战类型
const changeMatchType = () => {
  transcriptMessages.value = []
  isPartnerSpeaking.value = false
  isUserSpeaking.value = false
}

// 结束对战
const endMatch = () => {
  if (matchStarted.value) {
    if (confirm('确定要结束当前对战吗？')) {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
      matchStarted.value = false
      remainingTime.value = 300
      router.push('/profile')
    }
  } else {
    router.push('/profile')
  }
}

// 恢复 PIXI App 初始化和管理逻辑
onMounted(async () => {
  await nextTick()
  if (pixiContainerRef.value) {
    canvasWidth.value = pixiContainerRef.value.clientWidth
    canvasHeight.value = pixiContainerRef.value.clientHeight

    const app = new PIXI.Application({
      width: canvasWidth.value,
      height: canvasHeight.value,
      backgroundAlpha: 0,
      autoStart: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    pixiContainerRef.value.appendChild(app.view as unknown as Node)
    pixiAppInstance.value = app

    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        if (pixiAppInstance.value) {
          pixiAppInstance.value.renderer.resize(width, height)
          canvasWidth.value = width
          canvasHeight.value = height
        }
      }
    })
    resizeObserver.observe(pixiContainerRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver && pixiContainerRef.value) {
    resizeObserver.unobserve(pixiContainerRef.value)
    resizeObserver = null
  }
  if (pixiAppInstance.value) {
    pixiAppInstance.value.destroy(true, { children: true, texture: true })
    pixiAppInstance.value = null
  }
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})
</script>

<style scoped>
.versus-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 8px;
  overflow: hidden;
}

.versus-row {
  height: 100%;
  overflow-y: auto;
}

.pixi-canvas-wrapper-col {
  padding-bottom: 0 !important;
  margin-bottom: -40px;
  z-index: 0;
}

.pixi-canvas-container {
  width: 100%;
  height: 360px;
  position: relative;
  overflow: hidden;
}

.model-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: auto;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.transparent-card {
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.white-text .v-card-title {
  color: white !important;
  text-shadow: 1px 1px 2px black;
  font-size: 1rem;
}

.prompt-card {
  margin-top: 8px;
}

.prompt-text {
  font-size: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-style: italic;
}

.match-type-select, .difficulty-select {
  min-width: 120px;
}

.transcript-container {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  background-color: #fafafa;
}

.transcript-message {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.transcript-message:last-child {
  border-bottom: none;
}

.user-message {
  background-color: #e3f2fd;
  margin: 2px 0;
  padding: 6px;
  border-radius: 8px;
}

/* 移除旧的样式 */
.model-column:not(.model-column-overlay) {
  display: none !important;
}

/* 调整间距 */
.v-card-text {
  padding: 8px !important;
}

.v-card-title {
  padding: 8px !important;
}

.v-card-actions {
  padding: 4px !important;
}
</style>