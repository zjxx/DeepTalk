// src/controllers/VersusController.ts
import { VersusModel, type TranscriptMessage } from '../models/VersusModel'
import { AudioService } from '../services/AudioService'
import { TimerService } from '../services/TimerService'
import { AIService } from '../services/AIService'
import { QuestionManager } from '../utils/QuestionManager'
import { WebSocketService } from '../services/WebSocketService'

export class VersusController {
  private model: VersusModel
  private audioService: AudioService
  private timerService: TimerService
  private aiService: AIService
  private questionManager: QuestionManager
  private webSocketService: WebSocketService
  
  // AI对话模拟相关
  private aiResponseIndex: number = 0
  private readonly maxAiResponses: number = 6
  private aiAudioElement: HTMLAudioElement | null = null
  
  // 回调函数，用于通知 View 层状态变化
  private onStateChange?: () => void

  constructor() {
    this.model = new VersusModel()
    this.audioService = new AudioService()
    this.timerService = new TimerService()
    this.aiService = new AIService()
    this.questionManager = new QuestionManager()
    this.webSocketService = new WebSocketService('ws://115.175.45.173:8765')
    
    this.setupEventListeners()
    
    // 自动启动对战状态和计时
    this.autoStartMatch()
  }

  // 自动启动对战方法
  private async autoStartMatch(): Promise<void> {
    try {
      console.log('VersusController: 自动启动对战')
      
      // 立即启动对战状态
      this.model.updateMatchState({ 
        matchStarted: true,
        speakingTurn: 'user'
      })
      
      // 不在这里启动计时器，等待versus.vue调用startSyncedTimer启动计时器
      console.log('VersusController: 等待外部调用startSyncedTimer启动计时器...')
      
      // 根据对战模式加载不同的题目
      const currentMatchType = this.model.getState().matchType
      if (currentMatchType === 'AI辅助') {
        // AI模式：使用固定的英语对话主题
        this.setAIModeTopic()
      } else {
        // 真人对战模式：使用固定主题
        this.setHumanBattleTopic()
      }
      
      this.notifyStateChange()
      console.log('VersusController: 自动对战初始化完成，matchStarted =', this.model.getState().matchStarted)
      console.log('自动加载题目:', this.currentTopic)
      console.log('当前使用的是服务器主题:', this.questionManager.isUsingServerTopic())
      console.log('题目管理器当前主题:', this.questionManager.getCurrentTopic())
    } catch (error) {
      console.error('自动启动对战失败:', error)
    }
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

      // AI智能对话模式：自动播放AI回应音频
      if (this.model.getState().matchType === 'AI辅助') {
        this.playNextAiResponse()
      }
      // 真人对战模式：通过WebSocket发送音频
      else if (this.webSocketService.getIsConnected() && this.model.getState().matchType === '真人对战') {
        console.log('真人对战模式，发送音频广播')
        this.webSocketService.sendAudio(audioBlob)
      }
      
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

    // WebSocket 服务事件监听
    this.webSocketService.on('voice', (data) => {
      // 避免播放自己发送的音频
      if (data.userId === this.webSocketService.userId) {
        return
      }
      
      console.log('接收到来自其他用户的语音数据，准备播放...', data)
      
      // Base64 转 Blob
      const audioBlob = this.base64ToBlob(data.audioData, data.format || 'audio/webm')
      
      // 调用音频服务播放
      this.audioService.playAudio(audioBlob)
    })
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
    // 优先使用题库中的题目
    const questionTopic = this.questionManager.getCurrentTopic()
    if (questionTopic) {
      return questionTopic
    }
    
    // 备用：使用VersusModel中的原有主题
    return this.model.currentTopic
  }

