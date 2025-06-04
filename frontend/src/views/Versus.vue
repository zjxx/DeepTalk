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
        <div class="d-flex justify-center align-center mt-2">
          <v-chip color="primary" class="mr-2">
            <v-icon start>mdi-clock-outline</v-icon>
            总时间: {{ formatTime(remainingTime) }}
          </v-chip>
          
          <!-- 发言权和倒计时显示 -->
          <v-chip 
            v-if="matchStarted && isSpeakingTimerActive"
            :color="speakingTurn === 'user' ? 'success' : 'warning'"
            class="mr-2"
          >
            <v-icon start>mdi-account-voice</v-icon>
            {{ speakingTurn === 'user' ? '您的' : '对方' }}发言时间: {{ speakingTimeLeft }}s
          </v-chip>
          
          <!-- 测试用跳过按钮 -->
          <v-btn 
  v-if="matchStarted && speakingTurn === 'partner' && isDev"
  color="orange"
  variant="outlined"
  size="small"
  @click="skipPartnerTurn"
  class="mr-2"
>
            <v-icon start size="small">mdi-skip-next</v-icon>
            跳过对方发言 (测试)
          </v-btn>
          
          <v-chip 
            v-if="!matchStarted"
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
          <!-- PIXI Canvas 将被添加到这里 -->
          <!-- Live2DModel 组件现在是这个共享Canvas的逻辑子元素 -->
          <!-- 它们的实际渲染由PIXI控制，定位通过initialX/Y -->
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="userModelRef" 
            :app="pixiAppInstance as PIXI.Application"
            type="user"
            modelPath="/live2d/Nahida_1080/Nahida_1080.model3.json"
            :initialX="canvasWidth * 0.1" 
            :initialY="canvasHeight * 0.15"
            :scale="0.2" 
          />
          <Live2DModel 
            v-if="pixiAppInstance"
            ref="partnerModelRef"
            :app="pixiAppInstance as PIXI.Application"
            type="partner"
            modelPath="/live2d/Mahiro_GG/Mahiro_V1.model3.json" 
            :initialX="canvasWidth * 0.6" 
            :initialY="canvasHeight * 0.15"
            :scale="0.1"
          />
        </div>
      </v-col>

      <!-- 用户模型信息卡片 -->
  <v-col cols="12" md="6" class="model-column model-column-overlay">
    <v-card class="model-card transparent-card">
      <v-card-title class="text-center white-text py-2">
        您 ({{ userModelComputed.email || '用户' }})
        <v-icon 
          v-if="speakingTurn === 'user' && isSpeakingTimerActive"
          color="success"
          class="ml-2"
        >
          mdi-microphone
        </v-icon>
      </v-card-title>
      <v-card-actions class="d-flex justify-center py-2">
        <v-chip 
          :color="isUserSpeaking ? 'success' : (canUserSpeak ? 'primary' : 'grey')" 
          class="mr-2"
          :class="{ 'speaking-pulse': isRecording }"
        >
          {{ 
            isRecording ? '录音中... (再按一次结束)' : 
            (isUserSpeaking ? '正在发言' : 
            (canUserSpeak ? '您的发言时间' : '等待发言权'))
          }}
        </v-chip>
        
        <!-- 音量指示器 -->
        <div v-if="isRecording" class="audio-level-indicator mr-2">
          <div class="audio-level-bar" :style="{ width: `${audioLevel}%` }"></div>
        </div>
        
        <!-- 录音按钮 -->
        <v-btn 
          :color="isRecording ? 'error' : (canUserSpeak ? 'primary' : 'grey')" 
          variant="outlined" 
          :icon="isRecording ? 'mdi-stop' : (userMuted ? 'mdi-microphone-off' : 'mdi-microphone')"
          @click="toggleMute('user')"
          :class="{ 'recording-btn': isRecording }"
          :disabled="!canUserSpeak && !isRecording"
          class="mr-2"
        >
          <v-tooltip activator="parent" location="top">
            {{ isRecording ? '停止录音并结束发言' : (canUserSpeak ? '开始录音' : '等待发言权') }}
          </v-tooltip>
        </v-btn>
        
        <!-- 播放上次录音按钮 -->
        <v-btn 
          v-if="lastRecordedAudio"
          :color="isPlayingAudio ? 'success' : 'secondary'" 
          variant="outlined" 
          :icon="isPlayingAudio ? 'mdi-stop' : 'mdi-play'"
          @click="togglePlayLastRecording"
          :disabled="isRecording || (speakingTurn !== 'user' && isSpeakingTimerActive)"
          class="mr-2"
        >
          <v-tooltip activator="parent" location="top">
            {{ isPlayingAudio ? '停止播放' : '播放上次录音' }}
          </v-tooltip>
        </v-btn>
        
        <!-- 删除录音按钮 -->
        <v-btn 
          v-if="lastRecordedAudio"
          color="warning" 
          variant="outlined" 
          icon="mdi-delete"
          @click="deleteLastRecording"
          :disabled="isRecording || isPlayingAudio"
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
        {{ matchType === '真人对战' ? '对方' : 'AI助手' }}
        <v-icon 
          v-if="speakingTurn === 'partner' && isSpeakingTimerActive"
          color="warning"
          class="ml-2"
        >
          mdi-account-voice
        </v-icon>
      </v-card-title>
      <v-card-actions class="d-flex justify-center py-2">
        <v-chip 
          :color="isPartnerSpeaking ? 'success' : (speakingTurn === 'partner' && isSpeakingTimerActive ? 'warning' : 'grey')" 
          class="mr-2"
        >
          {{ 
            isPartnerSpeaking ? '正在发言' : 
            (speakingTurn === 'partner' && isSpeakingTimerActive ? '对方发言时间' : '等待发言权')
          }}
        </v-chip>
        
        <!-- 对方发言时的跳过按钮（仅开发模式显示） -->
        <v-btn 
  v-if="speakingTurn === 'partner' && isSpeakingTimerActive && isDev"
  color="orange"
  variant="outlined"
  size="small"
  @click="skipPartnerTurn"
  class="mr-2"
