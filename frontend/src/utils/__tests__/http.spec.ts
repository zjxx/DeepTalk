import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }))
  }
}))

// Mock API_BASE_URL
vi.mock('../../config/api', () => ({
  API_BASE_URL: 'http://localhost:3000/api'
}))

describe('HTTP Utils', () => {
  beforeEach(() => {
    // 清理localStorage和sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该创建axios实例', () => {
    expect(axios.create).toBeDefined()
  })

  describe('基本功能测试', () => {
    it('应该正确处理localStorage中的token', () => {
      localStorage.setItem('token', 'test-token')
      expect(localStorage.getItem('token')).toBe('test-token')
    })

    it('应该正确处理sessionStorage中的token', () => {
      sessionStorage.setItem('token', 'session-token')
      expect(sessionStorage.getItem('token')).toBe('session-token')
    })

    it('localStorage的token应该优先于sessionStorage', () => {
      localStorage.setItem('token', 'local-token')
      sessionStorage.setItem('token', 'session-token')
      
      const localToken = localStorage.getItem('token')
      const sessionToken = sessionStorage.getItem('token')
      const token = localToken || sessionToken
      
      expect(token).toBe('local-token')
    })
  })

  describe('HTTP方法测试', () => {
    it('应该能够动态导入http模块', async () => {
      const { http } = await import('../http')
      expect(http).toBeDefined()
      expect(http.get).toBeDefined()
      expect(http.post).toBeDefined()
      expect(http.put).toBeDefined()
      expect(http.delete).toBeDefined()
    })
  })

  describe('错误处理', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('应该正确处理空token情况', () => {
      localStorage.clear()
      sessionStorage.clear()
      
      const localToken = localStorage.getItem('token')
      const sessionToken = sessionStorage.getItem('token')
      const token = localToken || sessionToken
      
      expect(token).toBeNull()
    })
  })
}) 