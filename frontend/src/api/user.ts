import type { LoginRequest, LoginResponse, VerifyRequest, VerifyResponse, ForgotPasswordSendCodeRequest, ForgotPasswordSendCodeResponse, LogoutResponse } from '../interface/auth'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'

export function loginApi(request: LoginRequest): Promise<LoginResponse> {
  console.log('发送的登录数据:', JSON.stringify(request))
  return http.post<LoginResponse, LoginRequest>(API_ENDPOINTS.AUTH.LOGIN, request)
}

export function sendVerificationCodeApi(email: string, username: string, password: string): Promise<{ message: string }> {
  console.log('发送注册检查请求:', { email, username, password })
  return http.post<{ message: string }, { email: string, username: string, password: string }>(
    API_ENDPOINTS.AUTH.REGISTER.CHECK,
    { email, username, password }
  )
}

export function verifyApi(request: VerifyRequest): Promise<VerifyResponse> {
  console.log('验证码验证请求:', JSON.stringify(request))
  return http.post<VerifyResponse, VerifyRequest>(API_ENDPOINTS.AUTH.REGISTER.VERIFY, request)
}

export function logoutApi(): Promise<LogoutResponse> {
  console.log('准备发送退出登录请求')
  console.log('当前token:', localStorage.getItem('token'))
  console.log('请求URL:', API_ENDPOINTS.AUTH.LOGOUT)
  return http.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT).then(response => {
    console.log('登出API响应:', response)
    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  }).catch(error => {
    console.error('登出API错误:', error)
    throw error
  })
}

export function sendForgotPasswordCodeApi(request: ForgotPasswordSendCodeRequest): Promise<ForgotPasswordSendCodeResponse> {
  console.log('发送重置密码验证码请求:', request)
  console.log('请求URL:', API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_CODE)
  return http.post<ForgotPasswordSendCodeResponse, ForgotPasswordSendCodeRequest>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD.SEND_CODE,
    request
  )
}

export function verifyForgotPasswordCodeApi(request: { email: string, verificationCode: string }): Promise<{ resetToken: string }> {
  console.log('验证重置密码验证码请求:', request)
  console.log('请求URL:', API_ENDPOINTS.AUTH.FORGOT_PASSWORD.VERIFY_CODE)
  return http.post<{ resetToken: string }, { email: string, verificationCode: string }>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD.VERIFY_CODE,
    request
  )
}

export function resetPasswordApi(request: { resetToken: string, newPassword: string }): Promise<{ message: string }> {
  console.log('重置密码请求:', request)
  return http.post<{ message: string }, { resetToken: string, newPassword: string }>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD.RESET_PASSWORD,
    request,
    { validateStatus: (status) => status === 200 }
  )
}

// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, request)
// }