>
          <v-icon start size="small">mdi-skip-next</v-icon>
          跳过
        </v-btn>
        
        <v-btn 
          v-if="matchType === '真人对战'" 
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

// 解决 import.meta.env 类型报错
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  // 你可以根据需要添加更多环境变量类型声明
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

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
const isDev = import.meta.env.DEV
// 状态变量
const matchStarted = ref(false)
const remainingTime = ref(300)
const userMuted = ref(false)
const isUserSpeaking = ref(false)
const isPartnerSpeaking = ref(false)
const matchType = ref('真人对战')
const difficultyLevel = ref('中级')
const userModelComputed = computed(() => ({ email: 'test@example.com' }))
const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioStream = ref<MediaStream | null>(null)
const audioChunks = ref<Blob[]>([])
const audioLevel = ref(0) // 音频音量级别
// 添加新的状态变量
const lastRecordedAudio = ref<Blob | null>(null)
const isPlayingAudio = ref(false)
const currentAudioElement = ref<HTMLAudioElement | null>(null)
// 添加发言权管理相关的状态
const speakingTurn = ref<'user' | 'partner'>('user') // 当前发言权
const speakingTimeLeft = ref(30) // 剩余发言时间
const isSpeakingTimerActive = ref(false) // 发言计时器是否激活
let speakingTimerInterval: number | null = null
// 修改现有的状态变量，增加发言权控制
const canUserSpeak = computed(() => speakingTurn.value === 'user' && isSpeakingTimerActive.value)


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
// 开始发言计时器
const startSpeakingTimer = () => {
  if (speakingTimerInterval) {
    clearInterval(speakingTimerInterval)
  }
  
  speakingTimeLeft.value = 30
  isSpeakingTimerActive.value = true
  
  speakingTimerInterval = window.setInterval(() => {
    if (speakingTimeLeft.value > 0) {
      speakingTimeLeft.value--
    } else {
      // 时间到，切换发言权
      switchSpeakingTurn()
    }
  }, 1000)
  
  console.log(`${speakingTurn.value}开始发言，限时30秒`)
}

// 停止发言计时器

