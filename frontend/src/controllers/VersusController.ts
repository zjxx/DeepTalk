// src/controllers/VersusController.ts
import { VersusModel } from '../models/VersusModel'
import { AudioService } from '../services/AudioService'
import { TimerService } from '../services/TimerService'
import { AIService } from '../services/AIService'

export class VersusController {
  private model: VersusModel
  private audioService: AudioService
  private timerService: TimerService
  private aiService: AIService
  
  // 回调函数，用于通知 View 层状态变化
  private onStateChange?: () => void

  constructor() {
    this.model = new VersusModel()
    this.audioService = new AudioService()
    this.timerService = new TimerService()
    this.aiService = new AIService()
    
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // 音频服务事件监听
    this.audioService.onRecordingStateChange = (isRecording, audioLevel) => {
      this.model.updateMatchState({ 
        isRecording, 
        audioLevel,
        isUserSpeaking: isRecording 
      })
      this.notifyStateChange()
    }

    this.audioService.onRecordingComplete = (audioBlob) => {
      this.model.updateMatchState({ lastRecordedAudio: audioBlob })
      this.sendAudioForTranscription(audioBlob)
      this.notifyStateChange()
    }

    this.audioService.onPlaybackStateChange = (isPlaying) => {
      this.model.updateMatchState({ isPlayingAudio: isPlaying })
      this.notifyStateChange()
    }    // 计时器事件监听
    this.timerService.onMainTimerTick = (timeLeft) => {
      this.model.updateMatchState({ remainingTime: timeLeft })
      if (timeLeft <= 0) {
        this.endMatch()
      }
      this.notifyStateChange()
    }

    // AI 服务事件监听
    this.aiService.onSpeakingStateChange = (isSpeaking) => {
      this.model.updateMatchState({ isPartnerSpeaking: isSpeaking })
      this.notifyStateChange()
    }

    this.aiService.onResponseGenerated = (response) => {
      this.model.addTranscriptMessage({ isUser: false, text: response })
      this.notifyStateChange()
    }
  }

  // 设置状态变化回调
  setStateChangeCallback(callback: () => void): void {
    this.onStateChange = callback
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange()
    }
  }

  // 获取当前状态
  getState() {
    return this.model.getState()
  }

  // 计算属性的 getter 方法
  get canUserSpeak(): boolean {
    return this.model.canUserSpeak
  }

  get currentTopic(): string {
    return this.model.currentTopic
  }

  get currentPrompt(): string {
    return this.model.currentPrompt
  }  // 重要：录音功能实现
  async toggleRecording(): Promise<void> {
    const state = this.model.getState()
    
    if (state.isRecording) {
      // 停止录音并结束发言
      this.audioService.stopRecording()
      this.endUserSpeaking()
    } else {
      // 用户可以随时开始录音，无需检查发言权
      if (state.isPlayingAudio) {
        this.audioService.stopPlayback()
      }
      
      await this.audioService.startRecording()
      this.model.updateMatchState({ userMuted: false })
    }
    
    this.notifyStateChange()
  }
  // 业务逻辑方法
  async startMatch(): Promise<void> {
    this.model.updateMatchState({ 
      matchStarted: true,
      speakingTurn: 'user'
    })
    
    this.timerService.startMainTimer(this.model.getState().remainingTime)
    
    this.notifyStateChange()
    console.log('对战开始，用户可随时发言')
  }
  endMatch(): void {
    const state = this.model.getState()
    if (state.matchStarted) {
      this.timerService.stopAllTimers()
      this.audioService.stopRecording()
      this.audioService.stopPlayback()
      this.aiService.stopSpeaking()
      
      this.model.resetMatch()
      this.notifyStateChange()
    }
  }

  private endUserSpeaking(): void {
    const state = this.model.getState()
    if (state.speakingTurn === 'user') {
      this.model.updateMatchState({ 
        isUserSpeaking: false,
        userMuted: true 
      })
      
      setTimeout(() => {
        this.switchSpeakingTurn()
      }, 300)
    }
  }
  private switchSpeakingTurn(): void {
    const state = this.model.getState()
    
    this.aiService.stopSpeaking()
    
    if (state.isRecording && state.speakingTurn === 'user') {
      this.audioService.stopRecording()
    }
    
    this.model.updateMatchState({
      isUserSpeaking: false,
      isPartnerSpeaking: false
    })
    
    this.model.switchSpeakingTurn()
    
    const newState = this.model.getState()
    if (newState.speakingTurn === 'partner' && newState.matchType === 'AI辅助') {
      this.aiService.startSpeaking()
    }
    
    this.notifyStateChange()
    console.log(`发言权切换到: ${newState.speakingTurn}`)
  }

  skipPartnerTurn(): void {
    const state = this.model.getState()
    if (state.speakingTurn === 'partner') {
      console.log('跳过对方发言，切换回用户')
      this.aiService.stopSpeaking()
      this.model.updateMatchState({ isPartnerSpeaking: false })
      this.switchSpeakingTurn()
    }
  }

  togglePlayback(): void {
    const state = this.model.getState()
    if (state.isPlayingAudio) {
      this.audioService.stopPlayback()
    } else if (state.lastRecordedAudio) {
      this.audioService.playAudio(state.lastRecordedAudio)
    }
  }

  deleteRecording(): void {
    if (confirm('确定要删除上次录音吗？')) {
      this.audioService.stopPlayback()
      this.model.updateMatchState({ lastRecordedAudio: null })
      this.notifyStateChange()
      console.log('录音已删除')
    }
  }

  nextTopic(): void {
    this.model.nextTopic()
    this.notifyStateChange()
  }

  changeMatchType(matchType: '真人对战' | 'AI辅助'): void {
    this.model.updateMatchState({ matchType })
    this.model.clearTranscriptMessages()
    this.model.updateMatchState({
      isPartnerSpeaking: false,
      isUserSpeaking: false
    })
    this.notifyStateChange()
  }

  changeDifficultyLevel(difficultyLevel: '初级' | '中级' | '高级'): void {
    this.model.updateMatchState({ difficultyLevel })
    this.notifyStateChange()
  }

  updateCanvasSize(width: number, height: number): void {
    this.model.updateCanvasSize(width, height)
    this.notifyStateChange()
  }

  private async sendAudioForTranscription(audioBlob: Blob): Promise<void> {
    try {
      console.log('发送音频到语音识别服务...', audioBlob)
      
      // 模拟语音识别
      setTimeout(() => {
        const simulatedText = "这是模拟的语音识别结果"
        this.model.addTranscriptMessage({
          isUser: true,
          text: simulatedText
        })
        this.notifyStateChange()
      }, 1000)
      
    } catch (error) {
      console.error('语音识别失败:', error)
    }
  }

  // 清理资源
  destroy(): void {
    this.timerService.stopAllTimers()
    this.audioService.cleanup()
    this.aiService.cleanup()
  }

  // 格式化时间的工具方法
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}