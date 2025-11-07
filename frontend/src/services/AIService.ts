// src/services/AIService.ts
import { HuggingFaceService, type ConversationContext } from './HuggingFaceService'
import { GeminiService } from './GeminiService'

export type AIServiceProvider = 'gemini' | 'huggingface';

export class AIService {
  private aiSpeakingTimeout: number | null = null
  private huggingFaceService: HuggingFaceService
  private geminiService: GeminiService
  private currentProvider: AIServiceProvider
  private isProcessing: boolean = false
  
  // 回调函数
  onSpeakingStateChange?: (isSpeaking: boolean) => void
  onResponseGenerated?: (response: string) => void
  onThinkingStateChange?: (isThinking: boolean) => void
  onErrorOccurred?: (error: string) => void

  constructor(provider: AIServiceProvider = 'gemini') {
    this.huggingFaceService = new HuggingFaceService()
    this.geminiService = new GeminiService()
    this.currentProvider = provider
    
    // 如果首选provider没有配置API密钥，自动切换
    if (provider === 'gemini' && !this.isGeminiConfigured()) {
      console.warn('Gemini not configured, falling back to HuggingFace')
      this.currentProvider = 'huggingface'
    } else if (provider === 'huggingface' && !this.huggingFaceService.isConfigured()) {
      console.warn('HuggingFace not configured, trying Gemini')
      this.currentProvider = 'gemini'
    }
  }

  /**
   * 检查Gemini是否配置
   */
  private isGeminiConfigured(): boolean {
    // Gemini始终配置了默认API密钥
    return true;
  }

  /**
   * 获取当前活动的AI服务
   */
  private getCurrentService(): HuggingFaceService | GeminiService {
    return this.currentProvider === 'gemini' 
      ? this.geminiService 
      : this.huggingFaceService;
  }

  /**
   * 切换AI服务提供商
   */
  switchProvider(provider: AIServiceProvider): void {
    this.currentProvider = provider;
    console.log(`Switched to ${provider} provider`);
  }

  /**
   * 获取当前提供商
   */
  getCurrentProvider(): AIServiceProvider {
    return this.currentProvider;
  }

  /**
   * 设置对话上下文（主题、难度等）
   */
  setConversationContext(context: Partial<ConversationContext>): void {
    this.getCurrentService().setConversationContext(context)
  }
  /**
   * 基于用户语音文本生成AI回复
   */
  async generateResponseFromSpeech(userSpeechText: string): Promise<void> {
    if (this.isProcessing) {
      console.warn('AI is already processing a response')
      return
    }

    this.isProcessing = true
    
    try {
      // 通知开始思考
      this.onThinkingStateChange?.(true)
      
      console.log(`Generating AI response using ${this.currentProvider}:`, userSpeechText)
      
      // 调用当前AI服务生成回复
      const aiResponse = await this.getCurrentService().generateResponse(userSpeechText)
      
      console.log('AI response generated:', aiResponse)
      
      // 通知停止思考
      this.onThinkingStateChange?.(false)
      
      // 立即显示AI回复文本（在TTS之前）
      this.onResponseGenerated?.(aiResponse)
      
      // 注意：不在这里管理speaking状态
      // speaking状态由TTS服务的回调自动管理

    } catch (error) {
      console.error('Error generating AI response:', error)
      this.onThinkingStateChange?.(false)
      this.onSpeakingStateChange?.(false)
      this.onErrorOccurred?.('AI回复生成失败，请稍后重试')
      
      // 使用备用回复
      this.generateFallbackResponse()
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 生成备用回复（当API真的失败时）
   * 注意：这个方法现在几乎不会被调用，因为GeminiService已经有自己的备用回复
   */
  private generateFallbackResponse(): void {
    console.warn('⚠️ AIService: 生成备用回复（这不应该经常发生）')
    
    const fallbackResponses = [
      "I apologize, but I'm having trouble generating a response right now. Could you please try again?",
      "Sorry, I'm experiencing some technical difficulties. Please rephrase your question.",
      "I'm having connection issues at the moment. Could you repeat that?",
      "Pardon me, but I need a moment to reconnect. Please try again.",
      "I apologize for the interruption. Could you please say that again?"
    ]
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    
    // 立即显示备用回复（不延迟，因为这是真正的错误）
    this.onResponseGenerated?.(randomResponse)
  }

  /**
   * 旧的开始说话方法（保持兼容性）
   */
  startSpeaking(): void {
    this.stopSpeaking()
    
    setTimeout(() => {
      // 生成AI回复
      const aiResponses = [
        "That's a very interesting perspective. Could you tell me more about your experience with this?",
        "I understand your point. Have you considered the alternative viewpoint?",
        "That's a great example. How do you think this applies in different situations?",
        "Very thoughtful response. What do you think are the main challenges in this area?",
        "I see what you mean. How has this changed over the years in your opinion?"
      ]
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      
      // 立即显示回复文本
      if (this.onResponseGenerated) {
        this.onResponseGenerated(randomResponse)
      }
      
      // TTS将由Controller的回调自动处理
    }, 1000)
  }

  stopSpeaking(): void {
    if (this.aiSpeakingTimeout) {
      clearTimeout(this.aiSpeakingTimeout)
      this.aiSpeakingTimeout = null
    }
    
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false)
    }
  }

  cleanup(): void {
    this.stopSpeaking()
  }
}