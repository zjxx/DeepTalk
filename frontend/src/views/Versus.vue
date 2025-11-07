<template>
  <v-container fluid class="versus-container">
    <v-row class="versus-row">
      <!-- 顶部信息栏，展示匹配参数 -->
      <v-col cols="12" class="py-1">
        <v-card class="mb-2">
          <v-card-text class="text-center position-relative">
            <!-- 返回匹配按钮 - 左上角 -->
            <v-btn 
              prepend-icon="mdi-arrow-left" 
              color="secondary" 
              @click="handleBackToMatching"
              class="back-to-matching-btn"
            >
              返回匹配
            </v-btn>
            
            <div class="text-h5 mb-2">口语对战 - {{ displayBattleType }}</div>
            <div class="text-body-1 mb-1">
              难度：<span class="font-weight-bold">{{ displayDifficulty }}</span>
              <v-divider vertical class="mx-2" />
              时长：<span class="font-weight-bold">{{ displayDuration }}分钟</span>
            </div>
            <div class="text-body-1" v-if="controller.currentTopic">
              当前主题: <span class="font-weight-bold text-primary">{{ controller.currentTopic }}</span>
              <v-chip 
                v-if="controller.isUsingServerTopic()" 
                color="success" 
                size="x-small" 
                class="ml-2"
              >
                <v-icon start size="12">mdi-check-circle</v-icon>
                已同步
              </v-chip>
            </div>
            <div class="text-body-1" v-else>
              <span class="text-grey-5">正在加载题目...</span>
            </div>
            <div class="d-flex justify-center align-center mt-2">
              <v-chip color="primary" class="mr-2">
                <v-icon start>mdi-clock-outline</v-icon>
                总时间: {{ controller.formatTime(state.remainingTime) }}
              </v-chip>
              <v-chip color="success" class="mr-2">
                <v-icon start>mdi-play</v-icon>
                对战进行中
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 共享的 PIXI Canvas 容器 -->
      <v-col cols="12" class="pixi-canvas-wrapper-col">
        <div class="pixi-canvas-container" ref="pixiContainerRef">
          <!-- 用户模型（始终显示） -->
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="userModelRef" 
            :app="pixiAppInstance as PIXI.Application"
            type="user"
            :modelPath="userModelPath"
            :initialX="state.canvasWidth * 0.2" 
            :initialY="state.canvasHeight * 0.23"
            :scale="0.2" 
          />
          
          <!-- 对方：真人对战时显示Live2D模型 -->
          <Live2DModel 
            v-if="pixiAppInstance && displayBattleType === '真人对战'"
            ref="partnerModelRef"
            :app="pixiAppInstance as PIXI.Application"
            type="partner"
            :modelPath="opponentModelPath" 
            :initialX="state.canvasWidth * 0.6" 
            :initialY="state.canvasHeight * 0.15"
            :scale="0.1"
          />
          
          <!-- 对方：AI对战时显示AI头像 -->
          <div 
            v-if="displayBattleType === 'AI辅助'" 
            class="ai-avatar"
            :style="{
              left: `${state.canvasWidth * 0.7}px`,
              top: `${state.canvasHeight * 0.4}px`
            }"
          >
            <v-avatar 
              size="200" 
              :color="state.isPartnerSpeaking ? 'success' : 'primary'"
              :class="{ 'ai-speaking': state.isPartnerSpeaking }"
            >
              <v-icon size="90" color="white">mdi-robot</v-icon>
            </v-avatar>
            <!-- AI状态指示芯片已删除 -->
          </div>
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
              :color="state.isRecording ? 'error' : (displayBattleType === 'AI辅助' || isWebSocketConnected ? 'success' : 'warning')" 
              class="mr-2"
              :class="{ 'speaking-pulse': state.isRecording }"
              size="large"
            >
              {{ 
                state.isRecording ? '🎤 录音中... (点击停止并发送)' : 
                (displayBattleType === 'AI辅助' ? '✅ 可以随时开始录音对话' :
                 (isWebSocketConnected ? '✅ 可以随时开始录音通话' : '⚠️ WebSocket未连接'))
              }}
            </v-chip>
            
            <!-- 音量指示器 -->
            <div v-if="state.isRecording" class="audio-level-indicator mr-2">
              <div class="audio-level-bar" :style="{ width: `${state.audioLevel}%` }"></div>
            </div>
            
            <!-- 录音按钮 -->
            <v-btn 
              :color="state.isRecording ? 'error' : 'primary'" 
              variant="elevated" 
              :icon="state.isRecording ? 'mdi-stop' : 'mdi-microphone'"
              @click="handleToggleRecording"
              :class="{ 'recording-btn': state.isRecording }"
              :disabled="(displayBattleType === '真人对战' && !isWebSocketConnected) || state.isPlayingAudio"
              size="large"
              class="mr-2"
            >
              <v-tooltip activator="parent" location="top">
                {{ state.isRecording ? '停止录音并发送' : '开始录音对话' }}
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
            <v-icon 
              v-if="displayBattleType === 'AI辅助'" 
              start 
              color="primary"
            >
              mdi-robot
            </v-icon>
            {{ displayBattleType === '真人对战' ? '对方用户' : 'AI智能助手' }}
          </v-card-title>
          <v-card-actions class="d-flex justify-center py-2">
            <v-chip 
              :color="(state.isPartnerSpeaking || state.isPartnerThinking) ? 'success' : (state.speakingTurn === 'partner' ? 'warning' : 'grey')" 
              class="mr-2"
              v-if="!state.isRecording"
            >
              {{ 
                state.isPartnerThinking ? 
                  'AI思考中...' : 
                  (state.isPartnerSpeaking ? 
                    (displayBattleType === 'AI辅助' ? 'AI正在回应' : '对方正在说话') : 
                    (displayBattleType === 'AI辅助' ? 'AI待命' : '对方待命'))
              }}
            </v-chip>
            <!-- 用户录音时不显示AI状态芯片 -->
            
            <!-- 对方发言时的跳过按钮已删除 -->
            
            <!-- AI对战模式下显示AI状态指示器 -->
            <v-btn 
              v-if="displayBattleType === 'AI辅助'" 
              disabled 
              color="primary" 
              variant="outlined" 
              icon="mdi-brain"
              class="mr-2"
            >
              <v-tooltip activator="parent" location="top">
                AI智能模式
              </v-tooltip>
            </v-btn>
            
            <!-- 真人对战模式下显示音量控制 -->
            <v-btn 
              v-if="displayBattleType === '真人对战'" 
              disabled 
              color="grey" 
              variant="outlined" 
              icon="mdi-volume-high"
            >
              <v-tooltip activator="parent" location="top">
                对方音频
              </v-tooltip>
            </v-btn>
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

      <!-- AI对话历史区域 -->
      <v-col v-if="displayBattleType === 'AI辅助'" cols="12" class="py-1">
        <v-card class="conversation-card">
          <v-card-title class="d-flex justify-space-between align-center">
            <div>
              <v-icon start color="success" class="mr-2">mdi-chat</v-icon>
              AI对话记录
            </div>
            <v-chip size="small" color="info">
              {{ state.transcriptMessages?.length || 0 }} 条消息
            </v-chip>
          </v-card-title>
          
          <v-card-text ref="conversationContentRef" class="conversation-content" style="max-height: 400px; overflow-y: auto; padding: 16px;">
            <!-- 空状态提示 -->
            <div v-if="!state.transcriptMessages || state.transcriptMessages.length === 0" class="empty-state text-center py-8">
              <v-icon size="64" color="grey-lighten-2">mdi-chat-outline</v-icon>
              <div class="text-h6 text-grey mt-4">还没有对话记录</div>
              <div class="text-body-2 text-grey-darken-1 mt-2">
                点击"开始对话"按钮开始录音，AI将会回复您
              </div>
            </div>
            
            <!-- 对话消息列表 -->
            <div v-else class="conversation-messages">
              <div 
                v-for="(message, index) in state.transcriptMessages" 
                :key="index"
                class="message-item"
                :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
              >
                <div class="message-header">
                  <v-avatar size="32" :color="message.isUser ? 'primary' : 'success'">
                    <v-icon size="20" color="white">
                      {{ message.isUser ? 'mdi-account' : 'mdi-robot' }}
                    </v-icon>
                  </v-avatar>
                  <span class="message-sender">
                    {{ message.isUser ? '您' : 'AI助手' }}
                  </span>
                  <span class="message-time">
                    {{ formatMessageTime(message.timestamp) }}
                  </span>
                </div>
                
                <div class="message-content">
                  <div class="message-bubble" :class="{ 'user-bubble': message.isUser, 'ai-bubble': !message.isUser }">
                    {{ message.text }}
                  </div>
                </div>
              </div>
              
              <!-- AI思考状态指示 -->
              <div v-if="state.isPartnerThinking" class="message-item ai-message">
                <div class="message-header">
                  <v-avatar size="32" color="orange">
                    <v-icon size="20" color="white" class="pulse-animation">mdi-brain</v-icon>
                  </v-avatar>
                  <span class="message-sender">AI助手</span>
                  <span class="message-time">思考中...</span>
                </div>
                <div class="message-content">
                  <div class="message-bubble ai-bubble thinking-bubble">
                    <div class="thinking-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
          
          <v-card-actions class="justify-center">
            <v-btn 
              variant="outlined" 
              size="small" 
              prepend-icon="mdi-delete"
              @click="clearConversationHistory"
            >
              清空对话记录
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 控制面板 -->
      <v-col cols="12" class="py-1">
        <v-card>
          <v-card-text class="d-flex justify-space-between align-center flex-wrap">
            <v-btn-group class="my-2">
              <!-- WebSocket通话按钮 -->
              <v-btn 
                :color="state.isRecording ? 'error' : 'success'" 
                :prepend-icon="state.isRecording ? 'mdi-stop' : 'mdi-microphone'"
                @click="handleToggleRecording"
                :disabled="(displayBattleType === '真人对战' && !isWebSocketConnected) || state.isPlayingAudio"
                :class="{ 'recording-btn': state.isRecording }"
                size="large"
              >
                {{ state.isRecording ? '停止录音' : (displayBattleType === 'AI辅助' ? '开始对话' : '开始通话') }}
                <v-tooltip activator="parent" location="top">
                  {{ state.isRecording ? '停止录音并发送' : (displayBattleType === 'AI辅助' ? 'AI智能对话' : 'WebSocket语音通话') }}
                </v-tooltip>
              </v-btn>
              
              <!-- 下一话题按钮已删除 -->
            </v-btn-group>

            <!-- 匹配信息显示 -->
            <div class="d-flex my-2 align-center">
              <v-chip color="primary" class="mr-2" size="large">
                <v-icon start>{{ state.matchType === '真人对战' ? 'mdi-account-group' : 'mdi-robot' }}</v-icon>
                {{ state.matchType }}
              </v-chip>
              
              <v-chip color="secondary" class="mr-2" size="large">
                <v-icon start>mdi-chart-line</v-icon>
                {{ displayDifficulty }}
              </v-chip>
              
              <v-chip color="info" class="mr-2" size="large">
                <v-icon start>mdi-clock-outline</v-icon>
                {{ Math.floor(state.remainingTime / 60) }}分钟
              </v-chip>
            </div>

            <v-btn 
              color="error" 
              :prepend-icon="'mdi-stop'" 
              @click="handleEndMatch" 
              class="my-2"
            >
              结束对战
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 全程录音播放面板 -->
      <v-col cols="12" v-if="state.fullRecordingAvailable" class="py-1">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>
              <v-icon start>mdi-microphone</v-icon>
              全程录音回放
            </span>
            <v-chip color="success" size="small">
              总时长: {{ controller.formatPlaybackTime(state.fullRecordingDuration) }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <!-- 播放进度条 -->
            <div class="mb-4">
              <v-progress-linear
                :model-value="state.playbackProgress"
                height="12"
                color="primary"
                striped
                rounded
                class="mb-2"
              ></v-progress-linear>
              
              <!-- 时间显示 -->
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                  <v-chip color="info" size="small" class="mr-2">
                    当前: {{ controller.formatPlaybackTime(state.currentPlaybackTime || 0) }}
                  </v-chip>
                  <v-chip color="secondary" size="small">
                    进度: {{ Math.round(state.playbackProgress || 0) }}%
                  </v-chip>
                </div>
                <v-chip color="success" size="small">
                  剩余: {{ controller.formatPlaybackTime((state.fullRecordingDuration || 0) - (state.currentPlaybackTime || 0)) }}
                </v-chip>
              </div>
            </div>
            
            <!-- 播放控制按钮 -->
            <div class="d-flex justify-center align-center">
              <v-btn
                :color="state.isPlayingAudio ? 'error' : 'primary'"
                :icon="state.isPlayingAudio ? 'mdi-stop' : 'mdi-play'"
                @click="handleToggleFullRecording"
                class="mr-3"
                size="large"
                :loading="isLoadingPlayback"
              >
                <v-tooltip activator="parent" location="top">
                  {{ state.isPlayingAudio ? '停止播放' : '播放全程录音' }}
                </v-tooltip>
              </v-btn>
              
              <v-btn
                color="secondary"
                icon="mdi-download"
                @click="handleDownloadRecording"
                size="large"
                class="mr-3"
              >
                <v-tooltip activator="parent" location="top">
                  下载录音文件
                </v-tooltip>
              </v-btn>
              
              <!-- 播放状态指示 -->
              <div v-if="state.isPlayingAudio" class="d-flex align-center">
                <v-icon color="primary" class="mr-1">mdi-volume-high</v-icon>
                <span class="text-caption text-primary">正在播放...</span>
              </div>
              <div v-else-if="state.fullRecordingDuration > 0" class="d-flex align-center">
                <v-icon color="grey" class="mr-1">mdi-pause</v-icon>
                <span class="text-caption text-grey">已暂停</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- WebSocket调试面板已隐藏 -->
      <!-- <v-col cols="12" v-if="isDev" class="py-1">
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>WebSocket调试信息</span>
            <v-chip :color="isWebSocketConnected ? 'success' : 'error'" size="small">
              {{ isWebSocketConnected ? '已连接' : '未连接' }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="debug-info">
              <div><strong>用户ID:</strong> {{ userId }}</div>
              <div><strong>会话ID:</strong> {{ sessionId }}</div>
              <div><strong>连接状态:</strong> {{ isWebSocketConnected ? '✅ 已连接' : '❌ 未连接' }}</div>
              <div><strong>WebSocket状态:</strong> {{ ws?.readyState ?? 'null' }}</div>
              <div><strong>时间同步状态:</strong> {{ isTimeSynced ? '✅ 已同步' : '⏳ 未同步' }}</div>
              <div><strong>服务器时间偏移:</strong> {{ serverTimeOffset }}ms</div>
              <div><strong>对战开始时间:</strong> {{ battleStartTime ? new Date(battleStartTime).toLocaleTimeString() : '未设置' }}</div>
              <div><strong>当前服务器时间:</strong> {{ isTimeSynced ? new Date(getServerTime()).toLocaleTimeString() : '未同步' }}</div>
              <div><strong>当前主题:</strong> {{ controller.currentTopic || '无' }}</div>
              <div><strong>主题来源:</strong> {{ controller.isUsingServerTopic() ? '🌐 服务器分配' : '🎲 本地随机' }}</div>
              <div><strong>对方正在说话:</strong> {{ state.isPartnerSpeaking ? '是' : '否' }}</div>
              <div><strong>正在播放对方音频:</strong> {{ isPlayingPartnerAudio ? '是' : '否' }}</div>
              <div><strong>最后录音:</strong> {{ state.lastRecordedAudio ? `${state.lastRecordedAudio.size} bytes` : '无' }}</div>
              <div><strong>消息发送测试:</strong> 
                <v-btn size="x-small" color="warning" @click="testEndBattleMessage">
                  发送测试WebSocket消息
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col> -->

      <!-- 实时转写面板已删除 -->
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Live2DModel from '../components/Live2DModel.vue'
import * as PIXI from 'pixi.js'
import { VersusController } from '../controllers/VersusController'
import userModel from '../models/user'
import { ShopGetModelIdAPI } from '../api/ShopAPI'
import { getModelPath } from '../utils/live2d'

// 解决 import.meta.env 类型报错

// 类型定义
type Live2DModelComponent = InstanceType<typeof Live2DModel>

const router = useRouter()
const route = useRoute()

// PIXI App refs and state
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const userModelRef = ref<Live2DModelComponent | null>(null)
const partnerModelRef = ref<Live2DModelComponent | null>(null)
let resizeObserver: ResizeObserver | null = null

// WebSocket相关状态
const userId = ref<string>('')
const sessionId = ref<string>('')
const ws = ref<WebSocket | null>(null)
const isWebSocketConnected = ref(false)

// 模型ID相关状态
const userModelId = ref<string>('')
const opponentModelId = ref<string>('')
const opponentId = ref<string>('')

// 音频相关状态
const audioContext = ref<AudioContext | null>(null)
const isPlayingPartnerAudio = ref(false)

// 时间同步相关状态
const serverTimeOffset = ref(0) // 服务器时间与本地时间的差值
const battleStartTime = ref<number | null>(null) // 对战开始的服务器时间
const isTimeSynced = ref(false) // 是否已同步时间

// 创建控制器实例
const controller = new VersusController()
const state = reactive(controller.getState())
const isLoadingPlayback = ref(false)

// 对话容器引用（用于自动滚动）
const conversationContentRef = ref<HTMLElement | null>(null)

// 匹配参数展示
const displayBattleType = computed(() => route.query.battleType || state.matchType || 'AI辅助')
const displayDifficulty = computed(() => route.query.difficulty || state.difficultyLevel || '中级')
const displayDuration = computed(() => route.query.duration || Math.floor((state.remainingTime || 300) / 60))

// 语音识别相关方法
const startSpeechRecognition = () => {
  const success = controller.startSpeechRecognition()
  if (!success) {
    console.warn('启动语音识别失败')
  }
}

const stopSpeechRecognition = () => {
  controller.stopSpeechRecognition()
}

// AI对话相关方法
const formatMessageTime = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

const clearConversationHistory = () => {
  // 清空对话历史
  state.transcriptMessages = []
  // 同时清空语音识别文本
  controller.clearSpeechText()
  console.log('对话历史已清空')
}

// 自动滚动到对话底部
const scrollToBottom = () => {
  nextTick(() => {
    if (conversationContentRef.value) {
      conversationContentRef.value.scrollTop = conversationContentRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动到底部
watch(() => state.transcriptMessages.length, () => {
  scrollToBottom()
})

// 动态模型路径
const userModelPath = computed(() => {
  return getModelPath(userModelId.value)
})

const opponentModelPath = computed(() => {
  return getModelPath(opponentModelId.value)
})

// 获取用户正在使用的模型ID
const getUserModelId = async (userId: string): Promise<string> => {
  try {
    const response = await ShopGetModelIdAPI({ userId })
    if (response.success && response.productId) {
      console.log('获取到用户模型ID:', response.productId)
      return response.productId
    } else {
      console.log('用户没有正在使用的模型，使用默认模型')
      return '2' // 默认使用 miku 模型
    }
  } catch (error) {
    console.error('获取用户模型ID失败:', error)
    return '2' // 出错时使用默认模型
  }
}

// 获取对手正在使用的模型ID
const getOpponentModelId = async (opponentId: string): Promise<string> => {
  try {
    const response = await ShopGetModelIdAPI({ userId: opponentId })
    if (response.success && response.productId) {
      console.log('获取到对手模型ID:', response.productId)
      return response.productId
    } else {
      console.log('对手没有正在使用的模型，使用默认模型')
      return '1' // 默认使用 真寻 模型
    }
  } catch (error) {
    console.error('获取对手模型ID失败:', error)
    return '1' // 出错时使用默认模型
  }
}

// 发送结束对战通知（单向通知，不等待确认）
const sendEndBattleNotification = () => {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    const message = {
      type: 'battle_end_notification',
      userId: userId.value,
      sessionId: sessionId.value,
      message: '对方已退出对战',
      timestamp: Date.now()
    }
    
    console.log('发送结束对战通知:', message)
    ws.value.send(JSON.stringify(message))
    console.log('✅ 结束对战通知已发送（单向通知）')
  } else {
    console.log('WebSocket未连接，跳过发送通知')
  }
}

const handleEndMatch = async () => {
  console.log('点击结束对战，当前状态:', {
    matchStarted: state.matchStarted,
    battleType: displayBattleType.value,
    wsConnected: isWebSocketConnected.value
  })
  
  // 统一处理：直接结束对战并跳转到评分界面
  if (confirm('确定要结束当前对战吗？这将结束当前对战。')) {
    try {
      console.log('用户确认结束对战，开始清理资源并跳转到评分界面...')
      
      // 如果是真人对战且WebSocket连接正常，发送通知消息（但不等待确认）
      if (displayBattleType.value === '真人对战' && isWebSocketConnected.value) {
        sendEndBattleNotification()
      }
      
      // 直接结束对战并跳转
      await endBattleAndGoToEvaluation()
    } catch (error) {
      console.error('结束对战时出错:', error)
      // 即使出错也跳转到评分界面
      await new Promise(resolve => setTimeout(resolve, 300))
      await router.push('/evaluation')
    }
  }
}

// 统一的结束对战并跳转到评分界面的函数
const endBattleAndGoToEvaluation = async () => {
  // 清理资源
  if (userModelRef.value) {
    userModelRef.value.destroy?.()
  }
  if (partnerModelRef.value) {
    partnerModelRef.value.destroy?.()
  }
  
  // 结束对战
  controller.endMatch()
  
  // 清理PIXI应用
  if (pixiAppInstance.value) {
    pixiAppInstance.value.stop()
  }
  
  // 清理WebSocket连接（如果存在）
  if (ws.value) {
    ws.value.close()
    ws.value = null
  }
  isWebSocketConnected.value = false
  
  // 清理音频上下文
  if (audioContext.value) {
    audioContext.value.close()
    audioContext.value = null
  }
  
  // 延迟跳转到评分界面
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log('状态清理完成，跳转到评分界面')
  await router.push('/evaluation')
}

const handleToggleRecording = async () => {
  try {
    // AI模式下不需要WebSocket连接检查
    if (displayBattleType.value === '真人对战' && !isWebSocketConnected.value) {
      alert('真人对战模式下WebSocket未连接，无法进行语音通话。请检查网络连接。')
      return
    }
    
    if (state.isRecording) {
      // 停止录音
      console.log('准备停止录音...')
      await controller.toggleRecording()
      
      // 同时停止语音识别
      if (controller.isSpeechRecognitionSupported() && state.isSpeechRecognitionActive) {
        console.log('停止语音识别...')
        stopSpeechRecognition()
      }
      
      // 等待一小段时间确保录音数据已保存
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 真人对战模式：发送到WebSocket
      if (displayBattleType.value === '真人对战' && state.lastRecordedAudio && ws.value && ws.value.readyState === WebSocket.OPEN) {
        console.log('真人对战模式：录音完成，准备发送到对方:', {
          size: state.lastRecordedAudio.size,
          type: state.lastRecordedAudio.type,
          wsState: ws.value.readyState
        })
        
        // 显示发送状态
        const sendingToast = document.createElement('div')
        sendingToast.textContent = '正在发送音频到对方...'
        sendingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#2196F3;color:white;padding:12px;border-radius:8px;z-index:9999;font-family:monospace'
        document.body.appendChild(sendingToast)
        
        try {
          await sendAudioToWebSocket(state.lastRecordedAudio)
          sendingToast.textContent = '✅ 音频发送成功!'
          sendingToast.style.background = '#4CAF50'
          setTimeout(() => {
            if (document.body.contains(sendingToast)) {
              document.body.removeChild(sendingToast)
            }
          }, 2000)
        } catch (error) {
          sendingToast.textContent = '❌ 发送失败'
          sendingToast.style.background = '#F44336'
          setTimeout(() => {
            if (document.body.contains(sendingToast)) {
              document.body.removeChild(sendingToast)
            }
          }, 3000)
          throw error
        }
      } 
      // AI模式：本地处理
      else if (displayBattleType.value === 'AI辅助' && state.lastRecordedAudio) {
        console.log('AI智能对战模式：录音完成，本地处理:', {
          size: state.lastRecordedAudio.size,
          type: state.lastRecordedAudio.type
        })
        
        // 注意：用户消息和AI回复都已经在 VersusController 中自动处理
        // 语音识别的 onResult 回调会：
        // 1. 添加用户消息到对话记录
        // 2. 自动触发 AI 回复
        // 所以这里不需要做任何操作！
        
        // 只显示录音完成提示
        const aiToast = document.createElement('div')
        aiToast.textContent = '✅ 录音完成，等待AI回复...'
        aiToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:12px;border-radius:8px;z-index:9999;font-family:monospace'
        document.body.appendChild(aiToast)
        
        setTimeout(() => {
          if (document.body.contains(aiToast)) {
            document.body.removeChild(aiToast)
          }
        }, 2000)
      } else if (displayBattleType.value === '真人对战') {
        console.warn('真人对战模式：录音数据为空或WebSocket连接异常:', {
          hasAudio: !!state.lastRecordedAudio,
          audioSize: state.lastRecordedAudio?.size,
          wsExists: !!ws.value,
          wsState: ws.value?.readyState
        })
        alert('录音数据异常，请重试')
      }
    } else {
      // 开始录音
      console.log(`开始${displayBattleType.value}模式录音...`)
      await controller.toggleRecording()
      
      // 同时启动语音识别
      if (controller.isSpeechRecognitionSupported() && !state.isSpeechRecognitionActive) {
        console.log('启动语音识别...')
        startSpeechRecognition()
      }
    }
    
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

const handleBackToMatching = async () => {
  if (confirm('当前对战正在进行中，确定要返回匹配界面吗？这将结束当前对战。')) {
    try {
      // 清理当前对战状态
      if (userModelRef.value) {
        userModelRef.value.destroy?.()
      }
      if (partnerModelRef.value) {
        partnerModelRef.value.destroy?.()
      }
      
      // 结束对战
      controller.endMatch()
      
      // 清理PIXI应用
      if (pixiAppInstance.value) {
        pixiAppInstance.value.stop()
      }
      
      // 清理WebSocket连接（如果存在）
      if (ws.value) {
        ws.value.close()
        ws.value = null
      }
      isWebSocketConnected.value = false
      
      // 清理音频上下文
      if (audioContext.value) {
        audioContext.value.close()
        audioContext.value = null
      }
      
      // 延迟跳转到匹配界面
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('状态清理完成，跳转到匹配界面')
      await router.push('/matching')  // 返回到匹配界面
    } catch (error) {
      console.error('返回匹配界面时出错:', error)
      await router.push('/matching')  // 即使出错也要跳转到匹配界面
    }
  }
}

const handleToggleFullRecording = async () => {
  try {
    if (state.isPlayingAudio) {
      controller.stopFullRecording()
    } else {
      isLoadingPlayback.value = true
      await controller.playFullRecording()
    }
  } catch (error) {
    console.error('全程录音播放操作失败:', error)
    alert((error as Error)?.message || String(error))
  } finally {
    isLoadingPlayback.value = false
  }
}

const handleDownloadRecording = () => {
  const allRecordedAudios = controller.getAllRecordedAudios?.() || []
  if (allRecordedAudios.length > 0) {
    // 下载第一个录音文件作为示例
    const audioBlob = allRecordedAudios[0]
    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `录音_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// WebSocket连接函数
const connectWebSocket = async () => {
  if (!sessionId.value || !userId.value) {
    console.warn('缺少sessionId或userId，无法建立WebSocket连接')
    return
  }
  
  try {
    const wsUrl = `ws://115.175.45.173:8080/api/speech/ws`
    ws.value = new WebSocket(wsUrl)
    
    ws.value.onopen = () => {
      // 连接成功后发送注册消息，包含用户偏好
      ws.value?.send(JSON.stringify({
        type: 'register',
        userId: userId.value,
        sessionId: sessionId.value,
        userPreferences: {
          difficulty: state.difficultyLevel,
          battleType: state.matchType,
          duration: Math.floor(state.remainingTime / 60)
        },
        timestamp: Date.now()
      }))
      isWebSocketConnected.value = true
      console.log('WebSocket连接成功，已发送用户偏好，sessionId:', sessionId.value)
      
      // 请求服务器时间同步
      requestTimeSync()
      
      // 发送连接测试消息
      setTimeout(() => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
          ws.value.send(JSON.stringify({
            type: 'test',
            message: '连接测试',
            userId: userId.value,
            sessionId: sessionId.value,
            timestamp: Date.now()
          }))
          console.log('已发送连接测试消息')
        }
      }, 1000)
    }
    
    ws.value.onmessage = async (event) => {
      console.log('收到WebSocket消息:', {
        dataType: typeof event.data,
        isBlob: event.data instanceof Blob,
        isArrayBuffer: event.data instanceof ArrayBuffer,
        size: event.data instanceof Blob ? event.data.size : 
              event.data instanceof ArrayBuffer ? event.data.byteLength :
              event.data.length,
        timestamp: new Date().toISOString()
      })
      
      // 处理接收到的消息
      if (event.data instanceof Blob) {
        // 处理二进制音频数据
        console.log('收到对方音频Blob数据:', {
          size: event.data.size,
          type: event.data.type
        })
        // 设置对方正在说话状态
        state.isPartnerSpeaking = true
        await playPartnerAudio(event.data)
      } else {
        // 处理文本消息
        try {
          const data = JSON.parse(event.data)
          console.log('收到WebSocket文本消息:', data)
          
          switch (data.type) {
            case 'system':
              console.log('系统消息:', data.message)
              break
            case 'test':
              console.log('收到测试消息:', data.message)
              break
            case 'audio':
              console.log('音频元数据:', data)
              // 对方发送音频的元数据，准备接收音频数据
              state.isPartnerSpeaking = true
              break
            case 'partner_speaking':
              // 对方开始说话
              state.isPartnerSpeaking = true
              if (partnerModelRef.value && displayBattleType.value === '真人对战') {
                partnerModelRef.value.playMotion('Talk', undefined)
              }
              break
            case 'partner_stopped':
              // 对方停止说话
              state.isPartnerSpeaking = false
              if (partnerModelRef.value && displayBattleType.value === '真人对战') {
                partnerModelRef.value.playMotion('Idle', undefined)
              }
              break
            case 'partner_end_battle':
              // 对方请求结束对战 (旧版本兼容)
              console.log('对方请求结束对战(旧版本)')
              handlePartnerEndBattle()
              break
            case 'battle_ended':
              // 服务器确认对战结束 (旧版本兼容)
              console.log('服务器确认对战结束，准备跳转到评分界面')
              handleBattleEnded()
              break
            case 'user_connected':
              console.log('用户连接成功:', data)
              break
            case 'error':
              console.error('服务器错误:', data.message)
              alert('服务器错误: ' + data.message)
              break
            case 'time_sync_request': {
              // 处理时间同步请求
              console.log('收到时间同步请求:', data)
              const serverTime = Date.now()
              ws.value?.send(JSON.stringify({
                type: 'time_sync_response',
                serverTime: serverTime,
                userId: userId.value,
                sessionId: sessionId.value,
                timestamp: Date.now()
              }))
              console.log('已发送时间同步响应')
              break
            }
            case 'time_sync_response': {
              // 处理时间同步响应
              handleTimeSync(data.serverTime, data.clientRequestTime)
              break
            }
            case 'battle_sync': {
              // 同步对战信息
              console.log('收到对战同步消息:', data)
              startSyncedBattle(data.serverStartTime, data.duration, data.topic, data.prompts)
              break
            }
            case 'topic_sync': {
              // 同步主题信息
              console.log('收到主题同步消息:', data)
              syncBattleTopic(data.topic, data.prompts, data.difficulty)
              break
            }
            case 'end_battle_request': {
              // 收到对方的结束对战请求
              console.log('收到对方的结束对战请求:', data)
              handlePartnerEndBattleRequest(data)
              break
            }
            case 'end_battle_confirm': {
              // 对方同意结束对战
              console.log('对方同意结束对战:', data)
              handleBattleEndConfirmed()
              break
            }
            case 'end_battle_refuse': {
              // 对方拒绝结束对战
              console.log('对方拒绝结束对战:', data)
              handleBattleEndRefused()
              break
            }
            case 'battle_end_notification': {
              // 收到对方退出对战的通知
              console.log('收到对方退出对战通知:', data)
              handlePartnerLeftBattle(data)
              break
            }
            default:
              console.log('未知消息类型:', data)
          }
        } catch (error) {
          console.error('解析WebSocket消息失败:', error, '原始数据:', event.data)
        }
      }
    }
    
    ws.value.onclose = () => {
      console.log('WebSocket连接关闭')
      isWebSocketConnected.value = false
    }
    
    ws.value.onerror = (error) => {
      console.error('WebSocket连接错误:', error)
      isWebSocketConnected.value = false
    }
  } catch (error) {
    console.error('建立WebSocket连接失败:', error)
  }
}

// 初始化音频上下文
const initAudioContext = () => {
  if (!audioContext.value) {
    audioContext.value = new AudioContext()
  }
  return audioContext.value
}

// 播放对方音频
const playPartnerAudio = async (audioBlob: Blob) => {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const context = initAudioContext()
    
    const audioBuffer = await context.decodeAudioData(arrayBuffer)
    const source = context.createBufferSource()
    source.buffer = audioBuffer
    
    const gainNode = context.createGain()
    gainNode.gain.value = 1.0
    
    source.connect(gainNode)
    gainNode.connect(context.destination)
    
    source.onended = () => {
      isPlayingPartnerAudio.value = false
      state.isPartnerSpeaking = false
      console.log('对方音频播放完成')
      
      // 播放完成后更新模型状态
      if (partnerModelRef.value && displayBattleType.value === '真人对战') {
        partnerModelRef.value.playMotion('Idle', undefined)
      }
    }
    
    isPlayingPartnerAudio.value = true
    
    // 更新模型状态为说话
    if (partnerModelRef.value && displayBattleType.value === '真人对战') {
      partnerModelRef.value.playMotion('Talk', undefined)
    }
    
    source.start(0)
    console.log('开始播放对方音频', {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      size: audioBlob.size
    })
  } catch (error) {
    console.error('播放对方音频失败:', error)
    isPlayingPartnerAudio.value = false
  }
}

// 发送音频数据到WebSocket
const sendAudioToWebSocket = async (audioBlob: Blob) => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket未连接，无法发送音频')
    return
  }
  
  try {
    // 检查音频数据大小
    if (audioBlob.size < 100) {
      console.log('音频数据太小，跳过发送:', audioBlob.size)
      return
    }
    
    console.log('准备发送音频数据:', {
      size: audioBlob.size,
      type: audioBlob.type,
      sessionId: sessionId.value,
      userId: userId.value
    })
    
    // 简化发送逻辑 - 直接发送音频Blob
    ws.value.send(audioBlob)
    
    console.log('音频数据发送完成:', {
      size: audioBlob.size,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('发送音频数据失败:', error)
    alert('发送音频失败，请重试')
  }
}

// 设置状态变化回调
controller.setStateChangeCallback(() => {
  // 更新响应式状态
  Object.assign(state, controller.getState())
})

// 确保初始状态正确
console.log('初始化状态检查:', {
  matchStarted: controller.getState().matchStarted,
  remainingTime: controller.getState().remainingTime
})

// PIXI App 初始化
onMounted(async () => {
  console.log('Versus页面已挂载')
  
  // 应用匹配参数
  if (route.query.battleType) {
    controller.changeMatchType(route.query.battleType as '真人对战' | 'AI辅助')
    console.log('Versus页面：设置对战类型为', route.query.battleType)
  } else {
    // 默认设置为AI辅助模式
    controller.changeMatchType('AI辅助')
    console.log('Versus页面：默认设置对战类型为 AI辅助')
  }
  if (route.query.difficulty) {
    // 四级/六级映射
    let mapped = route.query.difficulty
    if (mapped === '四级') mapped = '中级'
    if (mapped === '六级') mapped = '高级'
    controller.changeDifficultyLevel(mapped as '初级' | '中级' | '高级')
    console.log('Versus页面：设置难度等级为', mapped)
  }
  if (route.query.duration) {
    state.remainingTime = parseInt(route.query.duration as string) * 60
  }
  
  // 获取用户ID
  if (userModel.userId) {
    userId.value = userModel.userId
    console.log('从userModel获取用户ID:', userId.value)
  } else if (route.query.userId) {
    userId.value = route.query.userId as string
    console.log('从路由参数获取用户ID:', userId.value)
  } else {
    // 如果没有用户ID，生成一个临时ID
    userId.value = `user_${Math.random().toString(36).substr(2, 9)}`
    console.log('生成临时用户ID:', userId.value)
  }
  
  // 获取对手ID
  if (route.query.opponentId) {
    opponentId.value = route.query.opponentId as string
    console.log('获取到对手ID:', opponentId.value)
  }
  
  // 获取用户正在使用的模型ID
  try {
    userModelId.value = await getUserModelId(userId.value)
    console.log('用户模型ID已设置:', userModelId.value)
  } catch (error) {
    console.error('获取用户模型ID失败:', error)
    userModelId.value = '2' // 默认使用 miku 模型
  }
  
  // 获取对手正在使用的模型ID
  if (opponentId.value) {
    try {
      opponentModelId.value = await getOpponentModelId(opponentId.value)
      console.log('对手模型ID已设置:', opponentModelId.value)
    } catch (error) {
      console.error('获取对手模型ID失败:', error)
      opponentModelId.value = '1' // 默认使用 真寻 模型
    }
  } else {
    // 如果没有对手ID（AI模式），使用默认模型
    opponentModelId.value = '1' // 默认使用 真寻 模型
    console.log('AI模式：使用默认对手模型')
  }
  
  // 获取WebSocket连接信息并自动连接（仅真人对战模式）
  if (route.query.sessionId && route.query.userId && displayBattleType.value === '真人对战') {
    sessionId.value = route.query.sessionId as string
    userId.value = route.query.userId as string
    console.log('真人对战模式：检测到WebSocket连接信息，开始建立连接...')
    // 自动建立WebSocket连接
    await connectWebSocket()
    
    // 等待时间同步完成，然后启动计时器
    let syncCheckCount = 0
    const checkSync = () => {
      if (isTimeSynced.value) {
        console.log('时间同步完成，准备启动计时器')
        // 如果没有收到服务器的battle_sync消息，使用默认时间启动
        setTimeout(() => {
          if (!battleStartTime.value) {
            console.log('未收到服务器同步消息，使用默认时间启动计时器')
            controller.startSyncedTimer(state.remainingTime)
          }
        }, 2000)
      } else if (syncCheckCount < 50) { // 最多等待5秒
        syncCheckCount++
        setTimeout(checkSync, 100)
      } else {
        console.warn('时间同步超时，使用本地时间启动计时器')
        controller.startSyncedTimer(state.remainingTime)
      }
    }
    checkSync()
  } else {
    console.log('AI智能对战模式：跳过WebSocket连接，直接启动本地计时器')
    // AI对战模式或没有WebSocket连接信息，直接启动计时器
    setTimeout(() => {
      controller.startSyncedTimer(state.remainingTime)
    }, 1000)
  }
  
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
  
  console.log('PIXI应用初始化完成，对战模式:', displayBattleType.value)
  console.log('WebSocket连接状态:', isWebSocketConnected.value)
  console.log('对战状态 matchStarted:', state.matchStarted)
  console.log('对战自动启动完成，计时器已开始')
})

// 清理资源
onBeforeUnmount(() => {
  console.log('versus组件即将卸载，开始清理资源')
  
  // 先清理控制器
  try {
    controller.destroy()
  } catch (error) {
    console.error('清理控制器时出错:', error)
  }
  
  // 清理Live2D模型
  try {
    if (userModelRef.value) {
      userModelRef.value.destroy?.()
      userModelRef.value = null
    }
    if (partnerModelRef.value) {
      partnerModelRef.value.destroy?.()
      partnerModelRef.value = null
    }
  } catch (error) {
    console.error('清理Live2D模型时出错:', error)
  }
  
  // 清理ResizeObserver
  try {
    if (resizeObserver && pixiContainerRef.value) {
      resizeObserver.unobserve(pixiContainerRef.value)
      resizeObserver.disconnect()
      resizeObserver = null
    }
  } catch (error) {
    console.error('清理ResizeObserver时出错:', error)
  }
  
  // 清理PIXI应用
  try {
    if (pixiAppInstance.value) {
      pixiAppInstance.value.destroy(true, { children: true, texture: true, baseTexture: true })
      pixiAppInstance.value = null
    }
  } catch (error) {
    console.error('清理PIXI应用时出错:', error)
  }
  
  // 清理DOM引用
  try {
    if (pixiContainerRef.value) {
      pixiContainerRef.value.innerHTML = ''
      pixiContainerRef.value = null
    }
  } catch (error) {
    console.error('清理DOM引用时出错:', error)
  }
  
  // 清理WebSocket连接
  try {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
  } catch (error) {
    console.error('清理WebSocket和音频上下文时出错:', error)
  }
  
  console.log('versus组件资源清理完成')
})

// 处理对方的结束对战请求（简化版，直接跳转）
const handlePartnerEndBattleRequest = (data: { type: string; legacy?: boolean; [key: string]: unknown }) => {
  console.log('收到对方结束对战请求:', data)
  
  // 显示通知，直接跳转到评分界面
  alert('对方已退出对战，即将跳转到评分界面')
  
  // 延迟跳转
  setTimeout(async () => {
    await endBattleAndGoToEvaluation()
  }, 1000)
}

// 处理对战结束确认（保留兼容性）
const handleBattleEndConfirmed = async () => {
  console.log('对方同意结束对战，准备跳转到评分界面')
  
  // 显示通知
  alert('对方已同意结束对战，即将跳转到评分界面')
  
  // 清理资源并跳转
  try {
    await endBattleAndGoToEvaluation()
  } catch (error) {
    console.error('结束对战处理失败:', error)
    await router.push('/evaluation')
  }
}

// 处理对战结束拒绝（保留兼容性）
const handleBattleEndRefused = () => {
  console.log('对方拒绝结束对战')
  alert('对方拒绝结束对战，继续当前对战')
}

// 结束对战相关函数（旧版本，保持兼容性）
const handlePartnerEndBattle = () => {
  console.log('收到旧版本的对方结束对战请求')
  // 为了兼容性，调用新的处理函数
  handlePartnerEndBattleRequest({ type: 'end_battle_request', legacy: true })
}

const handleBattleEnded = async () => {
  // 服务器确认对战结束，清理资源并跳转
  try {
    // 清理WebSocket连接
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isWebSocketConnected.value = false
    
    // 清理音频上下文
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    
    // 停止录音等操作
    if (state.isRecording) {
      await controller.toggleRecording()
    }
    
    console.log('对战资源清理完成，跳转到评分界面')
    
    // 延迟跳转确保清理完成
    setTimeout(async () => {
      await router.push('/evaluation')
    }, 500)
  } catch (error) {
    console.error('结束对战处理失败:', error)
    // 即使出错也要跳转
    await router.push('/evaluation')
  }
}

// 时间同步相关函数
const requestTimeSync = () => {
  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    return
  }
  
  const clientTime = Date.now()
  ws.value.send(JSON.stringify({
    type: 'time_sync_request',
    clientTime: clientTime,
    userId: userId.value,
    sessionId: sessionId.value
  }))
  console.log('发送时间同步请求，客户端时间:', clientTime)
}

// 处理服务器时间同步响应
const handleTimeSync = (serverTime: number, clientRequestTime: number) => {
  const clientReceiveTime = Date.now()
  const networkDelay = (clientReceiveTime - clientRequestTime) / 2
  
  // 计算服务器时间偏移
  serverTimeOffset.value = serverTime - clientReceiveTime + networkDelay
  isTimeSynced.value = true
  
  console.log('时间同步完成:', {
    serverTime,
    clientTime: clientReceiveTime,
    networkDelay,
    serverTimeOffset: serverTimeOffset.value
  })
}

// 获取同步后的服务器时间
const getServerTime = () => {
  return Date.now() + serverTimeOffset.value
}

// 启动同步对战
const startSyncedBattle = (serverStartTime: number, duration: number, topic?: string, prompts?: string[]) => {
  console.log('启动同步对战:', {
    serverStartTime,
    duration,
    topic,
    prompts,
    currentServerTime: getServerTime()
  })
  
  // 如果服务器提供了主题和提示，先同步主题
  if (topic && prompts) {
    console.log('同步服务器分配的主题:', topic)
    controller.syncServerTopic(topic, prompts, state.difficultyLevel)
  }
  
  battleStartTime.value = serverStartTime
  const currentTime = getServerTime()
  
  // 如果对战已经开始，计算剩余时间
  if (currentTime >= serverStartTime) {
    const elapsedTime = Math.floor((currentTime - serverStartTime) / 1000)
    const remainingTime = Math.max(0, duration - elapsedTime)
    
    console.log('对战已开始:', {
      elapsedTime,
      remainingTime
    })
    
    // 启动同步计时器
    controller.startSyncedTimer(remainingTime)
  } else {
    // 对战还未开始，等待开始时间
    const delayMs = serverStartTime - currentTime
    console.log('对战将在', delayMs, 'ms后开始')
    
    setTimeout(() => {
      console.log('同步对战正式开始!')
      controller.startSyncedTimer(duration)
    }, delayMs)
  }
}

// 同步对战主题
const syncBattleTopic = (topic: string, prompts: string[], difficulty: string) => {
  console.log('同步对战主题:', {
    topic,
    prompts,
    difficulty
  })
  
  // 同步主题到控制器
  controller.syncServerTopic(topic, prompts, difficulty)
  
  console.log('主题同步完成，当前主题:', controller.currentTopic)
}

// 处理对方退出对战的通知
const handlePartnerLeftBattle = (data: { message?: string; [key: string]: unknown }) => {
  console.log('对方已退出对战:', data)
  
  // 显示通知
  const message = data.message || '对方已退出对战'
  alert(`${message}\n\n即将跳转到评分界面`)
  
  // 延迟跳转到评分界面
  setTimeout(async () => {
    try {
      await endBattleAndGoToEvaluation()
    } catch (error) {
      console.error('处理对方退出时出错:', error)
      await router.push('/evaluation')
    }
  }, 1000)
}
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

.model-column:not(.model-column-overlay) {
  display: none !important;
}

.v-card-text {
  padding: 8px !important;
}

/* 语音识别相关样式 */
.speech-recognition-section {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.speech-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.speech-text-display {
  margin-top: 8px;
}

.speech-textarea .v-field__input {
  color: white !important;
}

.speech-textarea .v-field__outline {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.speech-textarea .v-field--focused .v-field__outline {
  border-color: rgba(25, 118, 210, 0.8) !important;
}

.confidence-display {
  display: flex;
  justify-content: flex-end;
}

/* 脉搏动画 */
.pulse-animation {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 录音按钮动画 */
.recording-btn {
  animation: recording-pulse 1.5s infinite;
  transform-origin: center;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4) !important;
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

/* AI头像样式 */
.ai-avatar {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}

.ai-avatar .v-avatar {
  transition: all 0.3s ease;
}

.ai-avatar .v-avatar.ai-speaking {
  animation: ai-speaking-pulse 1.5s infinite;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
}

@keyframes ai-speaking-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 30px rgba(76, 175, 80, 0.8);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
  }
}

/* 返回匹配按钮样式 */
.back-to-matching-btn {
  position: absolute !important;
  top: 8px;
  left: 8px;
  z-index: 10;
  min-width: 120px;
  height: 40px;
  font-size: 14px;
}

/* 调试面板样式 */
.debug-info {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.debug-info div {
  margin-bottom: 4px;
}

.debug-info strong {
  color: #1976d2;
  min-width: 120px;
  display: inline-block;
}

/* 对话历史区域样式 */
.conversation-card {
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.conversation-content {
  flex: 1;
  overflow: hidden;
  padding: 8px !important;
}

.conversation-messages {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.message-item {
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-message {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05));
}

.ai-message {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.message-sender {
  font-weight: 600;
  color: var(--v-theme-primary);
}

.message-time {
  font-size: 0.75rem;
  color: var(--v-theme-on-surface-variant);
  margin-left: auto;
}

.message-content {
  padding-left: 40px;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-bubble {
  background: linear-gradient(135deg, #1976d2, #1565c0);
  color: white;
  margin-left: auto;
  margin-right: 0;
  max-width: 80%;
}

.ai-bubble {
  background: linear-gradient(135deg, #4caf50, #43a047);
  color: white;
  margin-left: 0;
  margin-right: auto;
  max-width: 80%;
}

.thinking-bubble {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

/* 思考动画 */
.thinking-dots {
  display: flex;
  gap: 4px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  animation: thinking 1.4s infinite ease-in-out both;
}

.thinking-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.thinking-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes thinking {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 滚动条样式 */
.conversation-messages::-webkit-scrollbar {
  width: 6px;
}

.conversation-messages::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.conversation-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.conversation-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* 现有样式继续 */
</style>