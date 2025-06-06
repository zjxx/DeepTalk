// API 基础配置
export const API_BASE_URL = 'https://115.175.45.173'

// API 端点配置
export const API_ENDPOINTS = {
  // 用户相关
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: {
      CHECK: '/api/auth/register/check',
      VERIFY: '/api/auth/register/verify'
    },
    FORGOT_PASSWORD: {
      SEND_CODE: '/api/auth/forgot-password/send-code',
      VERIFY_CODE: '/api/auth/forgot-password/verify-code',
      RESET_PASSWORD: '/api/auth/forgot-password/reset'
    },
    LOGOUT: '/api/auth/logout'
  },
  // 社区相关
  COMMUNITY: {
    SEARCH: '/api/community/search',
    POSTS: {
      LIKE: '/api/community/posts/like',
      ADD: '/api/community/posts/add',
      CHECK_AUTHOR: '/api/community/posts/check-author'
    },
  },
  //商店相关
  SHOP: {
    SEARCH: '/api/shop/search',
    CHECK_STOCK: '/api/shop/check-stock',
    PRODUCT: {
      PURCHASE: '/api/shop/product/purchase',
      ORDER: '/api/shop/product/order',
      CHECK: '/api/shop/product/check',
    },
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
