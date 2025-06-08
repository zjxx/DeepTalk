<template>
  <v-container fluid class="evaluation-container" :key="routeKey">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" md="8" lg="6">
        <!-- 加载阶段 -->
        <v-card v-if="isLoading" class="loading-card text-center pa-8">
          <v-card-title class="text-h4 mb-6">
            <v-icon start size="large" color="primary">mdi-calculator-variant</v-icon>
            正在评估您的口语表现
          </v-card-title>
          
          <div class="progress-container mb-6">
            <v-progress-circular
              :model-value="progress"
              :size="120"
              :width="12"
              color="primary"
              class="main-progress"
            >
              <div class="progress-text">
                <div class="text-h6">{{ Math.round(progress) }}%</div>
                <div class="text-caption">{{ currentLoadingText }}</div>
              </div>
            </v-progress-circular>
          </div>
          
          <v-chip color="info" class="mb-2">
            <v-icon start>mdi-clock</v-icon>
            预计还需 {{ Math.ceil((100 - progress) / 20) }} 秒
          </v-chip>
          
          <div class="loading-steps mt-4">
            <v-stepper-horizontal :model-value="currentStep">
              <v-stepper-horizontal-item 
                title="语音识别" 
                :complete="currentStep > 1"
                :value="1"
              ></v-stepper-horizontal-item>
              <v-stepper-horizontal-item 
                title="语言分析" 
                :complete="currentStep > 2"
                :value="2"
              ></v-stepper-horizontal-item>
              <v-stepper-horizontal-item 
                title="评分计算" 
                :complete="currentStep > 3"
                :value="3"
              ></v-stepper-horizontal-item>
              <v-stepper-horizontal-item 
                title="生成报告" 
                :complete="currentStep > 4"
                :value="4"
              ></v-stepper-horizontal-item>
            </v-stepper-horizontal>
          </div>
        </v-card>

        <!-- 评分结果阶段 -->
        <div v-else>
          <!-- 总体评分卡片 -->
          <v-card class="score-card mb-4" elevation="8">
            <v-card-title class="text-center bg-primary text-white pa-6">
              <div class="text-h4">
                <v-icon start size="large">mdi-trophy</v-icon>
                口语评估结果
              </div>
              <div class="text-subtitle-1 mt-2">{{ getDifficultyLabel() }} · {{ getSessionDuration() }}</div>
            </v-card-title>
            
            <v-card-text class="pa-6">
              <div class="text-center mb-6">
                <div class="overall-score-container">
                  <v-progress-circular
                    :model-value="(mockScoreData.overallScore / 100) * 100"
                    :size="150"
                    :width="15"
                    :color="getScoreColor(mockScoreData.overallScore)"
                    class="score-circle"
                  >
                    <div class="score-display">
                      <div class="text-h3 font-weight-bold">{{ mockScoreData.overallScore }}</div>
                      <div class="text-body-2">总分</div>
                    </div>
                  </v-progress-circular>
                </div>
                <v-chip 
                  :color="getScoreColor(mockScoreData.overallScore)" 
                  size="large" 
                  class="mt-4"
                >
                  {{ getScoreLevel(mockScoreData.overallScore) }}
                </v-chip>
              </div>

              <!-- 详细评分 -->
              <v-row class="score-details">
                <v-col cols="6" sm="3">
                  <div class="score-item text-center">
                    <v-icon size="40" color="blue" class="mb-2">mdi-account-voice</v-icon>
                    <div class="text-h6">{{ mockScoreData.pronunciation }}</div>
                    <div class="text-caption">发音准确度</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="score-item text-center">
                    <v-icon size="40" color="green" class="mb-2">mdi-speedometer</v-icon>
                    <div class="text-h6">{{ mockScoreData.fluency }}</div>
                    <div class="text-caption">流畅度</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="score-item text-center">
                    <v-icon size="40" color="orange" class="mb-2">mdi-book-open-variant</v-icon>
                    <div class="text-h6">{{ mockScoreData.vocabulary }}</div>
                    <div class="text-caption">词汇丰富度</div>
                  </div>
                </v-col>
                <v-col cols="6" sm="3">
                  <div class="score-item text-center">
                    <v-icon size="40" color="purple" class="mb-2">mdi-format-list-bulleted</v-icon>
                    <div class="text-h6">{{ mockScoreData.grammar }}</div>
                    <div class="text-caption">语法准确性</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 详细分析 -->
          <v-card class="analysis-card mb-4">
            <v-card-title>
              <v-icon start>mdi-chart-line</v-icon>
              详细分析报告
            </v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel title="优势表现">
                  <v-expansion-panel-text>
                    <v-list>
                      <v-list-item v-for="strength in mockScoreData.strengths" :key="strength">
                        <template v-slot:prepend>
                          <v-icon color="success">mdi-check-circle</v-icon>
                        </template>
                        <v-list-item-title>{{ strength }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                
                <v-expansion-panel title="改进建议">
                  <v-expansion-panel-text>
                    <v-list>
                      <v-list-item v-for="improvement in mockScoreData.improvements" :key="improvement">
                        <template v-slot:prepend>
                          <v-icon color="warning">mdi-lightbulb</v-icon>
                        </template>
                        <v-list-item-title>{{ improvement }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>          <!-- 操作按钮 -->
          <v-card class="action-card">
            <v-card-text class="text-center">
              <v-btn-group class="mb-3">
                <v-btn 
                  color="primary" 
                  prepend-icon="mdi-replay"
                  size="large"
                  @click="handleRestart"
                >
                  再次练习
                </v-btn>
                <v-btn 
                  color="info" 
                  prepend-icon="mdi-microphone"
                  size="large"
                  @click="handleViewRecording"
                >
                  查看录音
                </v-btn>
                <v-btn 
                  color="success" 
                  prepend-icon="mdi-download"
                  size="large"
                  @click="handleDownloadReport"
                >
                  下载报告
                </v-btn>
                <v-btn 
                  color="secondary" 
                  prepend-icon="mdi-share"
                  size="large"
                  @click="handleShareResult"
                >
                  分享结果
                </v-btn>
              </v-btn-group>
              
              <div class="mt-4">
                <v-btn 
                  color="orange" 
                  variant="elevated"
                  prepend-icon="mdi-home"
                  size="x-large"
                  class="home-btn"
                  @click="handleGoHome"
                >
                  返回主页
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 路由缓存键，用于强制重新渲染
const routeKey = ref(Date.now())

// 加载状态
const isLoading = ref(true)
const progress = ref(0)
const currentStep = ref(1)

// 加载文本
const loadingTexts = [
  '正在分析语音质量...',
  '识别语言内容中...',
  '评估发音准确度...',
  '计算流畅度指标...',
  '分析词汇使用...',
  '生成评估报告...'
]

const currentLoadingText = computed(() => {
  const index = Math.floor(progress.value / 20)
  return loadingTexts[Math.min(index, loadingTexts.length - 1)]
})

// 虚假评分数据
const mockScoreData = ref({
  overallScore: 0,
  pronunciation: 0,
  fluency: 0,
  vocabulary: 0,
  grammar: 0,
  strengths: [] as string[],
  improvements: [] as string[]
})

// 定时器
let progressInterval: ReturnType<typeof setInterval> | null = null

// 生成随机评分数据
const generateMockScore = () => {
  mockScoreData.value = {
    overallScore: Math.floor(Math.random() * 30) + 70, // 70-100分
    pronunciation: Math.floor(Math.random() * 30) + 70,
    fluency: Math.floor(Math.random() * 30) + 65,
    vocabulary: Math.floor(Math.random() * 35) + 65,
    grammar: Math.floor(Math.random() * 25) + 75,
    strengths: [
      '发音清晰，语调自然',
      '语速适中，表达流畅',
      '词汇使用准确恰当',
      '语法结构基本正确'
    ],
    improvements: [
      '可以尝试使用更多高级词汇',
      '注意语音的重音和节奏',
      '可以增加一些连接词使表达更连贯',
      '尝试使用更复杂的句型结构'
    ]
  }
}

// 获取分数颜色
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'info'
  if (score >= 70) return 'warning'
  return 'error'
}

// 获取分数等级
const getScoreLevel = (score: number): string => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '及格'
  if (score >= 60) return '需要改进'
  return '需要加强'
}

