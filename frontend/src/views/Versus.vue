<template>
  <v-container fluid class="versus-container">
    <v-row>
      <!-- 顶部信息栏 -->
      <v-col cols="12" class="py-2">
        <v-card class="mb-4">
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

      <!-- 视频区域 -->
      <v-col cols="12" md="6" class="video-column">
        <v-card class="video-card">
          <div class="video-placeholder">
            <v-avatar size="80" color="primary" class="mb-3">
              <span class="text-h4">{{ userInitials }}</span>
            </v-avatar>
            <div class="text-h6">您 ({{ userModel.email || '用户' }})</div>
            <div class="status" :class="{ 'status-active': isUserSpeaking }">{{ isUserSpeaking ? '正在发言' : '等待中' }}</div>
          </div>
          <v-card-actions class="d-flex justify-center">
            <v-btn
              color="error"
              variant="outlined"
              :icon="userMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
              @click="toggleMute('user')"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="video-column">
        <v-card class="video-card">
          <div class="video-placeholder">
            <v-avatar size="80" color="secondary" class="mb-3">
              <span class="text-h4" v-if="matchType === '真人对战'">{{ partnerInitials }}</span>
              <v-icon size="40" v-else>mdi-robot</v-icon>
            </v-avatar>
            <div class="text-h6">{{ matchType === '真人对战' ? '对方' : 'AI助手' }}</div>
            <div class="status" :class="{ 'status-active': isPartnerSpeaking }">{{ isPartnerSpeaking ? '正在发言' : '等待中' }}</div>
          </div>
          <v-card-actions v-if="matchType === '真人对战'" class="d-flex justify-center">
            <v-btn
              disabled
              color="grey"
              variant="outlined"
              icon="mdi-volume-high"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- 对话提示区域 -->
      <v-col cols="12">
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
      <v-col cols="12">
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
      <v-col cols="12" v-if="matchStarted">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import userModel from '../models/user'

const router = useRouter()

// 状态变量
const matchStarted = ref(false)
const remainingTime = ref(300) // 5分钟
const userMuted = ref(false)
const isUserSpeaking = ref(false)
const isPartnerSpeaking = ref(false)
const matchType = ref('真人对战')
const difficultyLevel = ref('中级')

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
  // 示例消息，实际使用时应该是空数组
  // { isUser: true, text: 'I believe online education provides flexibility for students.' },
  // { isUser: false, text: 'That\'s true, but it lacks the social interaction of traditional classrooms.' }
])

// 用户首字母
const userInitials = computed(() => {
  const email = userModel.email || ''
  return email.charAt(0).toUpperCase()
})

// 对方首字母（随机生成）
const partnerInitials = computed(() => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']
  return names[Math.floor(Math.random() * names.length)]
})

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
  
  // 模拟数据 - 在实际项目中应通过WebSocket等获取实时数据
  setTimeout(() => {
    isUserSpeaking.value = true
  }, 2000)
  
  setTimeout(() => {
    isUserSpeaking.value = false
    transcriptMessages.value.push({ 
      isUser: true, 
      text: 'I think this topic is really interesting because it affects all of us in our daily lives.'
    })
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
  // 这里可以重置相关状态或加载不同的内容
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

onMounted(() => {
  // 页面加载时的逻辑
})

onBeforeUnmount(() => {
  // 清除定时器
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.versus-container {
  padding-top: 16px;
  padding-bottom: 16px;
}

.video-column {
  height: 300px;
  display: flex;
}

.video-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.video-placeholder {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.status {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.status-active {
  color: #4caf50;
  font-weight: bold;
}

.prompt-card {
  margin-top: 16px;
}

.prompt-text {
  font-size: 18px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-style: italic;
}

.match-type-select, .difficulty-select {
  width: 120px;
}

.transcript-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.transcript-message {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.transcript-message:last-child {
  border-bottom: none;
}

.user-message {
  background-color: #e3f2fd;
  margin: 4px 0;
  padding: 8px;
  border-radius: 8px;
}
</style>