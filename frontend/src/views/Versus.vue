<template>
  <v-container fluid class="versus-container">
    <v-row class="versus-row">
      <!-- 顶部信息栏 -->
      <v-col cols="12" class="py-1">
        <v-card class="mb-2">
          <v-card-text class="text-center">
            <div class="text-h5 mb-2">口语对战 - {{ state.matchType }}</div>
            <div class="text-body-1" v-if="state.matchStarted && controller.currentTopic">
              当前主题: <span class="font-weight-bold">{{ controller.currentTopic }}</span>
            </div>
            <div class="text-body-1" v-else-if="!state.matchStarted">
              <span class="text-grey-5">点击"开始对话"来获取随机题目</span>
            </div>
            <div class="d-flex justify-center align-center mt-2">
              <v-chip color="primary" class="mr-2">
                <v-icon start>mdi-clock-outline</v-icon>
                总时间: {{ controller.formatTime(state.remainingTime) }}
              </v-chip>
              
              <v-chip 
                v-if="!state.matchStarted"
                color="grey"
              >
                <v-icon start>mdi-pause</v-icon>
                等待开始
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 共享的 PIXI Canvas 容器 -->
      <v-col cols="12" class="pixi-canvas-wrapper-col">
        <div class="pixi-canvas-container" ref="pixiContainerRef">
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="userModelRef" 
            :app="pixiAppInstance as PIXI.Application"
            type="user"
            modelPath="/live2d/Nahida_1080/Nahida_1080.model3.json"
            :initialX="state.canvasWidth * 0.1" 
            :initialY="state.canvasHeight * 0.15"
            :scale="0.2" 
          />
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="partnerModelRef"
            :app="pixiAppInstance as PIXI.Application"
            type="partner"
            modelPath="/live2d/Mahiro_GG/Mahiro_V1.model3.json" 
            :initialX="state.canvasWidth * 0.6" 
            :initialY="state.canvasHeight * 0.15"
            :scale="0.1"
          />
        </div>
      </v-col>

      <!-- 用户模型信息卡片 -->
      <v-col cols="12" md="6" class="model-column model-column-overlay">
        <v-card class="model-card transparent-card">
          <v-card-title class="text-center white-text py-2">
            您 ({{ userModel.email || '用户' }})
          </v-card-title>
          <v-card-actions class="d-flex justify-center py-2">
            <v-chip 
              :color="state.isUserSpeaking ? 'success' : 'primary'" 
              class="mr-2"
              :class="{ 'speaking-pulse': state.isRecording }"
            >
              {{ 
                state.isRecording ? '录音中... (再按一次结束)' : 
                (state.isUserSpeaking ? '正在发言' : '可以随时发言')
              }}
            </v-chip>
            
            <!-- 音量指示器 -->
            <div v-if="state.isRecording" class="audio-level-indicator mr-2">
              <div class="audio-level-bar" :style="{ width: `${state.audioLevel}%` }"></div>
            </div>
            
            <!-- 录音按钮 -->
            <v-btn 
              :color="state.isRecording ? 'error' : (controller.canUserSpeak ? 'primary' : 'grey')" 
              variant="outlined" 
              :icon="state.isRecording ? 'mdi-stop' : (state.userMuted ? 'mdi-microphone-off' : 'mdi-microphone')"
              @click="handleToggleRecording"
              :class="{ 'recording-btn': state.isRecording }"
              :disabled="!state.matchStarted || state.isPlayingAudio"
              class="mr-2"
            >
              <v-tooltip activator="parent" location="top">
                {{ state.isRecording ? '停止录音并结束发言' : '开始录音' }}
              </v-tooltip>
            </v-btn>
            
            <v-btn 
              v-if="state.lastRecordedAudio"
              :color="state.isPlayingAudio ? 'success' : 'secondary'" 
              variant="outlined" 
              :icon="state.isPlayingAudio ? 'mdi-stop' : 'mdi-play'"
              @click="handleTogglePlayback"
              :disabled="state.isRecording"
              class="mr-2"
            >
              <v-tooltip activator="parent" location="top">
                {{ state.isPlayingAudio ? '停止播放' : '播放上次录音' }}
              </v-tooltip>
            </v-btn>
            
            <!-- 删除录音按钮 -->
            <v-btn 
              v-if="state.lastRecordedAudio"
              color="warning" 
              variant="outlined" 
              icon="mdi-delete"
              @click="handleDeleteRecording"
              :disabled="state.isRecording || state.isPlayingAudio"
              size="small"
            >
              <v-tooltip activator="parent" location="top">
                删除录音
              </v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 对方模型信息卡片 -->
      <v-col cols="12" md="6" class="model-column model-column-overlay">
        <v-card class="model-card transparent-card">
          <v-card-title class="text-center white-text py-2">
            {{ state.matchType === '真人对战' ? '对方' : 'AI助手' }}
          </v-card-title>
          <v-card-actions class="d-flex justify-center py-2">
            <v-chip 
              :color="state.isPartnerSpeaking ? 'success' : (state.speakingTurn === 'partner' ? 'warning' : 'grey')" 
              class="mr-2"
            >
              {{ 
                state.isPartnerSpeaking ? '正在发言' : 
                (state.speakingTurn === 'partner' ? '对方正在思考' : '等待轮换')
              }}
            </v-chip>
            
            <!-- 对方发言时的跳过按钮（仅开发模式显示） -->
            <v-btn 
              v-if="state.speakingTurn === 'partner' && isDev"
              color="orange"
              variant="outlined"
              size="small"
              @click="handleSkipPartnerTurn"
              class="mr-2"
            >
              <v-icon start size="small">mdi-skip-next</v-icon>
              跳过
            </v-btn>
            
            <v-btn 
              v-if="state.matchType === '真人对战'" 
              disabled 
              color="grey" 
              variant="outlined" 
              icon="mdi-volume-high"
            ></v-btn>
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
            <div class="prompt-text">{{ controller.currentPrompt }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 控制面板 -->
      <v-col cols="12" class="py-1">
        <v-card>
          <v-card-text class="d-flex justify-space-between align-center flex-wrap">
            <v-btn-group class="my-2">
              <v-btn 
                prepend-icon="mdi-play" 
                color="success" 
                @click="handleStartMatch" 
                :disabled="state.matchStarted"
              >
                开始对话
              </v-btn>
              <v-btn 
                prepend-icon="mdi-skip-next" 
                @click="handleNextTopic" 
                :disabled="!state.matchStarted"
              >
                下一话题
              </v-btn>
            </v-btn-group>

            <div class="d-flex my-2">
              <v-select
                :model-value="state.matchType"
                :items="['真人对战', 'AI辅助']"
                density="compact"
                hide-details
                class="match-type-select mr-2"
                @update:model-value="handleChangeMatchType"
              ></v-select>
              
              <v-select
                :model-value="state.difficultyLevel"
                :items="['初级', '中级', '高级']"
                density="compact"
                hide-details
                class="difficulty-select mr-2"
                @update:model-value="handleChangeDifficultyLevel"
              ></v-select>
            </div>

            <v-btn color="error" prepend-icon="mdi-exit-to-app" @click="handleEndMatch" class="my-2">
              结束对战
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 实时转写面板 -->
      <v-col cols="12" v-if="state.matchStarted" class="py-1">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>实时转写</span>
            <v-chip color="info" size="small">Beta</v-chip>
          </v-card-title>
          <v-card-text>
            <div class="transcript-container">
              <div v-for="(message, index) in state.transcriptMessages" :key="index" 
                   class="transcript-message" :class="{'user-message': message.isUser}">
                <strong>{{ message.isUser ? '您' : (state.matchType === '真人对战' ? '对方' : 'AI助手') }}:</strong>
                {{ message.text }}
              </div>
              <div v-if="state.transcriptMessages.length === 0" class="text-center text-grey">
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Live2DModel from '../components/Live2DModel.vue'
import * as PIXI from 'pixi.js'
import { VersusController } from '../controllers/VersusController'

// 解决 import.meta.env 类型报错

// 类型定义
type Live2DModelComponent = InstanceType<typeof Live2DModel>

const router = useRouter()
const isDev = true // 或者根据您的需要设置

// PIXI App refs and state
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const userModelRef = ref<Live2DModelComponent | null>(null)
const partnerModelRef = ref<Live2DModelComponent | null>(null)
let resizeObserver: ResizeObserver | null = null

// 创建控制器实例
const controller = new VersusController()

// 响应式状态
const state = reactive(controller.getState())

// 用户模型数据
const userModel = computed(() => ({ email: 'test@example.com' }))
const handleStartMatch = async () => {
  try {
    await controller.startMatch()
    if (userModelRef.value) {
      userModelRef.value.playMotion('Flick', undefined)
    }
  } catch (error) {
    console.error('开始对战失败:', error)
  }
}
const handleEndMatch = () => {
  if (state.matchStarted) {
    if (confirm('确定要结束当前对战吗？')) {
      controller.endMatch()
      router.push('/profile')
    }
  } else {
    router.push('/profile')
  }
}

const handleToggleRecording = async () => {
  try {
    await controller.toggleRecording()
    
    // 更新模型表情
    if (userModelRef.value) {
      userModelRef.value.setExpression(state.userMuted ? 'MouthOff' : 'MouthOn')
    }
  } catch (error) {
    console.error('录音操作失败:', error)
    alert((error as Error)?.message || String(error))
  }
}

const handleTogglePlayback = () => {
  if (state.lastRecordedAudio) {
    console.log('录音文件信息:')
    console.log('- 大小:', state.lastRecordedAudio.size, 'bytes')
    console.log('- 类型:', state.lastRecordedAudio.type)
  }
  
  try {
    controller.togglePlayback()
  } catch (error) {
    console.error('播放操作失败:', error)
    alert(`播放失败: ${(error as Error)?.message || String(error)}`)
  }
}

const handleDeleteRecording = () => {
  controller.deleteRecording()
}

const handleSkipPartnerTurn = () => {
  controller.skipPartnerTurn()
}

const handleNextTopic = () => {
  controller.nextTopic()
}

const handleChangeMatchType = (matchType: '真人对战' | 'AI辅助') => {
  controller.changeMatchType(matchType)
}

const handleChangeDifficultyLevel = (difficultyLevel: '初级' | '中级' | '高级') => {
  controller.changeDifficultyLevel(difficultyLevel)
}

// 设置状态变化回调
controller.setStateChangeCallback(() => {
  // 更新响应式状态
  Object.assign(state, controller.getState())
})

// PIXI App 初始化
onMounted(async () => {
  await nextTick()
  if (pixiContainerRef.value) {
    const width = pixiContainerRef.value.clientWidth
    const height = pixiContainerRef.value.clientHeight

    const app = new PIXI.Application({
      width,
      height,
      backgroundAlpha: 0,
      autoStart: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    pixiContainerRef.value.appendChild(app.view as unknown as Node)
    pixiAppInstance.value = app

    controller.updateCanvasSize(width, height)

    resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect
        if (pixiAppInstance.value) {
          pixiAppInstance.value.renderer.resize(width, height)
          controller.updateCanvasSize(width, height)
        }
      }
    })
    resizeObserver.observe(pixiContainerRef.value)
  }
})

