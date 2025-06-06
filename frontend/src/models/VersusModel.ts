// src/models/VersusModel.ts
export interface TranscriptMessage {
  isUser: boolean
  text: string
}

export interface VersusState {
  // PIXI 相关状态
  canvasWidth: number
  canvasHeight: number
  
  // 对战状态
  matchStarted: boolean
  remainingTime: number
  matchType: '真人对战' | 'AI辅助'
  difficultyLevel: '初级' | '中级' | '高级'
  
  // 用户状态
  userMuted: boolean
  isUserSpeaking: boolean
  isPartnerSpeaking: boolean
  
  // 录音状态
  isRecording: boolean
  audioLevel: number
  lastRecordedAudio: Blob | null
  isPlayingAudio: boolean
  
  // 全程录音状态
  fullRecordingAvailable: boolean
  fullRecordingDuration: number
  playbackProgress: number
  currentPlaybackTime: number
  
  // 发言权管理
  speakingTurn: 'user' | 'partner'
  
  // 对话内容
  currentTopicIndex: number
  currentPromptIndex: number
  transcriptMessages: TranscriptMessage[]
}

export class VersusModel {
  private state: VersusState

  constructor() {
    this.state = this.getInitialState()
  }

  private getInitialState(): VersusState {
    return {
      canvasWidth: 0,
      canvasHeight: 0,
      matchStarted: false,
      remainingTime: 300,
      matchType: '真人对战',
      difficultyLevel: '中级',
      userMuted: false,
      isUserSpeaking: false,
      isPartnerSpeaking: false,
      isRecording: false,
      audioLevel: 0,
      lastRecordedAudio: null,
      isPlayingAudio: false,
      fullRecordingAvailable: false,
      fullRecordingDuration: 0,
      playbackProgress: 0,
      currentPlaybackTime: 0,
      speakingTurn: 'user',
      currentTopicIndex: 0,
      currentPromptIndex: 0,
      transcriptMessages: []
    }
  }

  // Getters
  getState(): VersusState {
    return { ...this.state }
  }
  get canUserSpeak(): boolean {
    return this.state.speakingTurn === 'user'
  }

  get currentTopic(): string {
    const topics = [
      'What do you think about online education?',
      'How important is it to learn a foreign language?',
      'Describe your favorite travel experience.',
      'What are the advantages and disadvantages of social media?',
      'How do you manage stress and maintain work-life balance?'
    ]
    return topics[this.state.currentTopicIndex]
  }

  get currentPrompt(): string {
    const prompts = [
      'Share your personal experiences with this topic.',
      'Discuss both the advantages and disadvantages.',
      'Compare the situation in different countries.',
      'What changes do you expect in the future?',
      'How has your opinion on this evolved over time?'
    ]
    return prompts[this.state.currentPromptIndex]
  }

  // Setters
  updateCanvasSize(width: number, height: number): void {
    this.state.canvasWidth = width
    this.state.canvasHeight = height
  }

  updateMatchState(updates: Partial<VersusState>): void {
    Object.assign(this.state, updates)
  }
  switchSpeakingTurn(): void {
    this.state.speakingTurn = this.state.speakingTurn === 'user' ? 'partner' : 'user'
  }

  addTranscriptMessage(message: TranscriptMessage): void {
    this.state.transcriptMessages.push(message)
  }

  clearTranscriptMessages(): void {
    this.state.transcriptMessages = []
  }

  nextTopic(): void {
    const topicsLength = 5 // 主题数量
    const promptsLength = 5 // 提示数量
    this.state.currentTopicIndex = (this.state.currentTopicIndex + 1) % topicsLength
    this.state.currentPromptIndex = (this.state.currentPromptIndex + 1) % promptsLength
    this.clearTranscriptMessages()
  }
  resetMatch(): void {
    this.state.matchStarted = false
    this.state.remainingTime = 300
    this.state.speakingTurn = 'user'
    this.state.isUserSpeaking = false
    this.state.isPartnerSpeaking = false
    this.state.isRecording = false
    this.state.audioLevel = 0
    this.state.isPlayingAudio = false
  }
}