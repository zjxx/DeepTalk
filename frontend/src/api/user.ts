import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VerifyRequest, VerifyResponse } from '../interface/auth'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'

export function loginApi(request: LoginRequest): Promise<LoginResponse> {
  console.log('发送的登录数据:', JSON.stringify(request))
  return http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, request)
}

export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
  console.log('发送的注册数据:', JSON.stringify(request))
  return http.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, request)
}

export function sendVerificationCodeApi(email: string): Promise<void> {
  console.log('发送验证码到邮箱:', email)
  return http.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE, { email })
}

export function verifyApi(request: VerifyRequest): Promise<VerifyResponse> {
  console.log('验证码验证请求:', JSON.stringify(request))
  return http.post<VerifyResponse>(API_ENDPOINTS.AUTH.VERIFY_CODE, request)
}

// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, request)
// } 