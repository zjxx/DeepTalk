<template>
  <v-container fluid class="matching-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8" lg="6">
        <!-- 主标题 -->
        <v-card class="main-card mb-4" elevation="12">
          <v-card-title class="text-center bg-primary text-white pa-6">
            <div class="text-h3">
              <v-icon start size="large">mdi-sword-cross</v-icon>
              口语对战匹配
            </div>
            <div class="text-subtitle-1 mt-2">选择您的对战模式和难度等级</div>
          </v-card-title>
        </v-card>

        <!-- 对战类型选择 -->
        <v-card class="selection-card mb-4" elevation="8">
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-account-multiple</v-icon>
            对战类型
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-card 
                  :class="['battle-type-card', { 'selected': selectedBattleType === 'AI辅助' }]"
                  @click="selectBattleType('AI辅助')"
                  elevation="4"
                  hover
                >
                  <v-card-text class="text-center pa-6">
                    <v-avatar size="80" color="info" class="mb-4">
                      <v-icon size="40" color="white">mdi-robot</v-icon>
                    </v-avatar>
                    <div class="text-h6 mb-2">AI智能对战</div>
                    <div class="text-body-2 text-grey-6">
                      与AI助手进行口语练习<br>
                      智能回应，随时开始
                    </div>
                    <v-chip 
                      v-if="selectedBattleType === 'AI辅助'" 
                      color="success" 
                      class="mt-3"
                    >
                      <v-icon start>mdi-check</v-icon>
                      已选择
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-card 
                  :class="['battle-type-card', { 'selected': selectedBattleType === '真人对战' }]"
                  @click="selectBattleType('真人对战')"
                  elevation="4"
                  hover
                >
                  <v-card-text class="text-center pa-6">
                    <v-avatar size="80" color="warning" class="mb-4">
                      <v-icon size="40" color="white">mdi-account-group</v-icon>
                    </v-avatar>
                    <div class="text-h6 mb-2">真人对战</div>
                    <div class="text-body-2 text-grey-6">
                      与其他用户实时对战<br>
                      真实互动，挑战更大
                    </div>
                    <v-chip 
                      v-if="selectedBattleType === '真人对战'" 
                      color="success" 
                      class="mt-3"
                    >
                      <v-icon start>mdi-check</v-icon>
                      已选择
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>        <!-- 难度等级选择 -->
        <v-card class="selection-card mb-4" elevation="8">
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-chart-line</v-icon>
            难度等级
          </v-card-title>
          <v-card-text>
            <!-- 基础难度 -->
            <div class="mb-4">
              <div class="text-h6 mb-3 d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-stairs</v-icon>
                基础难度
              </div>
              <v-row>
                <v-col cols="12" sm="4">
                  <v-card 
                    :class="['difficulty-card', { 'selected': selectedDifficulty === '初级' }]"
                    @click="selectDifficulty('初级')"
                    elevation="4"
                    hover
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon size="40" color="success" class="mb-2">mdi-leaf</v-icon>
                      <div class="text-h6">初级</div>
                      <div class="text-caption text-grey-6">日常对话</div>
                      <v-chip 
                        v-if="selectedDifficulty === '初级'" 
                        color="success" 
                        size="small"
                        class="mt-2"
                      >
                        ✓
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card 
                    :class="['difficulty-card', { 'selected': selectedDifficulty === '中级' }]"
                    @click="selectDifficulty('中级')"
                    elevation="4"
                    hover
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon size="40" color="warning" class="mb-2">mdi-fire</v-icon>
                      <div class="text-h6">中级</div>
                      <div class="text-caption text-grey-6">话题讨论</div>
                      <v-chip 
                        v-if="selectedDifficulty === '中级'" 
                        color="success" 
                        size="small"
                        class="mt-2"
                      >
                        ✓
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <v-card 
                    :class="['difficulty-card', { 'selected': selectedDifficulty === '高级' }]"
                    @click="selectDifficulty('高级')"
                    elevation="4"
                    hover
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon size="40" color="error" class="mb-2">mdi-lightning-bolt</v-icon>
                      <div class="text-h6">高级</div>
                      <div class="text-caption text-grey-6">深度辩论</div>
                      <v-chip 
                        v-if="selectedDifficulty === '高级'" 
                        color="success" 
                        size="small"
                        class="mt-2"
                      >
                        ✓
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- CET等级 -->
            <v-divider class="my-4"></v-divider>
            <div>
              <div class="text-h6 mb-3 d-flex align-center">
                <v-icon color="secondary" class="mr-2">mdi-school</v-icon>
                CET等级
              </div>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-card 
                    :class="['difficulty-card cet-card', { 'selected': selectedDifficulty === '四级' }]"
                    @click="selectDifficulty('四级')"
                    elevation="4"
                    hover
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon size="50" color="info" class="mb-2">mdi-school</v-icon>
                      <div class="text-h5">CET-4</div>
                      <div class="text-subtitle-2 mb-1">大学英语四级</div>
                      <div class="text-caption text-grey-6">基础应用能力</div>
                      <v-chip 
                        v-if="selectedDifficulty === '四级'" 
                        color="success" 
                        size="small"
                        class="mt-2"
                      >
                        ✓ 已选择
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-card 
                    :class="['difficulty-card cet-card', { 'selected': selectedDifficulty === '六级' }]"
                    @click="selectDifficulty('六级')"
                    elevation="4"
                    hover
                  >
                    <v-card-text class="text-center pa-4">
                      <v-icon size="50" color="purple" class="mb-2">mdi-trophy</v-icon>
                      <div class="text-h5">CET-6</div>
                      <div class="text-subtitle-2 mb-1">大学英语六级</div>
                      <div class="text-caption text-grey-6">高级应用能力</div>
                      <v-chip 
                        v-if="selectedDifficulty === '六级'" 
                        color="success" 
                        size="small"
                        class="mt-2"
                      >
                        ✓ 已选择
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- 匹配设置 -->
        <v-card class="settings-card mb-4" elevation="8">
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary">mdi-cog</v-icon>
            匹配设置
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="6">
                <v-select
                  v-model="sessionDuration"
                  :items="durationOptions"
                  label="对战时长"
                  prepend-icon="mdi-clock-outline"
                  density="comfortable"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="enableVoiceAnalysis"
                  label="启用语音分析"
                  color="primary"
                  inset
                ></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 当前选择预览 -->
        <v-card class="preview-card mb-4" elevation="6">
          <v-card-title class="text-center">
            <v-icon start color="success">mdi-eye</v-icon>
            当前选择
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="4" class="text-center">
                <v-chip color="primary" size="large">
                  <v-icon start>mdi-sword-cross</v-icon>
                  {{ selectedBattleType || '未选择' }}
                </v-chip>
              </v-col>
              <v-col cols="4" class="text-center">
                <v-chip color="secondary" size="large">
                  <v-icon start>mdi-chart-line</v-icon>
                  {{ selectedDifficulty || '未选择' }}
                </v-chip>
              </v-col>
              <v-col cols="4" class="text-center">
                <v-chip color="info" size="large">
                  <v-icon start>mdi-clock</v-icon>
                  {{ sessionDuration }}分钟
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 操作按钮 -->
        <v-card class="action-card" elevation="8">
          <v-card-text class="text-center pa-6">
            <v-btn
              :disabled="!canStartBattle"
              :loading="isMatching"
              color="primary"
              size="x-large"
              class="mr-4"
              @click="handleStartMatching"
            >
              <v-icon start size="large">mdi-play</v-icon>
              {{ isMatching ? '匹配中...' : '开始匹配' }}
            </v-btn>
            
            <v-btn
              color="grey"
              size="large"
              variant="outlined"
              @click="handleBackToHome"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              返回首页
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- 匹配状态 -->
        <v-card v-if="isMatching" class="matching-status-card mt-4" elevation="6">
          <v-card-text class="text-center">
            <v-progress-circular
              indeterminate
              color="primary"
              size="60"
              class="mb-3"
            ></v-progress-circular>
            <div class="text-h6 mb-2">{{ matchingStatus }}</div>
            <div class="text-body-2 text-grey-6">{{ matchingTip }}</div>
            
            <v-btn
              color="error"
              variant="text"
              @click="handleCancelMatching"
              class="mt-3"
            >
              <v-icon start>mdi-close</v-icon>
              取消匹配
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { connectWebSocketApi } from '../api/versusAPI'
import type { ConnectRequest } from '../interface/versus'

