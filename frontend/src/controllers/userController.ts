import userModel from '../models/user'
import { loginApi, registerApi, sendVerificationCodeApi, verifyApi } from '../api/user'
import type { LoginRequest, LoginResponse, RegisterRequest, VerifyRequest } from '../interface/auth'

export async function login(
  request: LoginRequest,
  rememberMe: boolean
): Promise<void> {
  try {
    console.log('登录请求数据:', request) // 添加日志
    const res: LoginResponse = await loginApi(request)
    userModel.email = request.email
    userModel.token = res.token
    userModel.isLoggedIn = true
    
    // 记住我逻辑
    if (rememberMe) {
      localStorage.setItem('token', res.token)
    }
    // 跳转到个人资料页
    window.location.href = '/profile'
  } catch (e) {
    alert('登录失败，请检查邮箱和密码')
  }
}

export async function register(request: RegisterRequest): Promise<void> {
  try {
    console.log('注册请求数据:', request)
    await registerApi(request)
  } catch (e) {
    alert('注册失败，请稍后重试')
    throw e
  }
}

export async function sendVerificationCode(email: string): Promise<void> {
  try {
    console.log('发送验证码到:', email)
    await sendVerificationCodeApi(email)
  } catch (e) {
    alert('发送验证码失败，请稍后重试')
    throw e
  }
}

export async function verify(request: VerifyRequest): Promise<void> {
  try {
    console.log('验证码验证请求:', request)
    const response = await verifyApi(request)
    if (!response.success) {
      alert(response.message || '验证码验证失败')
      throw new Error(response.message)
    }
  } catch (e) {
    alert('验证码验证失败，请重试')
    throw e
  }
} 