  get currentPrompt(): string {
    const state = this.model.getState()
    
    // 如果对话已经开始，优先使用题库中的提示
    if (state.matchStarted) {
      const questionPrompt = this.questionManager.getPromptByIndex(state.currentPromptIndex)
      if (questionPrompt) {
        return questionPrompt
      }
      
      // 备用：使用VersusModel中的原有提示
      return this.model.currentPrompt
    }
    
    // 如果对话还没开始，显示默认提示
    return '对战即将开始，计时已经启动！'
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
    try {
      console.log('VersusController: 开始启动对战')
      
      // 对战开始时连接 WebSocket
      if (!this.webSocketService.getIsConnected()) {
        await this.webSocketService.connect()
        console.log('WebSocket 连接已成功建立')
      }

      const state = this.model.getState()
      
      // 先请求麦克风权限
      await this.audioService.requestMicrophonePermission()
      
      // 权限获取成功后，启动对战状态
      this.model.updateMatchState({ 
        matchStarted: true,  // 只有在这里才设置为true
        speakingTurn: 'user'
      })
      
      // 加载题目
      await this.questionManager.loadQuestionByLevel(state.difficultyLevel)
      
      // 开始连续录音模式
      await this.audioService.startContinuousRecording()
      
      // 只有在录音开始后才启动计时器
      this.timerService.startMainTimer(this.model.getState().remainingTime)
      
      this.notifyStateChange()
      console.log('VersusController: 对战启动完成，matchStarted =', this.model.getState().matchStarted)
      console.log('对战开始，已加载新题目:', this.questionManager.getCurrentTopic())
    } catch (error) {
      console.error('开始对战失败:', error)
      // 如果权限被拒绝，重置状态
      this.model.updateMatchState({ 
        matchStarted: false
      })
      this.notifyStateChange()
      throw error
    }
  }
  endMatch(): { allRecordedAudios: Blob[], transcriptMessages: TranscriptMessage[] } {
    console.log('VersusController: 开始结束对战')
    const state = this.model.getState()
    if (state.matchStarted) {
      console.log('VersusController: 对战正在进行中，开始清理')
      
      // 结束对战时断开 WebSocket 连接
      this.webSocketService.disconnect()
      console.log('WebSocket 连接已断开')

      // 立即停止所有计时器和服务
      this.timerService.stopAllTimers()
      this.audioService.stopRecording()
      this.audioService.stopContinuousRecording()
      this.audioService.stopPlayback()
      this.aiService.stopSpeaking()
      
      // 获取所有录音和对话记录
      const allRecordedAudios = this.audioService.getAllRecordedAudios()
      const transcriptMessages = state.transcriptMessages
      
      console.log('VersusController: 获取录音数据', allRecordedAudios.length, '个片段')
      
      // 重置题库状态
      this.questionManager.reset()
      
      // 更新状态为对战结束，彻底清理所有状态
      this.model.updateMatchState({
        matchStarted: false,
        isRecording: false,
        isUserSpeaking: false,
        isPartnerSpeaking: false,
        isPlayingAudio: false,
        speakingTurn: 'user',
        remainingTime: 300,
        // 清理录音相关状态
        lastRecordedAudio: null,
        audioLevel: 0,
        userMuted: false,
        fullRecordingAvailable: false,
        playbackProgress: 0,
        currentPlaybackTime: 0,
        fullRecordingDuration: 0
      })
      
      // 立即通知状态变化
      this.notifyStateChange()
      
      console.log('VersusController: 对战结束完成')
      
      // 返回对战数据
      return { allRecordedAudios, transcriptMessages }
    }
    
    console.log('VersusController: 对战未进行，返回空数据')
    return { allRecordedAudios: [], transcriptMessages: [] }
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

  changeMatchType(matchType: '真人对战' | 'AI辅助'): void {
    this.model.updateMatchState({ matchType })
    this.model.clearTranscriptMessages()
    this.model.updateMatchState({
      isPartnerSpeaking: false,
      isUserSpeaking: false
    })
    
    // 根据对战模式设置不同的主题
    if (matchType === 'AI辅助') {
      console.log('切换到AI模式，设置AI专用主题')
      this.setAIModeTopic()
    } else {
      console.log('切换到真人对战模式，设置真人对战专用主题')
      this.setHumanBattleTopic()
    }
    
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
    
    // 清理AI音频播放
    if (this.aiAudioElement) {
      this.aiAudioElement.pause()
      this.aiAudioElement = null
    }
  }

  // 格式化时间的工具方法
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 获取所有录音记录
  getAllRecordedAudios(): Blob[] {
    return this.audioService.getAllRecordedAudios()
  }

  // 播放全程录音
  async playFullRecording(): Promise<void> {
    const allRecordedAudios = this.audioService.getAllRecordedAudios()
    if (allRecordedAudios.length > 0) {
      try {
        // 如果有多个录音片段，合并它们
        const fullRecording = allRecordedAudios.length === 1 ? 
          allRecordedAudios[0] : 
          await this.mergeAudioBlobs(allRecordedAudios)
        
        // 获取总时长
        const duration = await this.audioService.getAudioDuration(fullRecording)
        this.model.updateMatchState({ 
          fullRecordingAvailable: true,
          fullRecordingDuration: duration 
        })
        
        // 播放并更新进度，使用新的回调签名
        this.audioService.playFullRecordingWithProgress(fullRecording, (progress, currentTime, totalDuration) => {
          this.model.updateMatchState({ 
            playbackProgress: Math.max(0, Math.min(100, progress)), // 确保进度在0-100之间
            currentPlaybackTime: Math.max(0, currentTime), // 确保时间不为负数
            fullRecordingDuration: totalDuration || duration // 更新实际时长
          })
          this.notifyStateChange()
        })
        
        this.notifyStateChange()
      } catch (error) {
        console.error('播放全程录音失败:', error)
        // 重置状态
        this.model.updateMatchState({
          playbackProgress: 0,
          currentPlaybackTime: 0,
          isPlayingAudio: false
        })
        this.notifyStateChange()
        throw error
      }
    }
  }

  // 停止全程录音播放
  stopFullRecording(): void {
    this.audioService.stopPlayback()
    this.model.updateMatchState({ 
      playbackProgress: 0,
      currentPlaybackTime: 0 
    })
    this.notifyStateChange()
  }

  // 合并多个音频片段（简单的实现）
  private async mergeAudioBlobs(audioBlobs: Blob[]): Promise<Blob> {
    // 这里只是简单地合并，实际项目中可能需要更复杂的音频处理
    const mergedChunks: Blob[] = []
    
    for (const blob of audioBlobs) {
      mergedChunks.push(blob)
    }
    
    return new Blob(mergedChunks, { type: audioBlobs[0].type })
  }

  // 格式化播放时间
  formatPlaybackTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Base64 字符串转为 Blob 对象
  private base64ToBlob(base64: string, contentType: string = ''): Blob {
    try {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: contentType })
    } catch (error) {
      console.error('Base64 to Blob 转换失败:', error)
      // 返回一个空的 Blob 对象以避免后续代码出错
      return new Blob([], { type: contentType })
    }
  }

  // 更新剩余时间（用于时间同步）
  updateRemainingTime(timeInSeconds: number): void {
    this.model.updateMatchState({ remainingTime: timeInSeconds })
    this.notifyStateChange()
    console.log('更新剩余时间为:', timeInSeconds, '秒')
  }

  // 开始同步计时器（在时间同步后调用）
  startSyncedTimer(remainingTimeInSeconds: number): void {
    console.log('VersusController: 开始同步计时器，剩余时间:', remainingTimeInSeconds, '秒')
    
    // 更新剩余时间
    this.model.updateMatchState({ remainingTime: remainingTimeInSeconds })
    
    // 启动计时器
    this.timerService.startMainTimer(remainingTimeInSeconds)
    
    this.notifyStateChange()
    console.log('VersusController: 同步计时器已启动')
  }

  // 同步服务器分配的主题和提示
  syncServerTopic(topic: string, prompts: string[], difficulty: string): void {
    console.log('VersusController: 同步服务器主题:', {
      topic,
      prompts,
      difficulty
    })
    
    // 直接设置服务器分配的主题
    this.questionManager.setServerTopic(topic, prompts)
    
    // 可选：同步难度等级
    if (difficulty) {
      this.model.updateMatchState({ difficultyLevel: difficulty as '初级' | '中级' | '高级' })
    }
    
    this.notifyStateChange()
    console.log('VersusController: 服务器主题同步完成')
  }

  // 检查是否使用服务器主题
  isUsingServerTopic(): boolean {
    return this.questionManager.isUsingServerTopic()
  }

  // AI智能对话：播放下一个AI回应音频
  private playNextAiResponse(): void {
    if (this.aiResponseIndex >= this.maxAiResponses) {
      console.log('AI回应已达到最大次数，不再播放')
      return
    }

    // 计算当前应该播放的音频文件编号
    const audioIndex = (this.aiResponseIndex % this.maxAiResponses) + 1
    const audioPath = `/audios/${audioIndex}.mp3`
    
    // AI思考时间序列：3, 6, 5, 2, 2, 3 秒
    const thinkingTimes = [3, 6, 5, 2, 2, 3]
    const thinkingTime = thinkingTimes[this.aiResponseIndex % thinkingTimes.length] * 1000 // 转换为毫秒
    
    console.log(`AI开始思考，思考时间：${thinkingTime / 1000}秒，然后播放 ${audioIndex}.mp3`)
    
    // 设置AI正在思考状态（不是回应状态）
    this.model.updateMatchState({ 
      isPartnerThinking: true,
      isPartnerSpeaking: false  // 确保思考时不是回应状态
    })
    this.notifyStateChange()
    
    // 等待思考时间后再播放音频
    setTimeout(() => {
      this.playAiAudio(audioPath, audioIndex)
    }, thinkingTime)
  }

  // 播放AI音频的具体实现
  private playAiAudio(audioPath: string, audioIndex: number): void {
    console.log(`AI思考完成，开始播放音频 ${audioIndex}.mp3`)
    
    // 创建新的音频元素
    this.aiAudioElement = new Audio(audioPath)
    
    this.aiAudioElement.onloadstart = () => {
      console.log(`开始加载AI音频 ${audioIndex}.mp3`)
    }
    
    this.aiAudioElement.oncanplay = () => {
      console.log(`AI音频 ${audioIndex}.mp3 可以开始播放`)
    }
    
    this.aiAudioElement.onplay = () => {
      console.log(`AI音频 ${audioIndex}.mp3 开始播放`)
      // 从思考状态切换到回应状态
      this.model.updateMatchState({ 
        isPartnerThinking: false,
        isPartnerSpeaking: true 
      })
      this.notifyStateChange()
    }
    
    this.aiAudioElement.onended = () => {
      console.log(`AI音频 ${audioIndex}.mp3 播放完成`)
      // 重置AI所有状态
      this.model.updateMatchState({ 
        isPartnerSpeaking: false,
        isPartnerThinking: false
      })
      this.notifyStateChange()
      
      // 增加响应计数
      this.aiResponseIndex++
      
      // 清理音频元素
      if (this.aiAudioElement) {
        this.aiAudioElement = null
      }
    }
    
    this.aiAudioElement.onerror = (error) => {
      console.error(`播放AI音频 ${audioIndex}.mp3 失败:`, error)
      // 重置AI所有状态
      this.model.updateMatchState({ 
        isPartnerSpeaking: false,
        isPartnerThinking: false
      })
      this.notifyStateChange()
      
      // 仍然增加计数，避免卡住
      this.aiResponseIndex++
      
      if (this.aiAudioElement) {
        this.aiAudioElement = null
      }
    }
    
    // 开始播放
    this.aiAudioElement.play().catch(error => {
      console.error(`播放AI音频 ${audioIndex}.mp3 失败:`, error)
      this.model.updateMatchState({ isPartnerSpeaking: false })
      this.notifyStateChange()
      this.aiResponseIndex++
    })
  }

  // 设置AI模式的专用主题
  private setAIModeTopic(): void {
    const aiTopic = "You will talk with your partner about your favorite book. Your discussion may include:"
    const aiPrompts = [
      "What is the book?",
      "Who wrote the book?", 
      "What is it about?"
    ]
    
    // 直接设置AI模式的主题和提示
    this.questionManager.setServerTopic(aiTopic, aiPrompts)
    
    console.log('AI模式主题已设置:', aiTopic)
    console.log('AI模式提示已设置:', aiPrompts)
  }

  // 设置真人对战模式的专用主题
  private setHumanBattleTopic(): void {
    const humanTopic = "How to Spend Your Summer Vacation?"
    const humanPrompts = [
      "What are your summer vacation plans?",
      "Where would you like to travel this summer?",
      "What activities do you enjoy during summer?",
      "How do you usually spend your free time in summer?",
      "What's your ideal summer vacation?"
    ]
    
    // 直接设置真人对战模式的主题和提示
    this.questionManager.setServerTopic(humanTopic, humanPrompts)
    
    console.log('真人对战模式主题已设置:', humanTopic)
    console.log('真人对战模式提示已设置:', humanPrompts)
  }
}