// 切换发言权
const switchSpeakingTurn = () => {
  // 清理AI发言定时器
  if (aiSpeakingTimeout) {
    clearTimeout(aiSpeakingTimeout)
    aiSpeakingTimeout = null
  }
  
  // 停止当前录音（如果用户正在录音）
  if (isRecording.value && speakingTurn.value === 'user') {
    stopRecording()
  }
  
  // 停止当前说话状态
  isUserSpeaking.value = false
  isPartnerSpeaking.value = false
  
  // 切换发言权
  speakingTurn.value = speakingTurn.value === 'user' ? 'partner' : 'user'
  
  // 重新开始计时器
  startSpeakingTimer()
  
  // 如果是AI的回合，模拟AI发言
  if (speakingTurn.value === 'partner' && matchType.value === 'AI辅助') {
    simulateAISpeaking()
  }
  
  console.log(`发言权切换到: ${speakingTurn.value}`)
}

// 用户主动结束发言
const endUserSpeaking = () => {
  if (speakingTurn.value === 'user') {
    // 停止录音（如果正在录音）
    if (isRecording.value) {
      stopRecording()
    }
    
    // 停止发言状态
    isUserSpeaking.value = false
    
    console.log('用户主动结束发言，切换发言权')
    
    // 立即切换到对方，无需等待
    setTimeout(() => {
      switchSpeakingTurn()
    }, 300) // 只给一点点时间处理录音数据
  }
}
// 添加跳过对方发言的测试函数
const skipPartnerTurn = () => {
  if (speakingTurn.value === 'partner') {
    console.log('跳过对方发言，切换回用户')
    
    // 停止AI发言状态
    isPartnerSpeaking.value = false
    
    // 立即切换发言权回给用户
    switchSpeakingTurn()
  }
}
// 修改AI发言模拟，使其可以被中断
let aiSpeakingTimeout: number | null = null
// 模拟AI发言
const simulateAISpeaking = () => {
  // 清除之前的AI发言定时器（如果存在）
  if (aiSpeakingTimeout) {
    clearTimeout(aiSpeakingTimeout)
    aiSpeakingTimeout = null
  }
  
  setTimeout(() => {
    // 检查是否还是对方的发言回合（防止被跳过）
    if (speakingTurn.value !== 'partner') {
      return
    }
    
    isPartnerSpeaking.value = true
    partnerModelRef.value?.setExpression('F01')
    
    // 模拟AI发言时长（随机5-15秒）
    const speakingDuration = Math.random() * 10000 + 5000
    
    aiSpeakingTimeout = window.setTimeout(() => {
      // 再次检查是否还是对方的发言回合
      if (speakingTurn.value !== 'partner') {
        return
      }
      
      isPartnerSpeaking.value = false
      
      // 添加AI的回复到转写
      const aiResponses = [
        "That's a very interesting perspective. Could you tell me more about your experience with this?",
        "I understand your point. Have you considered the alternative viewpoint?",
        "That's a great example. How do you think this applies in different situations?",
        "Very thoughtful response. What do you think are the main challenges in this area?",
        "I see what you mean. How has this changed over the years in your opinion?"
      ]
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      transcriptMessages.value.push({
        isUser: false,
        text: randomResponse
      })
      
      // AI发言结束，切换回用户
      setTimeout(() => {
        if (speakingTurn.value === 'partner') { // 确保还是对方回合
          switchSpeakingTurn()
        }
      }, 1000)
      
    }, Math.min(speakingDuration, speakingTimeLeft.value * 1000))
  }, 1000)
}
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
  
  // 初始化发言权给用户
  speakingTurn.value = 'user'
  startSpeakingTimer()
  
  userModelRef.value?.playMotion('Flick', undefined)
  
  console.log('对战开始，用户先发言')
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

