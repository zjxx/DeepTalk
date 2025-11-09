// AI 服务 API
// 使用后端的 MiniMax AI 服务

import { http } from '../utils/http'

/**
 * AI 对话接口
 */
export interface ChatRequest {
  message: string      // 用户消息
  context?: string     // 可选的上下文
}

export interface ChatResponse {
  success: boolean
  message?: string     // AI 回复
  model?: string       // 使用的模型
  error?: string       // 错误信息
  details?: string     // 详细错误信息
}

/**
 * 生成帖子回复请求
 */
export interface GenerateReplyRequest {
  title: string        // 帖子标题
  content: string      // 帖子内容
}

export interface GenerateReplyResponse {
  success: boolean
  reply?: string       // AI 生成的回复
  model?: string       // 使用的模型
  error?: string       // 错误信息
  details?: string     // 详细错误信息
}

/**
 * AI 服务状态
 */
export interface AIStatusResponse {
  success: boolean
  service: string      // 服务名称
  model: string        // 模型名称
  status: string       // 运行状态
}

/**
 * AI API 服务
 */
export const AIAPI = {
  /**
   * AI 对话
   * @param message 用户消息
   * @param context 可选的上下文
   */
  chat: async (message: string, context?: string): Promise<ChatResponse> => {
    console.log('调用 AI 对话:', message)
    return http.post('/api/ai/chat', { message, context })
  },

  /**
   * 生成帖子回复
   * @param title 帖子标题
   * @param content 帖子内容
   */
  generateReply: async (title: string, content: string): Promise<GenerateReplyResponse> => {
    console.log('生成帖子回复:', title)
    return http.post('/api/ai/generate-reply', { title, content })
  },

  /**
   * 获取 AI 服务状态
   */
  getStatus: async (): Promise<AIStatusResponse> => {
    console.log('获取 AI 服务状态')
    return http.get('/api/ai/status')
  }
}
