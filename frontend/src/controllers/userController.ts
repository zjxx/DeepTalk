import userModel from '../models/user'
import { loginApi } from '../api/user'
import type { LoginRequest, LoginResponse } from '../interface/auth'

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