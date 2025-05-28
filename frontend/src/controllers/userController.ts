import userModel from '../models/user'
import { loginApi, registerApi, sendVerificationCodeApi, verifyApi } from '../api/user'
import type { LoginRequest, LoginResponse, RegisterRequest, VerifyRequest } from '../interface/auth'

// 添加自动登录函数
export async function autoLogin(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('savedEmail')
    const savedPassword = localStorage.getItem('savedPassword')
    
    if (token && savedEmail && savedPassword) {
      const loginRequest: LoginRequest = {
        email: savedEmail,
        password: savedPassword
      }
      const res: LoginResponse = await loginApi(loginRequest)
      userModel.email = savedEmail
      userModel.token = res.token
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
    return false
  }
}

export async function login(
  request: LoginRequest,
  rememberMe: boolean
): Promise<void> {
  try {
    console.log('登录请求数据:', request)
    const res: LoginResponse = await loginApi(request)
    console.log('登录响应数据:', res)
    userModel.email = request.email
    userModel.token = res.token
    userModel.isLoggedIn = true
    
    // 记住我逻辑
    if (rememberMe) {
      localStorage.setItem('token', res.token)
      localStorage.setItem('savedEmail', request.email)
      localStorage.setItem('savedPassword', request.password)
    } else {
      // 如果取消记住我，清除保存的信息
      localStorage.removeItem('token')
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
    }
    // 跳转到个人资料页
    window.location.href = '/profile'
  } catch (e) {
    alert('登录失败，请检查邮箱和密码')
    console.error('登录失败:', e)
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

// 暂时注释掉退出登录函数
// export async function logout(email: string): Promise<void> {
//   try {
//     console.log('退出登录:', email)
//     await logoutApi(email)
//     userModel.email = ''
//     userModel.token = ''
//     userModel.isLoggedIn = false
//   } catch (e) {
//     console.error('退出登录失败:', e)
//     throw e
//   }
// } 