// Redis 缓存 API
// 使用带缓存的高性能接口

import { http } from '../utils/http'
import type { Post } from '../interface/CommunityInterface'

/**
 * 社区缓存 API
 */
export const CommunityCacheAPI = {
  /**
   * 获取所有帖子（带缓存）
   */
  getAllPosts: async (): Promise<{ success: boolean; count: number; posts: Post[]; queryTime: string }> => {
    console.log('获取所有帖子（缓存）')
    return http.get('/api/community/cache/posts/all')
  },

  /**
   * 获取帖子详情（带缓存）
   */
  getPostById: async (postId: string): Promise<{ success: boolean; post: Post; queryTime: string }> => {
    console.log('获取帖子详情（缓存）:', postId)
    return http.get(`/api/community/cache/post/${postId}`)
  },

  /**
   * 搜索帖子（带缓存）
   */
  searchPosts: async (keyword: string): Promise<{ success: boolean; count: number; posts: Post[]; queryTime: string }> => {
    console.log('搜索帖子（缓存）:', keyword)
    return http.get(`/api/community/cache/posts/search?keyword=${encodeURIComponent(keyword)}`)
  },

  /**
   * 点赞帖子
   */
  likePost: async (postId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    console.log('点赞帖子:', postId, userId)
    return http.post(`/api/community/cache/post/${postId}/like`, { userId })
  },

  /**
   * 取消点赞
   */
  unlikePost: async (postId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    console.log('取消点赞:', postId, userId)
    return http.post(`/api/community/cache/post/${postId}/unlike`, { userId })
  },

  /**
   * 记录浏览
   */
  viewPost: async (postId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    console.log('记录浏览:', postId, userId)
    return http.post(`/api/community/cache/post/${postId}/view`, { userId })
  },

  /**
   * 获取点赞数
   */
  getLikeCount: async (postId: string): Promise<{ success: boolean; likeCount: number }> => {
    console.log('获取点赞数:', postId)
    return http.get(`/api/community/cache/post/${postId}/like-count`)
  },

  /**
   * 获取浏览统计
   */
  getViewStats: async (postId: string): Promise<{ success: boolean; pv: number; uv: number }> => {
    console.log('获取浏览统计:', postId)
    return http.get(`/api/community/cache/post/${postId}/view-stats`)
  }
}

/**
 * 商城缓存 API
 */
export const ShopCacheAPI = {
  /**
   * 获取所有商品（带缓存）
   */
  getAllProducts: async () => {
    console.log('获取所有商品（缓存）')
    return http.get('/api/shop/cache/products/all')
  },

  /**
   * 获取商品详情（带缓存）
   */
  getProductById: async (productId: number) => {
    console.log('获取商品详情（缓存）:', productId)
    return http.get(`/api/shop/cache/product/${productId}`)
  },

  /**
   * 搜索商品（带缓存）
   */
  searchProducts: async (keyword: string) => {
    console.log('搜索商品（缓存）:', keyword)
    const url = keyword 
      ? `/api/shop/cache/products/search?keyword=${encodeURIComponent(keyword)}`
      : '/api/shop/cache/products/search'
    return http.get(url)
  }
}

/**
 * 缓存管理 API
 */
export const CacheManagementAPI = {
  /**
   * 全局缓存预热
   */
  warmUpAll: async () => {
    console.log('全局缓存预热')
    return http.post('/api/cache/warmup-all', {})
  },

  /**
   * 清除所有缓存
   */
  clearAll: async () => {
    console.log('清除所有缓存')
    return http.delete('/api/cache/clear-all')
  },

  /**
   * 获取缓存统计
   */
  getStats: async () => {
    console.log('获取缓存统计')
    return http.get('/api/cache/stats')
  },

  /**
   * 健康检查
   */
  healthCheck: async () => {
    console.log('缓存健康检查')
    return http.get('/api/cache/health')
  }
}
