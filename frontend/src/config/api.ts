// API 基础配置
export const API_BASE_URL = 'http://115.175.45.173:8080/api'

// API 端点配置
export const API_ENDPOINTS = {
  // 用户相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  // 其他模块的 API 端点可以在这里添加
  // 例如：
  // CHAT: {
  //   SEND_MESSAGE: '/chat/send',
  //   GET_HISTORY: '/chat/history',
  // },
} as const

// 构建完整的 API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
} 