// 请求麦克风权限并开始录音
const startRecording = async () => {
  // 检查是否有发言权
  if (!canUserSpeak.value) {
    alert(`现在是${speakingTurn.value === 'partner' ? '对方' : '您'}的发言时间，请等待...`)
    return
  }
  
  try {
    console.log('请求麦克风权限...')
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }
    })
    
    audioStream.value = stream
    audioChunks.value = []
    
    const options = {
      mimeType: 'audio/webm;codecs=opus'
    }
    
    mediaRecorder.value = new MediaRecorder(stream, options)
    
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }
    
    mediaRecorder.value.onstop = () => {
      console.log('录音停止')
      processRecordedAudio()
    }
    
    mediaRecorder.value.start(100)
    isRecording.value = true
    isUserSpeaking.value = true
    
    startAudioLevelMonitoring(stream)
    
    console.log('开始录音...')
    
  } catch (error) {
    console.error('无法访问麦克风:', error)
    alert('无法访问麦克风，请检查权限设置')
  }
}

// 停止录音
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    isUserSpeaking.value = false
    
    // 停止音频流
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop())
      audioStream.value = null
    }
    
    console.log('停止录音')
  }
}

// 监听音频级别（用于可视化音量）
const startAudioLevelMonitoring = (stream: MediaStream) => {
  const audioContext = new AudioContext()
  const analyser = audioContext.createAnalyser()
  const microphone = audioContext.createMediaStreamSource(stream)
  const dataArray = new Uint8Array(analyser.frequencyBinCount)
  
  microphone.connect(analyser)
  analyser.fftSize = 256
  
  const checkAudioLevel = () => {
    if (isRecording.value) {
      analyser.getByteFrequencyData(dataArray)
      
      // 计算平均音量
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length
      audioLevel.value = Math.floor((average / 255) * 100)
      
      requestAnimationFrame(checkAudioLevel)
    }
  }
  
  checkAudioLevel()
}

// 处理录制的音频
const processRecordedAudio = () => {
  if (audioChunks.value.length > 0) {
    // 合并音频数据
    const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
    
    // 保存最后录制的音频
    lastRecordedAudio.value = audioBlob
    
    // 这里可以将音频发送到服务器进行语音识别
    console.log('录音完成，音频大小:', audioBlob.size, 'bytes')
    
    // 移除自动播放功能
    // 不再自动播放录制的音频
    
    // 发送到语音识别服务
    sendAudioForTranscription(audioBlob)
  }
}
// 新增：播放上次录音
const playLastRecording = () => {
  if (!lastRecordedAudio.value) return
  
  try {
    // 停止当前播放的音频（如果有）
    if (currentAudioElement.value) {
      currentAudioElement.value.pause()
      currentAudioElement.value = null
    }
    
    const audioUrl = URL.createObjectURL(lastRecordedAudio.value)
    const audio = new Audio(audioUrl)
    
    audio.onloadeddata = () => {
      console.log('音频加载完成，开始播放')
    }
    
    audio.onplay = () => {
      isPlayingAudio.value = true
      console.log('开始播放录音')
    }
    
    audio.onended = () => {
      isPlayingAudio.value = false
      currentAudioElement.value = null
      URL.revokeObjectURL(audioUrl) // 清理对象URL
      console.log('录音播放完成')
    }
    
    audio.onerror = (error) => {
      isPlayingAudio.value = false
      currentAudioElement.value = null
      URL.revokeObjectURL(audioUrl)
      console.error('音频播放失败:', error)
      alert('音频播放失败')
    }
    
    audio.onpause = () => {
      isPlayingAudio.value = false
      console.log('录音播放暂停')
    }
    
    currentAudioElement.value = audio
    audio.play().catch(error => {
      console.error('播放失败:', error)
      isPlayingAudio.value = false
      currentAudioElement.value = null
      URL.revokeObjectURL(audioUrl)
      alert('无法播放音频，请检查浏览器设置')
    })
    
  } catch (error) {
    console.error('创建音频对象失败:', error)
    isPlayingAudio.value = false
    alert('音频文件创建失败')
  }
}
// 新增：停止播放音频
const stopPlayingAudio = () => {
  if (currentAudioElement.value) {
    currentAudioElement.value.pause()
    currentAudioElement.value.currentTime = 0
    currentAudioElement.value = null
  }
  isPlayingAudio.value = false
}
// 新增：播放/停止上次录音的函数
const togglePlayLastRecording = () => {
  if (isPlayingAudio.value) {
    // 停止播放
    stopPlayingAudio()
  } else {
    // 开始播放
    playLastRecording()
  }
}
// 新增：删除上次录音
const deleteLastRecording = () => {
  if (confirm('确定要删除上次录音吗？')) {
    // 停止播放（如果正在播放）
    if (isPlayingAudio.value) {
      stopPlayingAudio()
    }
    
    // 清除录音数据
    lastRecordedAudio.value = null
    console.log('录音已删除')
  }
}
// 播放录制的音频（调试用）
// const playRecordedAudio = (audioBlob: Blob) => {
//   const audioUrl = URL.createObjectURL(audioBlob)
//   const audio = new Audio(audioUrl)
//   audio.play()
// }

