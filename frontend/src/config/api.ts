// API 基础配置
interface ImportMetaEnvFlag { env?: { PROD?: boolean } }
const meta = import.meta as unknown as ImportMetaEnvFlag;
const isProd = meta.env?.PROD === true;
export const API_BASE_URL = isProd 
  ? 'http://10.210.83.161:8080' 
  : 'http://10.210.83.161:8080'

// WebSocket 基础配置
export const WS_BASE_URL = isProd
  ? 'wss://115.175.45.173:8080'
  : 'ws://localhost:8080'

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
    LOGOUT: '/api/auth/logout',
    UPDATE_AVATAR: '/api/auth/avatar/update',
    UPLOAD_AVATAR: '/api/auth/avatar/upload',
    USER_INFO: '/api/auth/user/info'
  },
  // 社区相关
  COMMUNITY: {
    SEARCH: '/api/community/search',
    POSTS: {
      LIKE: '/api/community/posts/like',
      ADD: '/api/community/posts/add',
      ADD_WITH_IMAGES: '/api/community/posts/add-with-images', // 新增: 带图片发帖
      CHECK_AUTHOR: '/api/community/posts/check-author',
      REPLIES: '/api/community/posts',  // GET /api/community/posts/{postId}/replies
      USER_POSTS: '/api/community/posts/user',  // 新增: 获取用户帖子
      DELETE: '/api/community/posts'  // 新增: 删除帖子 DELETE /api/community/posts/{postId}
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
      USE: '/api/shop/product/use',
      GET_MODEL_ID: '/api/shop/product/getused'
    },
  },
  // WebSocket 相关
  VERSUS: {
    CONNECT: '/api/speech/connect'
  },
  // 社交相关
  SOCIAL: {
    FOLLOW: {
      ACTION: '/api/social/follow',
      STATUS: '/api/social/follow/status',
      LIST: '/api/social/follow/list'  // 新增: 获取用户关注列表
    },
    FAVORITE: {
      ACTION: '/api/social/favorite',
      STATUS: '/api/social/favorite/status',
      USER_POSTS: '/api/social/favorite/posts'  // 新增: 获取用户收藏的帖子
    },
    REACTION: {
      ACTION: '/api/social/reaction',
      SUMMARY: '/api/social/reaction/summary'
    },
    AUTHORS: {
      RECOMMEND: '/api/social/authors/recommend'
    }
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
