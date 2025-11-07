import { describe, it, expect } from 'vitest'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyRequest,
  VerifyResponse,
  ForgotPasswordSendCodeRequest,
  ForgotPasswordSendCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  LogoutResponse
} from '../auth'

describe('Auth Interfaces', () => {
  describe('LoginRequest', () => {
    it('应该接受有效的登录请求对象', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      }
      
      expect(loginRequest.email).toBe('test@example.com')
      expect(loginRequest.password).toBe('password123')
      expect(loginRequest.rememberMe).toBe(true)
    })

    it('应该要求所有必填字段', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      }
      
      expect(typeof loginRequest.email).toBe('string')
      expect(typeof loginRequest.password).toBe('string')
      expect(typeof loginRequest.rememberMe).toBe('boolean')
    })
  })

  describe('LoginResponse', () => {
    it('应该包含所有必需的响应字段', () => {
      const loginResponse: LoginResponse = {
        token: 'jwt-token-123',
        username: 'testuser',
        email: 'test@example.com',
        expiration: '2024-01-01T00:00:00Z',
        userId: 'user-123'
      }
      
      expect(typeof loginResponse.token).toBe('string')
      expect(typeof loginResponse.username).toBe('string')
      expect(typeof loginResponse.email).toBe('string')
      expect(typeof loginResponse.expiration).toBe('string')
      expect(typeof loginResponse.userId).toBe('string')
    })
  })

  describe('RegisterRequest', () => {
    it('应该接受有效的注册请求对象', () => {
      const registerRequest: RegisterRequest = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'newpassword123'
      }
      
      expect(registerRequest.username).toBe('newuser')
      expect(registerRequest.email).toBe('newuser@example.com')
      expect(registerRequest.password).toBe('newpassword123')
    })
  })

  describe('RegisterResponse', () => {
    it('应该包含消息字段', () => {
      const registerResponse: RegisterResponse = {
        message: '注册成功'
      }
      
      expect(typeof registerResponse.message).toBe('string')
    })
  })

  describe('VerifyRequest', () => {
    it('应该包含验证所需的所有字段', () => {
      const verifyRequest: VerifyRequest = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        verificationCode: '123456'
      }
      
      expect(typeof verifyRequest.username).toBe('string')
      expect(typeof verifyRequest.password).toBe('string')
      expect(typeof verifyRequest.email).toBe('string')
      expect(typeof verifyRequest.verificationCode).toBe('string')
    })
  })

  describe('VerifyResponse', () => {
    it('应该包含消息字段', () => {
      const verifyResponse: VerifyResponse = {
        message: '验证成功'
      }
      
      expect(typeof verifyResponse.message).toBe('string')
    })
  })

  describe('ForgotPasswordSendCodeRequest', () => {
    it('应该包含邮箱字段', () => {
      const request: ForgotPasswordSendCodeRequest = {
        email: 'test@example.com'
      }
      
      expect(typeof request.email).toBe('string')
    })
  })

  describe('ForgotPasswordSendCodeResponse', () => {
    it('应该包含消息字段', () => {
      const response: ForgotPasswordSendCodeResponse = {
        message: '验证码已发送'
      }
      
      expect(typeof response.message).toBe('string')
    })
  })

  describe('ResetPasswordRequest', () => {
    it('应该包含重置密码所需的所有字段', () => {
      const request: ResetPasswordRequest = {
        email: 'test@example.com',
        verificationCode: '123456',
        newPassword: 'newpassword123'
      }
      
      expect(typeof request.email).toBe('string')
      expect(typeof request.verificationCode).toBe('string')
      expect(typeof request.newPassword).toBe('string')
    })
  })

  describe('ResetPasswordResponse', () => {
    it('应该包含消息字段', () => {
      const response: ResetPasswordResponse = {
        message: '密码重置成功'
      }
      
      expect(typeof response.message).toBe('string')
    })
  })

  describe('LogoutResponse', () => {
    it('应该包含消息字段', () => {
      const response: LogoutResponse = {
        message: '登出成功'
      }
      
      expect(typeof response.message).toBe('string')
    })
  })

  describe('接口完整性测试', () => {
    it('应该能创建完整的登录流程对象', () => {
      const loginReq: LoginRequest = {
        email: 'user@test.com',
        password: 'pass123',
        rememberMe: true
      }
      
      const loginRes: LoginResponse = {
        token: 'token123',
        username: 'user',
        email: 'user@test.com',
        expiration: '2024-12-31',
        userId: 'id123'
      }
      
      expect(loginReq.email).toBe(loginRes.email)
    })

    it('应该能创建完整的注册流程对象', () => {
      const registerReq: RegisterRequest = {
        username: 'newuser',
        email: 'new@test.com',
        password: 'newpass123'
      }
      
      const registerRes: RegisterResponse = {
        message: '注册成功，请验证邮箱'
      }
      
      const verifyReq: VerifyRequest = {
        username: registerReq.username,
        password: registerReq.password,
        email: registerReq.email,
        verificationCode: '123456'
      }
      
      expect(verifyReq.email).toBe(registerReq.email)
      expect(typeof registerRes.message).toBe('string')
    })

    it('应该能创建完整的密码重置流程对象', () => {
      const sendCodeReq: ForgotPasswordSendCodeRequest = {
        email: 'forgot@test.com'
      }
      
      const resetReq: ResetPasswordRequest = {
        email: sendCodeReq.email,
        verificationCode: '654321',
        newPassword: 'newpass456'
      }
      
      expect(resetReq.email).toBe(sendCodeReq.email)
    })
  })
}) 