// 清理资源
onBeforeUnmount(() => {
  controller.destroy()
  
  if (resizeObserver && pixiContainerRef.value) {
    resizeObserver.unobserve(pixiContainerRef.value)
    resizeObserver = null
  }
  if (pixiAppInstance.value) {
    pixiAppInstance.value.destroy(true, { children: true, texture: true })
    pixiAppInstance.value = null
  }
})
</script>

<style scoped>
/* 保持原有的 CSS 样式 */
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

.model-column:not(.model-column-overlay) {
  display: none !important;
}

.v-card-text {
  padding: 8px !important;
}

.v-card-title {
  padding: 8px !important;
}

.v-card-actions {
  padding: 4px !important;
}

/* 录音按钮动画 */
.recording-btn {
  animation: recording-pulse 1.5s infinite;
  transform-origin: center;
}

@keyframes recording-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* 说话状态动画 */
.speaking-pulse {
  animation: speaking-pulse 1s infinite alternate;
}

@keyframes speaking-pulse {
  from {
    opacity: 1;
  }
  to {
    opacity: 0.7;
  }
}

/* 音量指示器 */
.audio-level-indicator {
  width: 60px;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.audio-level-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #FFC107 50%, #F44336 100%);
  transition: width 0.1s ease;
  border-radius: 4px;
}
</style>