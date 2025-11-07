// src/services/TTSService.ts - 文本转语音服务
export class TTSService {
  private synthesis: SpeechSynthesis
  private utterance: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []
  
  // 回调函数
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
  onError?: (error: Error) => void

  constructor() {
    this.synthesis = window.speechSynthesis
    this.loadVoices()
    
    // 监听语音列表变化
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices()
    }
  }

  /**
   * 加载可用的语音列表
   */
  private loadVoices(): void {
    this.voices = this.synthesis.getVoices()
    console.log('TTS可用语音:', this.voices.map(v => `${v.name} (${v.lang})`))
  }

  /**
   * 获取中文语音
   */
  private getChineseVoice(): SpeechSynthesisVoice | null {
    // 优先查找中文语音
    const chineseVoice = this.voices.find(voice => 
      voice.lang.includes('zh') || 
      voice.lang.includes('cmn') ||
      voice.name.includes('Chinese')
    )
    
    if (chineseVoice) {
      console.log('使用中文语音:', chineseVoice.name)
      return chineseVoice
    }
    
    console.warn('未找到中文语音，使用默认语音')
    return this.voices[0] || null
  }

  /**
   * 获取英文语音
   */
  private getEnglishVoice(): SpeechSynthesisVoice | null {
    // 优先查找英文语音
    const englishVoice = this.voices.find(voice => 
      voice.lang.includes('en') ||
      voice.name.includes('English')
    )
    
    if (englishVoice) {
      console.log('使用英文语音:', englishVoice.name)
      return englishVoice
    }
    
    console.warn('未找到英文语音，使用默认语音')
    return this.voices[0] || null
  }

  /**
   * 朗读文本
   * @param text 要朗读的文本
   * @param language 语言 ('zh-CN' | 'en-US')
   * @param rate 语速 (0.1 到 10，默认 1.0)
   * @param pitch 音调 (0 到 2，默认 1.0)
   */
  speak(text: string, language: 'zh-CN' | 'en-US' = 'zh-CN', rate: number = 1.0, pitch: number = 1.0): void {
    try {
      // 停止之前的朗读
      this.stop()
      
      // 创建新的utterance
      this.utterance = new SpeechSynthesisUtterance(text)
      
      // 设置语音参数
      this.utterance.rate = Math.max(0.1, Math.min(10, rate))  // 限制在0.1-10之间
      this.utterance.pitch = Math.max(0, Math.min(2, pitch))   // 限制在0-2之间
      this.utterance.volume = 1.0
      
      // 选择合适的语音
      const voice = language === 'zh-CN' ? this.getChineseVoice() : this.getEnglishVoice()
      if (voice) {
        this.utterance.voice = voice
        this.utterance.lang = voice.lang
      } else {
        this.utterance.lang = language
      }
      
      // 设置事件监听
      this.utterance.onstart = () => {
        console.log('TTS开始朗读:', text.substring(0, 50))
        if (this.onSpeakingStart) {
          this.onSpeakingStart()
        }
      }
      
      this.utterance.onend = () => {
        console.log('TTS朗读完成')
        if (this.onSpeakingEnd) {
          this.onSpeakingEnd()
        }
        this.utterance = null
      }
      
      this.utterance.onerror = (event) => {
        console.error('TTS朗读错误:', event)
        const error = new Error(`TTS错误: ${event.error}`)
        if (this.onError) {
          this.onError(error)
        }
        this.utterance = null
      }
      
      // 开始朗读
      this.synthesis.speak(this.utterance)
      console.log('TTS朗读已启动，语言:', language, '语速:', rate, '音调:', pitch)
      
    } catch (error) {
      console.error('TTS speak失败:', error)
      if (this.onError && error instanceof Error) {
        this.onError(error)
      }
    }
  }

  /**
   * 停止朗读
   */
  stop(): void {
    if (this.synthesis.speaking || this.synthesis.pending) {
      this.synthesis.cancel()
      this.utterance = null
      console.log('TTS朗读已停止')
    }
  }

  /**
   * 暂停朗读
   */
  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause()
      console.log('TTS朗读已暂停')
    }
  }

  /**
   * 恢复朗读
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume()
      console.log('TTS朗读已恢复')
    }
  }

  /**
   * 检查是否正在朗读
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  /**
   * 检查是否暂停
   */
  isPaused(): boolean {
    return this.synthesis.paused
  }

  /**
   * 获取可用语音列表
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.stop()
  }
}
