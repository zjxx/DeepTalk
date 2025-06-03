import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, VerifyRequest, VerifyResponse, ForgotPasswordSendCodeRequest, ForgotPasswordSendCodeResponse, ResetPasswordRequest, ResetPasswordResponse, LogoutResponse } from '../interface/auth'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'

export function loginApi(request: LoginRequest): Promise<LoginResponse> {
  console.log('发送的登录数据:', JSON.stringify(request))
  return http.post<LoginResponse, LoginRequest>(API_ENDPOINTS.AUTH.LOGIN, request)
}

export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
  console.log('发送的注册数据:', JSON.stringify(request))
  return http.post<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, request)
}

export function sendVerificationCodeApi(email: string, username: string, password: string): Promise<{ message: string }> {
  console.log('发送验证码请求:', { email, username, password })
  return http.post<{ message: string }, { email: string, username: string, password: string }>(
    API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
    { email, username, password }
  )
}

export function verifyApi(request: VerifyRequest): Promise<VerifyResponse> {
  console.log('验证码验证请求:', JSON.stringify(request))
  return http.post<VerifyResponse, VerifyRequest>(API_ENDPOINTS.AUTH.VERIFY_CODE, request)
}

export function logoutApi(): Promise<LogoutResponse> {
  console.log('发送退出登录请求')
  return http.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)
}

export function sendForgotPasswordCodeApi(request: ForgotPasswordSendCodeRequest): Promise<ForgotPasswordSendCodeResponse> {
  console.log('发送重置密码验证码请求:', JSON.stringify(request))
  return http.post<ForgotPasswordSendCodeResponse, ForgotPasswordSendCodeRequest>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_CODE,
    request
  )
}

export function resetPasswordApi(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  console.log('重置密码请求:', JSON.stringify(request))
  return http.post<ResetPasswordResponse, ResetPasswordRequest>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET_PASSWORD,
    request
  )
}

// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, request)
// }
