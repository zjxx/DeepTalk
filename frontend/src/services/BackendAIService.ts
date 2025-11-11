// Backend AI Service - 使用后端的 MiniMax API
// 这是推荐的方式，所有 AI 配置都在后端管理

import { http } from '../utils/http'
import type { ConversationContext } from './GeminiService'

export class BackendAIService {
  private conversationContext: ConversationContext
  private conversationHistory: Array<{ role: string; content: string }> = []

  constructor() {
    this.conversationContext = {
      topic: '',
      messages: [],
      difficulty: '中级',
      language: 'zh-CN'
    }
  }

  /**
   * 设置对话上下文
   */
  setConversationContext(context: Partial<ConversationContext>): void {
    this.conversationContext = { ...this.conversationContext, ...context }
    console.log('Backend AI 对话上下文已更新:', this.conversationContext)
  }  /**
   * 生成 AI 回复 - 使用后端的 MiniMax API
   * 强制使用英文进行对话
   */
  async generateResponse(userMessage: string): Promise<string> {
    console.log('🚀 使用后端 MiniMax API 生成英文回复...')
    console.log('用户消息:', userMessage)
    console.log('当前主题:', this.conversationContext.topic)

    // 构建上下文信息
    const contextInfo = this.buildContextInfo(userMessage)

    // 调用后端 AI 接口，明确指定使用英文
    const response = await http.post('/api/ai/chat', {
      message: userMessage,
      context: contextInfo,
      language: 'English'  // 明确指定使用英文
    }) as { success: boolean; message?: string; error?: string }

    if (response.success && response.message) {
      const aiReply = response.message
      
      // 记录对话历史
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiReply }
      )

      // 限制历史记录长度（保留最近10轮对话）
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20)
      }

      console.log('✅ MiniMax AI 英文回复:', aiReply)
      return aiReply
    } else {
      // 抛出错误而不是返回备用回复
      const errorMsg = response.error || 'AI 服务返回错误'
      console.error('❌ Backend AI 服务错误:', errorMsg)
      throw new Error(errorMsg)
    }
  }  /**
   * 构建上下文信息 - 用于英文对话
   */
  private buildContextInfo(userMessage: string): string {
    const { topic, difficulty } = this.conversationContext
    console.log(userMessage)
    let context = ''
    
    // 添加主题信息（英文）
    if (topic) {
      context += `Conversation Topic: ${topic}\n`
    }
    
    // 添加难度级别（英文）
    const difficultyMap: { [key: string]: string } = {
      '初级': 'Beginner',
      '中级': 'Intermediate',
      '高级': 'Advanced'
    }
    context += `Difficulty Level: ${difficultyMap[difficulty] || difficulty}\n`
    
    // 添加对话历史（最近3轮）
    if (this.conversationHistory.length > 0) {
      context += '\nConversation History:\n'
      const recentHistory = this.conversationHistory.slice(-6) // 最近3轮（6条消息）
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'User' : 'AI'
        context += `${role}: ${msg.content}\n`
      })
    }
    
    return context
  }
  /**
   * 获取备用回复（当 AI 服务不可用时）- 英文
   */
  private getFallbackResponse(): string {
    const fallbackResponses = [
      "Sorry, I cannot generate a response right now. Please try again later.",
      "AI service is temporarily unavailable. Please check your network connection.",
      "The system is busy. Please try again later.",
      "Sorry, I need some time to think about this question."
    ]
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }

  /**
   * 重置对话历史
   */
  resetConversation(): void {
    this.conversationHistory = []
    console.log('对话历史已重置')
  }

  /**
   * 获取对话历史
   */
  getConversationHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory]
  }  /**
   * 检查服务状态
   */
  async checkStatus(): Promise<boolean> {
    try {
      const response = await http.get('/api/ai/status') as unknown as { success: boolean }
      console.log('Backend AI 服务状态:', response)
      return response.success === true
    } catch (error) {
      console.error('检查 AI 服务状态失败:', error)
      return false
    }
  }

  /**
   * 生成帖子回复
   */
  async generatePostReply(title: string, content: string): Promise<string> {
    const response = await http.post('/api/ai/generate-reply', {
      title,
      content
    }) as unknown as { success: boolean; reply?: string; error?: string }

    if (response.success && response.reply) {
      console.log('✅ 帖子回复生成成功')
      return response.reply
    } else {
      throw new Error(response.error || '生成回复失败')
    }
  }
}
