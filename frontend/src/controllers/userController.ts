import userModel from '../models/user'
import { loginApi } from '../api/user'

interface LoginResponse {
  token: string;
}

export async function login(
  email: string, 
  password: string, 
  rememberMe: boolean
): Promise<void> {
  try {
    const res: LoginResponse = await loginApi(email, password)
    userModel.email = email
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