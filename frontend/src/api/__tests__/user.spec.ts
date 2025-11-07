import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  loginApi, 
  sendVerificationCodeApi, 
  verifyApi, 
  logoutApi, 
  sendForgotPasswordCodeApi, 
  verifyForgotPasswordCodeApi, 
  resetPasswordApi 
} from '../user'
import { http } from '../../utils/http'

// Mock http module
vi.mock('../../utils/http', () => ({
  http: {
    post: vi.fn()
  }
}))

// Mock API_ENDPOINTS
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REGISTER: {
        CHECK: '/api/auth/register/check',
        VERIFY: '/api/auth/register/verify'
      },
      FORGOT_PASSWORD: {
        SEND_CODE: '/api/auth/forgot-password/send-code',
        VERIFY_CODE: '/api/auth/forgot-password/verify-code',
        RESET_PASSWORD: '/api/auth/forgot-password/reset-password'
      }
    }
  }
}))

describe('User API', () => {
  const mockHttp = vi.mocked(http)

  beforeEach(() => {
    // 清理localStorage
    localStorage.clear()
    // 模拟console方法
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('loginApi', () => {
    it('应该发送登录请求', async () => {
      const loginRequest = {
        username: 'testuser',
        password: 'password123'
      }
      const mockResponse = {
        token: 'mock-token',
        user: { id: '1', username: 'testuser' }
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await loginApi(loginRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/login', loginRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的登录数据:', JSON.stringify(loginRequest))
    })

    it('应该处理登录错误', async () => {
      const loginRequest = {
        username: 'testuser',
        password: 'wrongpassword'
      }
      const mockError = new Error('登录失败')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(loginApi(loginRequest)).rejects.toThrow('登录失败')
    })
  })

  describe('sendVerificationCodeApi', () => {
    it('应该发送验证码请求', async () => {
      const email = 'test@example.com'
      const username = 'testuser'
      const password = 'password123'
      const mockResponse = { message: '验证码已发送' }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await sendVerificationCodeApi(email, username, password)

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/api/auth/register/check',
        { email, username, password }
      )
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送注册检查请求:', { email, username, password })
    })
  })

  describe('verifyApi', () => {
    it('应该验证验证码', async () => {
      const verifyRequest = {
        email: 'test@example.com',
        verificationCode: '123456'
      }
      const mockResponse = {
        success: true,
        message: '验证成功'
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await verifyApi(verifyRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/register/verify', verifyRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('验证码验证请求:', JSON.stringify(verifyRequest))
    })
  })

  describe('logoutApi', () => {
    it('应该发送登出请求并处理字符串响应', async () => {
      localStorage.setItem('token', 'test-token')
      const mockResponse = '登出成功'

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await logoutApi()

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/logout')
      expect(result).toEqual({ message: '登出成功' })
      expect(console.log).toHaveBeenCalledWith('准备发送退出登录请求')
      expect(console.log).toHaveBeenCalledWith('当前token:', 'test-token')
    })

    it('应该处理对象响应', async () => {
      const mockResponse = { message: '登出成功', status: 'ok' }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await logoutApi()

      expect(result).toEqual(mockResponse)
    })

    it('应该处理登出错误', async () => {
      const mockError = new Error('登出失败')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(logoutApi()).rejects.toThrow('登出失败')
      expect(console.error).toHaveBeenCalledWith('登出API错误:', mockError)
    })
  })

  describe('sendForgotPasswordCodeApi', () => {
    it('应该发送忘记密码验证码请求', async () => {
      const request = { email: 'test@example.com' }
      const mockResponse = { message: '验证码已发送' }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await sendForgotPasswordCodeApi(request)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/forgot-password/send-code', request)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送重置密码验证码请求:', request)
    })
  })

  describe('verifyForgotPasswordCodeApi', () => {
    it('应该验证忘记密码验证码', async () => {
      const request = {
        email: 'test@example.com',
        verificationCode: '123456'
      }
      const mockResponse = { resetToken: 'reset-token-123' }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await verifyForgotPasswordCodeApi(request)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/auth/forgot-password/verify-code', request)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('验证重置密码验证码请求:', request)
    })
  })

  describe('resetPasswordApi', () => {
    it('应该重置密码', async () => {
      const request = {
        resetToken: 'reset-token-123',
        newPassword: 'newpassword123'
      }
      const mockResponse = { message: '密码重置成功' }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await resetPasswordApi(request)

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/api/auth/forgot-password/reset-password',
        request,
        { validateStatus: expect.any(Function) }
      )
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('重置密码请求:', request)
    })
  })
}) 