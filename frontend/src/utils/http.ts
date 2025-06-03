import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

// 不需要 token 的路径列表
const NO_TOKEN_PATHS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
  API_ENDPOINTS.AUTH.VERIFY_CODE,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_CODE,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET_PASSWORD
]

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
    // 检查是否需要添加 token
    const url = config.url || ''
    const needsToken = !NO_TOKEN_PATHS.some(path => url.includes(path))
    
    if (needsToken) {
      // 从 localStorage 获取 token
      const token = localStorage.getItem('token')
      if (!token) {
        // 如果没有 token，重定向到登录页面
        window.location.href = '/login'
        return Promise.reject(new Error('未登录或登录已过期'))
      }
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
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
      localStorage.removeItem('expiration')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    httpClient.get<T>(url, config).then((res: AxiosResponse<T>) => res.data),
  
  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => 
    httpClient.post<T, AxiosResponse<T>, D>(url, data, config).then((res: AxiosResponse<T>) => res.data),
  
  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => 
    httpClient.put<T, AxiosResponse<T>, D>(url, data, config).then((res: AxiosResponse<T>) => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    httpClient.delete<T>(url, config).then((res: AxiosResponse<T>) => res.data),
}

// 导出 axios 实例，以便需要时可以直接使用
export { httpClient } 