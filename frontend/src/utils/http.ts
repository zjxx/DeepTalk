import axios, { type AxiosRequestConfig, type AxiosRequestHeaders } from 'axios'
import { API_BASE_URL } from '../config/api'

// 创建 axios 实例
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData
    if (isFormData) {
      delete headers['Content-Type']
    } else {
      if (!headers['Content-Type']) headers['Content-Type'] = 'application/json'
    }

    // 不需要token的接口白名单（只读操作）
    const noToken = (
      config.url?.includes('/api/auth/login') ||
      config.url?.includes('/api/auth/register') ||
      config.url?.includes('/api/auth/send-verification-code') ||
      config.url?.includes('/api/auth/forgot-password') ||
      config.url?.includes('/api/shop/search') ||
      config.url?.includes('/api/shop/check-stock') ||
      config.url?.includes('/api/community/search') ||
      config.url?.includes('/api/community/posts/latest') ||
      (config.url?.includes('/api/community/posts/') && config.url?.includes('/replies') && config.method?.toUpperCase() === 'GET')
    )
    if (!noToken) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    config.headers = headers
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); sessionStorage.removeItem('token')
      localStorage.removeItem('userInfo'); sessionStorage.removeItem('userInfo')
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.get<T>(url, config).then(d => d as unknown as T),

  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.post<T>(url, data, config).then(d => d as unknown as T),

  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.put<T>(url, data, config).then(d => d as unknown as T),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    httpClient.delete<T>(url, config).then(d => d as unknown as T)
}
