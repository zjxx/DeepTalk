import axios, { type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/api'

// 创建 axios 实例
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 登录、注册和验证码请求不需要带上 token
    if (config.url?.includes('/api/auth/login') || 
        config.url?.includes('/api/auth/register') || 
        config.url?.includes('/api/auth/send-verification-code') ||
        config.url?.includes('/api/auth/forgot-password') ||
        config.url?.includes('/api/shop/search') ||
        config.url?.includes('/api/shop/check-stock')) {
      console.log('发送请求(无需token):', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
      })
      return config
    }
    
    // 从 localStorage 或 sessionStorage 获取 token
    const localToken = localStorage.getItem('token')
    const sessionToken = sessionStorage.getItem('token')
    const token = localToken || sessionToken
    
    if (!token) {
      return Promise.reject(new Error('Token不存在，请先登录'))
    }
    
    // 设置 Authorization 头
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
    
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response.data
  },
  (error) => {
    console.error('响应错误:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<T>(url, config),

  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    httpClient.post<T, T, D>(url, data, config),

  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    httpClient.put<T, T, D>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<T>(url, config)
}