// 获取难度标签
const getDifficultyLabel = (): string => {
  // 可以从路由参数或状态管理中获取
  return '中级'
}

// 获取会话时长
const getSessionDuration = (): string => {
  // 可以从实际数据中获取
  return '5分钟'
}

// 事件处理
const handleRestart = () => {
  router.push('/versus')
}

const handleViewRecording = () => {
  // 回到对战界面查看录音回放
  router.push('/versus')
}

const handleDownloadReport = () => {
  // 生成并下载PDF报告
  const reportData = JSON.stringify(mockScoreData.value, null, 2)
  const blob = new Blob([reportData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `口语评估报告_${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleShareResult = () => {
  // 分享功能
  if (navigator.share) {
    navigator.share({
      title: '我的口语评估结果',
      text: `我在DeepTalk口语练习中获得了${mockScoreData.value.overallScore}分！`,
      url: window.location.href
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(`我在DeepTalk口语练习中获得了${mockScoreData.value.overallScore}分！`)
    alert('结果已复制到剪贴板')
  }
}

const handleGoHome = () => {
  router.push('/home')
}

// 组件挂载
onMounted(async () => {
  console.log('评分界面已挂载')
  
  // 更新路由键值以强制重新渲染
  routeKey.value = Date.now()
  
  // 仿照登录界面逻辑，简化初始化延迟
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // 重置所有状态
  isLoading.value = true
  progress.value = 0
  currentStep.value = 1
  
  generateMockScore()
  
  // 清理可能存在的定时器
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  
  progressInterval = setInterval(() => {
    if (progress.value >= 100) {
      clearInterval(progressInterval!)
      progressInterval = null
      setTimeout(() => {
        isLoading.value = false
        console.log('加载完成，显示评分结果')
      }, 500)
      return
    }
    
    progress.value += 20 // 每秒增加20%，总共5秒
    currentStep.value = Math.min(Math.floor(progress.value / 25) + 1, 4)
  }, 1000)
})

// 组件卸载
onBeforeUnmount(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
.evaluation-container {
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
}

.loading-card {
  backdrop-filter: blur(10px);
  background: #ffffff !important;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.progress-container {
  position: relative;
  display: inline-block;
}

.main-progress {
  margin: 2rem;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loading-steps {
  max-width: 500px;
  margin: 0 auto;
}

.score-card {
  border-radius: 20px;
  overflow: hidden;
}

.overall-score-container {
  display: inline-block;
  position: relative;
}

.score-circle {
  margin: 1rem;
}

.score-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-details {
  margin-top: 2rem;
}

.score-item {
  padding: 1rem;
  border-radius: 12px;
  background: #f8f9fa;
  height: 100%;
  transition: transform 0.2s;
}

.score-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.analysis-card,
.action-card {
  border-radius: 15px;
}

.v-stepper-horizontal {
  box-shadow: none;
  background: transparent;
}

.v-btn-group {
  gap: 12px;
}

.v-btn-group .v-btn {
  border-radius: 25px;
}

.home-btn {
  border-radius: 30px !important;
  padding: 0 2rem !important;
  min-width: 200px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3) !important;
  transition: all 0.3s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4) !important;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .score-details .v-col {
    margin-bottom: 1rem;
  }
  
  .v-btn-group {
    flex-direction: column;
    width: 100%;
  }
  
  .v-btn-group .v-btn {
    width: 100%;
    margin: 0.25rem 0;
  }
}

/* 动画效果 */
.score-card {
  animation: fadeInUp 0.8s ease-out;
}

.analysis-card {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.action-card {
  animation: fadeInUp 0.8s ease-out 0.4s both;
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