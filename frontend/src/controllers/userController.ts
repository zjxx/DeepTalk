import userModel from '../models/user'
import { loginApi, sendVerificationCodeApi, verifyApi, sendForgotPasswordCodeApi, resetPasswordApi, logoutApi, verifyForgotPasswordCodeApi } from '../api/user'
import type { LoginRequest, LoginResponse, VerifyRequest } from '../interface/auth'
import { AxiosError } from 'axios'
import axios from 'axios'
import { ref } from 'vue'

// 创建全局头像状态
const userAvatar = ref('https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2')

// 导出头像状态和设置函数
export const getUserAvatar = () => {
  // 优先从 localStorage 中获取头像
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const { avatar } = JSON.parse(userInfo)
    if (avatar) {
      userAvatar.value = avatar
      return avatar
    }
  }
  return userAvatar.value
}

export const setUserAvatar = (newAvatar: string) => {
  // 更新内存中的状态
  userAvatar.value = newAvatar
  // 同时更新 localStorage 中的头像
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    const info = JSON.parse(userInfo)
    info.avatar = newAvatar
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  // 触发自定义事件，通知其他组件头像已更新
  window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { avatar: newAvatar } }))
}

// 添加自动登录函数
export async function autoLogin(): Promise<boolean> {
  try {
    const token = localStorage.getItem('token')
    const savedEmail = localStorage.getItem('savedEmail')
    const savedPassword = localStorage.getItem('savedPassword')
    const expiration = localStorage.getItem('expiration')
    const savedUserInfo = localStorage.getItem('userInfo')
    
    // 只有在有保存的邮箱和密码时才进行自动登录
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
      
      // 如果有保存的用户信息，恢复头像
      if (savedUserInfo) {
        const userInfo = JSON.parse(savedUserInfo)
        if (userInfo.avatar) {
          setUserAvatar(userInfo.avatar)
        }
      }
      
      return true
    }
    
    // 如果没有保存的邮箱和密码，清除所有登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
    return false
  } catch (e) {
    console.error('自动登录失败:', e)
    // 清除无效的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('savedEmail')
    localStorage.removeItem('savedPassword')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userInfo')
    return false
  }
}

export const login = async (request: LoginRequest, rememberMe: boolean): Promise<boolean> => {
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
    userModel.userId = res.userId
    
    if (rememberMe) {
      // 记住我时，保存所有信息
      localStorage.setItem('token', res.token)
      localStorage.setItem('savedEmail', request.email)
      localStorage.setItem('savedPassword', request.password)
      localStorage.setItem('expiration', res.expiration)
      localStorage.setItem('userInfo', JSON.stringify({
        userId: res.userId,
        username: res.username,
        email: res.email,
        avatar: userAvatar.value
      }))
    } else {
      // 不记住我时，只保存当前会话的 token
      sessionStorage.setItem('token', res.token)
      sessionStorage.setItem('expiration', res.expiration)
      sessionStorage.setItem('userInfo', JSON.stringify({
        userId: res.userId,
        username: res.username,
        email: res.email,
        avatar: userAvatar.value
      }))
      // 清除所有本地存储的登录信息
      localStorage.removeItem('token')
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
      localStorage.removeItem('expiration')
      localStorage.removeItem('userInfo')
    }
    
    return true
  } catch (e) {
    alert('登录失败，请检查邮箱和密码')
    console.error('登录失败:', e)
    return false
  }
}

export async function sendVerificationCode(email: string, username: string, password: string): Promise<{ message: string }> {
  try {
    console.log('发送注册检查请求:', { email, username })
    const response = await sendVerificationCodeApi(email, username, password)
    console.log('注册检查响应:', response)
    
    if (typeof response === 'string') {
      return { message: response }
    }
    return response
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e.response) {
        console.log('错误响应:', e.response)
        throw new Error(e.response.data)
      } else if (e.request) {
        throw new Error('网络请求失败，请检查网络连接')
      } else {
        throw new Error(e.message)
      }
    }
    throw e
  }
}

