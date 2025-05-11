import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../config/api'

// 创建 axios 实例
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
httpClient.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    httpClient.get<T>(url, config).then(res => res.data),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    httpClient.post<T>(url, data, config).then(res => res.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    httpClient.put<T>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    httpClient.delete<T>(url, config).then(res => res.data),
}

// 导出 axios 实例，以便需要时可以直接使用
export { httpClient } 