const router = useRouter()

// 选择状态
const selectedBattleType = ref<'AI辅助' | '真人对战' | ''>('')
const selectedDifficulty = ref<'初级' | '中级' | '高级' | '四级' | '六级' | ''>('')
const sessionDuration = ref(5)
const enableVoiceAnalysis = ref(true)

// 匹配状态
const isMatching = ref(false)
const matchingStatus = ref('')
const matchingTip = ref('')

// WebSocket相关状态
const userId = ref<string>(`user_${Math.random().toString(36).substr(2, 9)}`)
const sessionId = ref<string>('')
const ws = ref<WebSocket | null>(null)
const isWebSocketConnected = ref(false)

// 选项配置
const durationOptions = [
  { title: '3分钟', value: 3 },
  { title: '5分钟', value: 5 },
  { title: '10分钟', value: 10 },
  { title: '15分钟', value: 15 }
]

// 匹配状态文本
const matchingSteps = [
  { status: '正在准备AI对话环境...', tip: '智能助手正在初始化' },
  { status: '加载AI语言模型...', tip: '确保最佳的对话体验' },
  { status: '准备对话主题...', tip: '根据您的难度等级选择合适的话题' },
  { status: '即将开始AI对战...', tip: '3秒后进入对战界面' }
]

// 真人对战的匹配状态
const realBattleSteps = [
  { status: '正在寻找对手...', tip: '根据您的难度等级匹配合适的对手' },
  { status: '检测网络质量...', tip: '确保最佳的对战体验' },
  { status: '准备对战房间...', tip: '正在初始化对战环境' },
  { status: '即将开始对战...', tip: '3秒后进入对战界面' }
]

