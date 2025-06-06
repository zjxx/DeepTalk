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
              :disabled="state.matchStarted"
              class="back-to-matching-btn"
            >
              返回匹配
            </v-btn>
            
            <div class="text-h5 mb-2">口语对战 - {{ displayBattleType }}</div>
            <div class="text-body-1 mb-1">
              难度：<span class="font-weight-bold">{{ displayDifficulty }}</span>
              <v-divider vertical class="mx-2" />
              时长：<span class="font-weight-bold">{{ displayDuration }}分钟</span>
              <v-divider vertical class="mx-2" />
              语音分析：<span class="font-weight-bold">{{ displayVoiceAnalysis }}</span>
            </div>
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
              <v-chip v-if="!state.matchStarted" color="grey">
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
          <!-- 用户模型（始终显示） -->
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
          
          <!-- 对方：真人对战时显示Live2D模型 -->
          <Live2DModel 
            v-if="pixiAppInstance && displayBattleType === '真人对战'"
            ref="partnerModelRef"
            :app="pixiAppInstance as PIXI.Application"
            type="partner"
            modelPath="/live2d/Mahiro_GG/Mahiro_V1.model3.json" 
            :initialX="state.canvasWidth * 0.6" 
            :initialY="state.canvasHeight * 0.15"
            :scale="0.1"
          />
          
          <!-- 对方：AI对战时显示AI头像 -->
          <div 
            v-if="displayBattleType === 'AI辅助'" 
            class="ai-avatar"
            :style="{
              left: `${state.canvasWidth * 0.75}px`,
              top: `${state.canvasHeight * 0.65}px`
            }"
          >
            <v-avatar size="200" color="primary">
              <v-icon size="90" color="white">mdi-robot</v-icon>
            </v-avatar>
            <div class="ai-status-indicator" :class="{ 'speaking': state.isPartnerSpeaking }">
              <v-chip 
                :color="state.isPartnerSpeaking ? 'success' : 'grey'" 
                size="small"
                class="mt-2"
              >
                {{ state.isPartnerSpeaking ? 'AI思考中...' : 'AI待命' }}
              </v-chip>
            </div>
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
              :color="state.isPartnerSpeaking ? 'success' : (state.speakingTurn === 'partner' ? 'warning' : 'grey')" 
              class="mr-2"
            >
              {{ 
                state.isPartnerSpeaking ? 
                  (displayBattleType === 'AI辅助' ? 'AI正在回应' : '对方正在发言') : 
                  (state.speakingTurn === 'partner' ? 
                    (displayBattleType === 'AI辅助' ? 'AI正在思考' : '对方正在思考') : 
                    '等待轮换')
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
              
              <v-chip v-if="voiceAnalysisEnabled" color="success" size="large">
                <v-icon start>mdi-microphone</v-icon>
                语音分析
              </v-chip>
            </div>

            <v-btn color="error" prepend-icon="mdi-exit-to-app" @click="handleEndMatch" class="my-2">
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
                <strong>{{ 
                  message.isUser ? '您' : 
                  (displayBattleType === '真人对战' ? '对方用户' : 'AI助手') 
                }}:</strong>
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
import { useRouter, useRoute } from 'vue-router'
import Live2DModel from '../components/Live2DModel.vue'
import * as PIXI from 'pixi.js'
import { VersusController } from '../controllers/VersusController'

// 解决 import.meta.env 类型报错

// 类型定义
type Live2DModelComponent = InstanceType<typeof Live2DModel>

const router = useRouter()
const route = useRoute()
const isDev = true // 或者根据您的需要设置

// PIXI App refs and state
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const userModelRef = ref<Live2DModelComponent | null>(null)
const partnerModelRef = ref<Live2DModelComponent | null>(null)
let resizeObserver: ResizeObserver | null = null

// 创建控制器实例
const controller = new VersusController()
const state = reactive(controller.getState())
const isLoadingPlayback = ref(false)

// 匹配参数状态
const matchingParams = ref({
  battleType: '',
  difficulty: '',
  duration: 5,
  voiceAnalysis: false
})

// 匹配参数展示
const displayBattleType = computed(() => route.query.battleType || state.matchType || 'AI辅助')
const displayDifficulty = computed(() => route.query.difficulty || state.difficultyLevel || '中级')
const displayDuration = computed(() => route.query.duration || Math.floor((state.remainingTime || 300) / 60))
const displayVoiceAnalysis = computed(() => route.query.voiceAnalysis === 'true' ? '已启用' : '未启用')

// 计算属性
const voiceAnalysisEnabled = computed(() => {
  return matchingParams.value.voiceAnalysis
})

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
const handleEndMatch = async () => {
  if (state.matchStarted) {
    if (confirm('确定要结束当前对战吗？')) {
      try {
        // 先停止所有可能的DOM操作
        if (userModelRef.value) {
          userModelRef.value.destroy?.()
        }
        if (partnerModelRef.value) {
          partnerModelRef.value.destroy?.()
        }
        
        // 然后结束对战并清理状态
        controller.endMatch()
        
        // 清理PIXI应用
        if (pixiAppInstance.value) {
          pixiAppInstance.value.stop()
        }
        
        // 仿照登录界面的逻辑，添加延迟确保清理完成
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 延迟后跳转到评分界面
        console.log('状态清理完成，准备跳转到评分界面')
        await router.push('/evaluation')
      } catch (error) {
        console.error('结束对战时出错:', error)
        // 即使出错也延迟跳转
        await new Promise(resolve => setTimeout(resolve, 300))
        await router.push('/evaluation')
      }
    }
  } else {
    // 如果没有进行对战，则跳转到首页
    await router.push('/home')
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

const handleBackToMatching = async () => {
  if (state.matchStarted) {
    if (confirm('当前对战正在进行中，确定要返回匹配界面吗？这将结束当前对战。')) {
      try {
        // 清理当前对战状态
        controller.endMatch()
        
        // 清理PIXI应用
        if (pixiAppInstance.value) {
          pixiAppInstance.value.stop()
        }
        
        // 延迟后跳转
        await new Promise(resolve => setTimeout(resolve, 300))
        await router.push('/matching')
      } catch (error) {
        console.error('返回匹配界面时出错:', error)
        await router.push('/matching')
      }
    }
  } else {
    // 如果没有开始对战，直接返回匹配界面
    await router.push('/matching')
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

// 设置状态变化回调
controller.setStateChangeCallback(() => {
  // 更新响应式状态
  Object.assign(state, controller.getState())
})

// PIXI App 初始化
onMounted(async () => {
  console.log('Versus页面已挂载')
  
  // 应用匹配参数
  if (route.query.battleType) {
    controller.changeMatchType(route.query.battleType as '真人对战' | 'AI辅助')
  }
  if (route.query.difficulty) {
    // 四级/六级映射
    let mapped = route.query.difficulty
    if (mapped === '四级') mapped = '中级'
    if (mapped === '六级') mapped = '高级'
    controller.changeDifficultyLevel(mapped as '初级' | '中级' | '高级')
  }
  if (route.query.duration) {
    state.remainingTime = parseInt(route.query.duration as string) * 60
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
  
  console.log('versus组件资源清理完成')
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

/* AI头像样式 */
.ai-avatar {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.ai-avatar .v-avatar {
  border: 3px solid #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  animation: ai-idle 3s ease-in-out infinite;
}

.ai-status-indicator {
  margin-top: 8px;
  transition: all 0.3s ease;
}

.ai-status-indicator.speaking {
  animation: ai-speaking 1s ease-in-out infinite alternate;
}

/* AI动画效果 */
@keyframes ai-idle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes ai-speaking {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.05);
    opacity: 0.8;
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
</style>