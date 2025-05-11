import type { LoginRequest, LoginResponse } from '../interface/auth'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'

export function loginApi(request: LoginRequest): Promise<LoginResponse> {
  console.log('发送的登录数据:', JSON.stringify(request))
  return http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, request)
}

// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, request)
// } 