let matchingTimer: number | null = null
let matchingStepIndex = 0

// 计算属性
const canStartBattle = computed(() => {
  return selectedBattleType.value && selectedDifficulty.value && !isMatching.value
})

// 选择对战类型
const selectBattleType = (type: 'AI辅助' | '真人对战') => {
  selectedBattleType.value = type
}

// 选择难度等级
const selectDifficulty = (difficulty: '初级' | '中级' | '高级' | '四级' | '六级') => {
  selectedDifficulty.value = difficulty
}

// 开始匹配
const handleStartMatching = async () => {
  isMatching.value = true
  matchingStepIndex = 0
  
  try {
    // AI智能对战模式：跳过WebSocket连接，直接进入对战
    if (selectedBattleType.value === 'AI辅助') {
      console.log('AI智能对战模式：跳过WebSocket连接，直接开始匹配流程')
      // 直接开始匹配流程，无需WebSocket连接
      startMatchingProcess()
    } else {
      // 真人对战模式：建立WebSocket连接并获取sessionId
      console.log('真人对战模式：建立WebSocket连接')
      await connectWebSocket()
      
      // 开始匹配流程
      startMatchingProcess()
    }
  } catch (error) {
    console.error('匹配启动失败:', error)
    isMatching.value = false
    if (selectedBattleType.value === '真人对战') {
      alert('连接失败，请检查网络后重试')
    } else {
      alert('启动AI对战失败，请重试')
    }
  }
}

// 建立WebSocket连接
const connectWebSocket = async () => {
  try {
    // 调用API获取sessionId
    const request: ConnectRequest = {
      userId: userId.value
    }
    const data = await connectWebSocketApi(request)
    sessionId.value = data.sessionId
    
    // 建立WebSocket连接
    const wsUrl = `ws://115.175.45.173:8080/api/speech/ws`
    ws.value = new WebSocket(wsUrl)
    
    return new Promise<void>((resolve, reject) => {
      if (!ws.value) {
        reject(new Error('WebSocket创建失败'))
        return
      }
      
      ws.value.onopen = () => {
        // 连接成功后发送注册消息
        ws.value?.send(JSON.stringify({
          type: 'register',
          userId: userId.value,
          sessionId: sessionId.value
        }))
        isWebSocketConnected.value = true
        console.log('WebSocket连接成功，sessionId:', sessionId.value)
        resolve()
      }
      
      ws.value.onerror = (error) => {
        console.error('WebSocket连接错误:', error)
        isWebSocketConnected.value = false
        reject(new Error('WebSocket连接失败'))
      }
      
      ws.value.onclose = () => {
        console.log('WebSocket连接关闭')
        isWebSocketConnected.value = false
      }
      
      ws.value.onmessage = (event) => {
        // 在匹配阶段可能收到的消息处理
        console.log('收到WebSocket消息:', event.data)
      }
    })
  } catch (error) {
    console.error('获取sessionId失败:', error)
    throw error
  }
}

