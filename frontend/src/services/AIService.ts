// src/services/AIService.ts
import { HuggingFaceService, type ConversationContext } from './HuggingFaceService'
import { GeminiService } from './GeminiService'
import { BackendAIService } from './BackendAIService'

export type AIServiceProvider = 'backend' | 'gemini' | 'huggingface';

export class AIService {
  private aiSpeakingTimeout: number | null = null
  private huggingFaceService: HuggingFaceService
  private geminiService: GeminiService
  private backendAIService: BackendAIService
  private currentProvider: AIServiceProvider
  private isProcessing: boolean = false
  
  // 回调函数
  onSpeakingStateChange?: (isSpeaking: boolean) => void
  onResponseGenerated?: (response: string) => void
  onThinkingStateChange?: (isThinking: boolean) => void
  onErrorOccurred?: (error: string) => void

  constructor(provider: AIServiceProvider = 'backend') {
    this.huggingFaceService = new HuggingFaceService()
    this.geminiService = new GeminiService()
    this.backendAIService = new BackendAIService()
    this.currentProvider = provider
    
    // 优先使用后端服务
    if (provider === 'backend') {
      console.log('✅ 使用后端 MiniMax AI 服务（推荐）')
      return
    }
    
    // 如果指定了其他provider，检查配置
    if (provider === 'gemini' && !this.isGeminiConfigured()) {
      console.warn('Gemini not configured, falling back to backend AI')
      this.currentProvider = 'backend'
    } else if (provider === 'huggingface' && !this.huggingFaceService.isConfigured()) {
      console.warn('HuggingFace not configured, falling back to backend AI')
      this.currentProvider = 'backend'
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
  private getCurrentService(): HuggingFaceService | GeminiService | BackendAIService {
    if (this.currentProvider === 'backend') {
      return this.backendAIService
    }
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
      
      // 持续重试直到获得正常回复
      let aiResponse: string | null = null
      let retryCount = 0
      const maxRetries = 20 // 增加最大重试次数
      let consecutiveFallbacks = 0 // 连续获得备用回复的次数
      
      while (!aiResponse && retryCount < maxRetries) {
        try {
          console.log(`🔄 尝试获取AI回复 (第${retryCount + 1}次/共${maxRetries}次)...`)
          const rawResponse = await this.getCurrentService().generateResponse(userSpeechText)
          
          // 验证回复是否为正常回复（不是备用回复）
          if (this.isValidNormalResponse(rawResponse)) {
            console.log('✅ 获得有效的AI正常回复:', rawResponse)
            aiResponse = rawResponse
            break
          } else {
            console.log('⚠️ 检测到备用回复，继续等待正常回复...')
            consecutiveFallbacks++
            
            // 如果连续多次获得备用回复，增加等待时间
            let waitTime = 3000 // 基础等待时间3秒
            if (consecutiveFallbacks >= 3) {
              waitTime = 5000 // 5秒
            } else if (consecutiveFallbacks >= 6) {
              waitTime = 8000 // 8秒
            }
            
            console.log(`⏱️ 等待${waitTime/1000}秒后重试... (连续备用回复: ${consecutiveFallbacks}次)`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            
            retryCount++
          }
        } catch (error) {
          console.warn(`❌ 第${retryCount + 1}次尝试失败:`, error)
          retryCount++
          
          if (retryCount < maxRetries) {
            const waitTime = Math.min(3000 + retryCount * 1000, 10000) // 递增等待时间，最多10秒
            console.log(`⏱️ 等待${waitTime/1000}秒后重试...`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
          }
        }
      }
      
      if (aiResponse) {
        console.log('🎉 AI response successfully generated:', aiResponse)
        
        // 通知停止思考
        this.onThinkingStateChange?.(false)
        
        // 立即显示AI回复文本（在TTS之前）
        this.onResponseGenerated?.(aiResponse)
        
        // 注意：不在这里管理speaking状态
        // speaking状态由TTS服务的回调自动管理
      } else {
        console.error(`💔 达到最大重试次数(${maxRetries}次)，仍未获得有效的AI回复`)
        console.error(`📊 统计信息: 连续备用回复 ${consecutiveFallbacks} 次`)
        this.onThinkingStateChange?.(false)
        
        // 提供更详细的错误信息
        if (consecutiveFallbacks >= 5) {
          this.onErrorOccurred?.('AI服务正在维护中，请稍后再试。我们正在努力为您提供更好的服务。')
        } else {
          this.onErrorOccurred?.('AI服务正在处理大量请求，请稍等片刻后再试。')
        }
      }

    } catch (error) {
      console.error('Error generating AI response:', error)
      this.onThinkingStateChange?.(false)
      this.onErrorOccurred?.('AI回复生成失败，请稍后重试')
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 验证是否为正常回复（而非备用回复）
   */
  private isValidNormalResponse(response: string): boolean {
    if (!response || typeof response !== 'string') {
      return false
    }
    
    // 检查是否包含后端AIReplyService的备用回复模式
    const backendFallbackPatterns = [
      '感谢分享！这个话题很有意思，期待看到更多讨论。',
      '很有见地的观点！你提到的内容让我有了新的思考。',
      '这是一个很棒的帖子！希望能看到更多这样的内容。',
      '非常有价值的分享，感谢你的贡献！',
      '很高兴看到这样的讨论，继续加油！'
    ]
    
    // 检查是否完全匹配后端备用回复
    for (const pattern of backendFallbackPatterns) {
      if (response.trim() === pattern) {
        console.log(`检测到后端备用回复: ${pattern}`)
        return false
      }
    }
    
    // 检查其他可能的备用回复模式
    const generalFallbackPatterns = [
      'I apologize, but I\'m having trouble',
      'Sorry, I\'m experiencing some technical',
      'I\'m having connection issues',
      'Pardon me, but I need a moment',
      'I apologize for the interruption',
      'That\'s an interesting point about',
      'I appreciate your thoughts on',
      'Thank you for sharing. Could you explain',
      'That\'s a good perspective',
      'I understand. What made you interested',
      '关于.*，这是一个有趣的观点',
      '感谢你分享关于.*的想法',
      '谢谢分享。能用另一种方式解释',
      '这是一个很好的角度',
      '我理解了。是什么让你对.*感兴趣',
      'Sorry, I cannot generate a response',
      'AI service is temporarily unavailable',
      'The system is busy',
      'Sorry, I need some time to think',
      '感谢.*分享',
      '很有.*观点',
      '这是一个.*帖子',
      '非常.*分享',
      '很高兴.*讨论'
    ]
    
    // 如果回复匹配任何备用回复模式，则认为不是正常回复
    for (const pattern of generalFallbackPatterns) {
      if (new RegExp(pattern, 'i').test(response)) {
        console.log(`检测到备用回复模式: ${pattern}`)
        return false
      }
    }
    
    // 如果回复太短（少于15个字符），可能也是备用回复
    if (response.trim().length < 15) {
      console.log('回复过短，可能是备用回复')
      return false
    }
    
    // 检查是否包含具体的对话内容（而不是泛泛而谈的礼貌用语）
    const conversationIndicators = [
      'what', 'how', 'why', 'when', 'where', 'which', 'who',
      'tell me', 'explain', 'describe', 'think', 'believe', 'opinion',
      'experience', 'example', 'interesting', 'different', 'similar',
      '什么', '怎么', '为什么', '哪里', '如何', '告诉我', '解释', '描述', 
      '我认为', '我觉得', '经验', '例子', '有趣', '不同', '类似',
      'could you', 'would you', 'have you', 'do you', 'are you',
      '你能', '你会', '你有', '你是否', '你觉得'
    ]
    
    let hasConversationContent = false
    for (const indicator of conversationIndicators) {
      if (response.toLowerCase().includes(indicator.toLowerCase())) {
        hasConversationContent = true
        break
      }
    }
    
    if (!hasConversationContent) {
      console.log('回复缺乏具体对话内容，可能是备用回复')
      return false
    }
    
    return true
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
   * 旧的开始说话方法（已废弃 - 不再使用预设回复）
   * @deprecated 此方法已被废弃，现在统一使用 generateResponseFromSpeech() 方法
   * 保留此方法仅为了向后兼容，但已移除预设回复逻辑
   */
  startSpeaking(): void {
    console.warn('⚠️ startSpeaking() 方法已废弃，请使用 generateResponseFromSpeech() 方法')
    // 不再生成预设回复，避免干扰真正的AI回复
    // 如果需要AI回复，应该调用 generateResponseFromSpeech() 方法
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