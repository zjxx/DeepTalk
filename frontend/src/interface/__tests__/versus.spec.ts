import { describe, it, expect } from 'vitest'
import type { ConnectResponse, ConnectRequest } from '../versus'

describe('Versus Interfaces', () => {
  describe('ConnectResponse', () => {
    it('应该包含会话ID和对手ID', () => {
      const response: ConnectResponse = {
        sessionId: 'session-123',
        opponentId: 'opponent-456'
      }
      
      expect(typeof response.sessionId).toBe('string')
      expect(typeof response.opponentId).toBe('string')
      expect(response.sessionId).toBe('session-123')
      expect(response.opponentId).toBe('opponent-456')
    })

    it('应该接受各种格式的ID', () => {
      const response: ConnectResponse = {
        sessionId: 'uuid-v4-session-id',
        opponentId: 'user-12345'
      }
      
      expect(response.sessionId.length).toBeGreaterThan(0)
      expect(response.opponentId.length).toBeGreaterThan(0)
    })
  })

  describe('ConnectRequest', () => {
    it('应该包含用户ID', () => {
      const request: ConnectRequest = {
        userId: 'user-789'
      }
      
      expect(typeof request.userId).toBe('string')
      expect(request.userId).toBe('user-789')
    })

    it('应该接受不同格式的用户ID', () => {
      const requests: ConnectRequest[] = [
        { userId: 'user-123' },
        { userId: 'uuid-format-id' },
        { userId: '12345' },
        { userId: 'email@example.com' }
      ]
      
      requests.forEach(request => {
        expect(typeof request.userId).toBe('string')
        expect(request.userId.length).toBeGreaterThan(0)
      })
    })
  })

  describe('接口交互测试', () => {
    it('应该支持完整的连接流程', () => {
      const request: ConnectRequest = {
        userId: 'user-123'
      }
      
      const response: ConnectResponse = {
        sessionId: 'session-456',
        opponentId: 'opponent-789'
      }
      
      // 验证请求和响应的数据完整性
      expect(request.userId).toBeDefined()
      expect(response.sessionId).toBeDefined()
      expect(response.opponentId).toBeDefined()
      
      // 验证响应中的对手ID不等于请求中的用户ID
      expect(response.opponentId).not.toBe(request.userId)
    })

    it('应该支持WebSocket连接场景', () => {

      
      const connectResponse: ConnectResponse = {
        sessionId: 'ws-session-002',
        opponentId: 'ws-opponent-003'
      }
      
      // 模拟WebSocket连接响应
      expect(connectResponse.sessionId).toMatch(/^ws-session/)
      expect(connectResponse.opponentId).toMatch(/^ws-opponent/)
    })
  })

  describe('数据验证', () => {
    it('ConnectRequest不应该包含空字符串', () => {
      const validRequest: ConnectRequest = {
        userId: 'valid-user-id'
      }
      
      expect(validRequest.userId.trim().length).toBeGreaterThan(0)
    })

    it('ConnectResponse应该包含有效的ID', () => {
      const response: ConnectResponse = {
        sessionId: 'valid-session-id',
        opponentId: 'valid-opponent-id'
      }
      
      expect(response.sessionId.trim().length).toBeGreaterThan(0)
      expect(response.opponentId.trim().length).toBeGreaterThan(0)
    })

    it('应该支持长ID格式', () => {
      const longId = 'very-long-user-id-with-many-characters-and-numbers-12345'
      const request: ConnectRequest = {
        userId: longId
      }
      
      expect(request.userId).toBe(longId)
      expect(request.userId.length).toBe(longId.length)
    })
  })
}) 