// 发送音频到语音识别服务
const sendAudioForTranscription = async (audioBlob: Blob) => {
  try {
    // 这里实现发送到语音识别API的逻辑
    console.log('发送音频到语音识别服务...', audioBlob)
    
    // 示例：模拟语音识别结果
    setTimeout(() => {
      const simulatedText = "这是模拟的语音识别结果"
      transcriptMessages.value.push({
        isUser: true,
        text: simulatedText
      })
    }, 1000)
    
    // 实际实现时，您可能需要这样的代码：
    /*
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    
    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    transcriptMessages.value.push({
      isUser: true,
      text: result.text
    })
    */
  } catch (error) {
    console.error('语音识别失败:', error)
  }
}

// 修改toggleMute函数以支持录音
const toggleMute = (who: 'user' | 'partner') => {
  if (who === 'user') {
    if (isRecording.value) {
      // 用户主动停止录音，结束发言并交还发言权
      stopRecording()
      userMuted.value = true
      
      // 立即结束发言并切换发言权
      endUserSpeaking()
    } else {
      // 检查是否可以开始录音
      if (!canUserSpeak.value) {
        alert(`现在是${speakingTurn.value === 'partner' ? '对方' : '您'}的发言时间，请等待...`)
        return
      }
      
      // 停止当前播放的音频（如果有）
      if (isPlayingAudio.value) {
        stopPlayingAudio()
      }
      
      startRecording()
      userMuted.value = false
    }
    
    // 更新模型表情
    if (userModelRef.value) {
      userModelRef.value.setExpression(userMuted.value ? 'MouthOff' : 'MouthOn')
    }
  }
}
onBeforeUnmount(() => {
  // 清理所有计时器
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  
  if (speakingTimerInterval) {
    clearInterval(speakingTimerInterval)
  }
  
  // 清理AI发言定时器
  if (aiSpeakingTimeout) {
    clearTimeout(aiSpeakingTimeout)
  }
  
  // 清理音频资源
  if (isRecording.value) {
    stopRecording()
  }
  
  if (isPlayingAudio.value) {
    stopPlayingAudio()
  }
  
  lastRecordedAudio.value = null
  
  // 清理PIXI资源
  if (resizeObserver && pixiContainerRef.value) {
    resizeObserver.unobserve(pixiContainerRef.value)
    resizeObserver = null
  }
  if (pixiAppInstance.value) {
    pixiAppInstance.value.destroy(true, { children: true, texture: true })
    pixiAppInstance.value = null
  }
})
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
      // 清理所有计时器
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
      
      if (speakingTimerInterval) {
        clearInterval(speakingTimerInterval)
        speakingTimerInterval = null
      }
      
      // 停止录音
      if (isRecording.value) {
        stopRecording()
      }
      
      // 重置状态
      matchStarted.value = false
      remainingTime.value = 300
      speakingTurn.value = 'user'
      isSpeakingTimerActive.value = false
      speakingTimeLeft.value = 30
      isUserSpeaking.value = false
      isPartnerSpeaking.value = false
      
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
/* 播放按钮动画 */
.v-btn:has(.mdi-play) {
  transition: all 0.3s ease;
}

.v-btn:has(.mdi-play):hover {
  transform: scale(1.05);
}

/* 播放中的按钮样式 */
.v-btn:has(.mdi-stop)[color="success"] {
  animation: playing-pulse 2s infinite;
}

@keyframes playing-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 按钮组合样式 */
.v-card-actions .v-btn {
  margin: 0 2px;
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

/* ...existing styles... */
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