export async function verify(request: VerifyRequest): Promise<void> {
  try {
    console.log('验证码验证请求:', request)
    const response = await verifyApi(request)
    console.log('验证码验证响应:', response)
    
    if (typeof response === 'string') {
      if (response !== '注册成功') {
        throw new Error(response)
      }
    } else if (response.message !== '注册成功') {
      throw new Error(response.message)
    }
  } catch (e) {
    console.error('验证码验证错误:', e)
    if (e instanceof AxiosError) {
      if (e.response) {
        console.log('错误响应:', e.response)
        throw new Error(e.response.data)
      } else if (e.request) {
        throw new Error('网络请求失败，请检查网络连接')
      } else {
        throw new Error(e.message)
      }
    }
    throw e
  }
}

export async function sendForgotPasswordCode(email: string): Promise<void> {
  try {
    console.log('准备发送重置密码验证码到:', email)
    const res = await sendForgotPasswordCodeApi({ email })
    console.log('重置密码验证码发送响应:', res)
    
    // 如果响应是字符串，直接使用
    if (typeof res === 'string') {
      if (res !== '验证码已发送') {
        throw new Error(res)
      }
    } else if (res.message !== '验证码已发送') {
      throw new Error(res.message)
    }
  } catch (e) {
    console.error('发送重置密码验证码失败:', e)
    if (e instanceof AxiosError) {
      if (e.response) {
        console.log('错误响应:', e.response)
        throw new Error(e.response.data || '发送验证码失败，请稍后重试')
      } else if (e.request) {
        throw new Error('网络请求失败，请检查网络连接')
      } else {
        throw new Error('发生错误：' + e.message)
      }
    }
    throw e
  }
}

export async function verifyForgotPasswordCode(email: string, verificationCode: string): Promise<string> {
  try {
    console.log('开始验证重置密码验证码:', { email, verificationCode })
    const response = await verifyForgotPasswordCodeApi({ email, verificationCode })
    console.log('验证码验证响应:', response)
    
    if (response && response.resetToken) {
      return response.resetToken
    }
    throw new Error('验证码验证失败')
  } catch (error) {
    console.error('验证重置密码验证码失败:', error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('验证码验证接口不存在，请联系管理员')
      }
      if (error.response?.status === 400) {
        throw new Error('验证码错误或已过期')
      }
      throw new Error(error.response?.data?.message || '验证码验证失败，请稍后重试')
    }
    throw new Error('验证码验证失败，请稍后重试')
  }
}

export async function resetPassword(resetToken: string, newPassword: string): Promise<void> {
  try {
    console.log('准备重置密码，请求数据:', { resetToken, newPassword })
    const res = await resetPasswordApi({ resetToken, newPassword })
    console.log('重置密码响应:', res)
  } catch (e) {
    console.error('重置密码失败:', e)
    if (e instanceof AxiosError) {
      const errorMessage = e.response?.data?.message || '重置密码失败，请重试'
      throw new Error(errorMessage)
    }
    throw e
  }
}

export async function logout(): Promise<void> {
  try {
    console.log('开始执行登出操作')
    const token = localStorage.getItem('token')
    console.log('当前token:', token)
    
    const response = await logoutApi()
    console.log('登出响应:', response)
    
    // 只有在收到"登出成功"的响应后才执行退出操作
    if (response && response.message === '登出成功') {
      alert('退出成功')
      console.log('收到登出成功响应，开始清理数据')
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('savedEmail')
      localStorage.removeItem('savedPassword')
      localStorage.removeItem('expiration')
      localStorage.removeItem('userInfo')
      
      // 重置用户模型
      userModel.username = ''
      userModel.email = ''
      userModel.token = ''
      userModel.expiration = ''
      userModel.isLoggedIn = false
      
      // 重置头像
      setUserAvatar('https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2')
      
      console.log('数据清理完成，准备跳转到登录页')
      window.location.href = '/login'
    } else {
      throw new Error('登出失败：服务器未返回成功响应')
    }
  } catch (error) {
    console.error('登出失败:', error)
    if (axios.isAxiosError(error)) {
      console.log('错误响应:', error.response)
      if (error.response?.status === 400) {
        throw new Error('登出失败：' + (error.response.data?.message || '未知错误'))
      }
      throw new Error('登出失败：' + (error.response?.data?.message || '网络错误'))
    }
    throw error
  }
} 