// 匹配流程
const startMatchingProcess = () => {
  // 根据对战类型选择不同的匹配步骤
  const steps = selectedBattleType.value === 'AI辅助' ? matchingSteps : realBattleSteps
  
  if (matchingStepIndex < steps.length) {
    const step = steps[matchingStepIndex]
    matchingStatus.value = step.status
    matchingTip.value = step.tip
    
    matchingTimer = setTimeout(() => {
      matchingStepIndex++
      if (matchingStepIndex < steps.length) {
        startMatchingProcess()
      } else {
        // 匹配完成，跳转到对战界面
        enterBattle()
      }
    }, 1500) as unknown as number
  }
}

// 进入对战
const enterBattle = async () => {
  try {
    // 构建查询参数
    const query: Record<string, string> = {
      battleType: selectedBattleType.value,
      difficulty: selectedDifficulty.value,
      duration: sessionDuration.value.toString(),
      voiceAnalysis: enableVoiceAnalysis.value.toString()
    }
    
    // 只有真人对战模式才添加WebSocket连接信息
    if (selectedBattleType.value === '真人对战' && sessionId.value && userId.value) {
      query.sessionId = sessionId.value
      query.userId = userId.value
      
      // 将WebSocket连接存储到全局状态，供对战界面使用
      if (ws.value && isWebSocketConnected.value) {
        sessionStorage.setItem('websocket-info', JSON.stringify({
          sessionId: sessionId.value,
          userId: userId.value,
          isConnected: isWebSocketConnected.value
        }))
      }
    } else if (selectedBattleType.value === 'AI辅助') {
      // AI模式：生成临时用户ID，但不需要sessionId
      query.userId = userId.value
      console.log('AI智能对战模式：不添加WebSocket连接信息，直接进入对战')
    }
    
    console.log('准备跳转到对战界面，参数:', query)
    
    await router.push({
      path: '/versus',
      query
    })
  } catch (error) {
    console.error('进入对战失败:', error)
    isMatching.value = false
  }
}

// 取消匹配
const handleCancelMatching = () => {
  if (matchingTimer) {
    clearTimeout(matchingTimer)
    matchingTimer = null
  }
  isMatching.value = false
  matchingStatus.value = ''
  matchingTip.value = ''
  matchingStepIndex = 0
}

// 返回首页
const handleBackToHome = () => {
  router.push('/home')
}

// 组件挂载
onMounted(() => {
  // 设置默认选择
  selectedBattleType.value = 'AI辅助'
  selectedDifficulty.value = '中级'
})

// 组件卸载
onBeforeUnmount(() => {
  if (matchingTimer) {
    clearTimeout(matchingTimer)
  }
  // 清理WebSocket连接
  if (ws.value) {
    ws.value.close()
  }
})
</script>

<style scoped>
.matching-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.main-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.selection-card,
.settings-card,
.preview-card,
.action-card,
.matching-status-card {
  border-radius: 15px !important;
  transition: transform 0.2s ease-in-out;
}

.selection-card:hover,
.settings-card:hover {
  transform: translateY(-2px);
}

.battle-type-card,
.difficulty-card {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.battle-type-card:hover,
.difficulty-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.battle-type-card.selected,
.difficulty-card.selected {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}

.cet-card {
  background: linear-gradient(135deg, #fff8e1 0%, #f3e5f5 100%);
  border: 2px solid #ffc107;
}

.cet-card.selected {
  border-color: #1976d2;
  background: linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3) !important;
}

.preview-card {
  background: linear-gradient(135deg, #fff3e0 0%, #f1f8e9 100%);
}

.action-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.matching-status-card {
  background: linear-gradient(135deg, #e8f5e8 0%, #f3e5f5 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

/* 响应式设计 */
@media (max-width: 600px) {
  .battle-type-card,
  .difficulty-card {
    margin-bottom: 1rem;
  }
  
  .preview-card .v-chip {
    margin: 0.25rem 0;
  }
}

/* 动画效果 */
.main-card {
  animation: fadeInDown 0.8s ease-out;
}

.selection-card {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.settings-card {
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.preview-card {
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.action-card {
  animation: fadeInUp 0.8s ease-out 0.8s both;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>