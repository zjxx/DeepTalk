import userModel from '../models/user'
import { loginApi, registerApi, sendVerificationCodeApi, verifyApi, sendForgotPasswordCodeApi, resetPasswordApi, logoutApi } from '../api/user'
import type { LoginRequest, LoginResponse, RegisterRequest, VerifyRequest, ResetPasswordRequest } from '../interface/auth'

// 添加自动登录函数
export async function autoLogin(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('savedEmail')
    const savedPassword = localStorage.getItem('savedPassword')
    const expiration = localStorage.getItem('expiration')
    
    if (token && savedEmail && savedPassword && expiration) {
      // 检查 token 是否过期
      const expirationDate = new Date(expiration)
      if (expirationDate < new Date()) {
        throw new Error('Token expired')
      }

      const loginRequest: LoginRequest = {
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }
      const res: LoginResponse = await loginApi(loginRequest)
      
      // 更新用户模型
      userModel.username = res.username
      userModel.email = res.email
      userModel.token = res.token
      userModel.expiration = res.expiration
      userModel.isLoggedIn = true
      
      return true
    }
    return false
  } catch (e) {
    console.error('自动登录失败:', e)
    // 清除无效的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('savedEmail')
    localStorage.removeItem('savedPassword')
    localStorage.removeItem('expiration')
    return false
  }
}

export const login = async (loginRequest: LoginRequest, rememberMe: boolean): Promise<boolean> => {
  try {
    console.log('登录请求数据:', request)
    const loginRequest: LoginRequest = {
      ...request,
      rememberMe
    }
    const res: LoginResponse = await loginApi(loginRequest)
    console.log('登录响应数据:', res)
    
    userModel.username = res.username
    userModel.email = res.email
    userModel.token = res.token
    userModel.expiration = res.expiration
    userModel.isLoggedIn = true
    
    if (rememberMe) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('savedEmail', request.email)
      localStorage.setItem('savedPassword', request.password)
      localStorage.setItem('expiration', res.expiration)
    } else {
      localStorage.setItem('token', res.token)
      localStorage.setItem('expiration', res.expiration)
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
    }
    
    window.location.href = '/profile'
  } catch (e) {
    alert('登录失败，请检查邮箱和密码')
    console.error('登录失败:', e)
    return false
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

export async function sendVerificationCode(email: string, username: string, password: string): Promise<void> {
  try {
    console.log('发送验证码到:', email)
    const response = await sendVerificationCodeApi(email, username, password)
    console.log('验证码发送响应:', response)
  } catch (e) {
    alert('发送验证码失败，请稍后重试')
    throw e
  }
}

export async function verify(request: VerifyRequest): Promise<void> {
  try {
    console.log('验证码验证请求:', request)
    const response = await verifyApi(request)
    if (response.message !== '注册成功') {
      alert(response.message)
      throw new Error(response.message)
    }
  } catch (e) {
    alert('验证码验证失败，请重试')
    throw e
  }
}

export async function sendForgotPasswordCode(email: string): Promise<void> {
  try {
    console.log('发送重置密码验证码到:', email)
    const response = await sendForgotPasswordCodeApi({ email })
    console.log('重置密码验证码发送响应:', response)
  } catch (e) {
    alert('发送验证码失败，请稍后重试')
    throw e
  }
}

export async function resetPassword(request: ResetPasswordRequest): Promise<void> {
  try {
    console.log('重置密码请求:', request)
    const response = await resetPasswordApi(request)
    console.log('重置密码响应:', response)
    if (response.message !== '密码重置成功') {
      alert(response.message)
      throw new Error(response.message)
    }
  } catch (e) {
    alert('重置密码失败，请重试')
    throw e
  }
}

export async function logout(): Promise<void> {
  try {
    console.log('执行登出操作')
    const response = await logoutApi()
    console.log('登出响应:', response)
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('savedEmail')
    localStorage.removeItem('savedPassword')
    localStorage.removeItem('expiration')
    
    // 重置用户模型
    userModel.username = ''
    userModel.email = ''
    userModel.token = ''
    userModel.expiration = ''
    userModel.isLoggedIn = false
    
    // 重定向到登录页面
    window.location.href = '/login'
  } catch (e) {
    console.error('登出失败:', e)
    throw e
  }
} 