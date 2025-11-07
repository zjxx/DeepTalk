import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { connectWebSocketApi } from '../versusAPI'
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
    VERSUS: {
      CONNECT: '/api/versus/connect'
    }
  }
}))

describe('Versus API', () => {
  const mockHttp = vi.mocked(http)

  beforeEach(() => {
    // 清理模拟
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('connectWebSocketApi', () => {
    it('应该建立WebSocket连接', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockResponse = {
        sessionId: 'session456',
        opponentId: 'opponent789',
        status: 'connected'
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await connectWebSocketApi(connectRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/versus/connect', connectRequest)
      expect(result).toEqual(mockResponse)
    })

    it('应该处理连接失败的情况', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockError = new Error('连接失败')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('连接失败')
    })

    it('应该处理无对手的情况', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockResponse = {
        sessionId: 'session456',
        opponentId: null,
        status: 'waiting'
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await connectWebSocketApi(connectRequest)

      expect(result.opponentId).toBeNull()
      expect(result.status).toBe('waiting')
    })

    it('应该处理服务器满载的情况', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockError = new Error('服务器满载，请稍后重试')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('服务器满载，请稍后重试')
    })

    it('应该处理用户已在游戏中的情况', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockError = new Error('用户已在游戏中')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('用户已在游戏中')
    })

    it('应该处理网络超时', async () => {
      const connectRequest = {
        userId: 'user123'
      }
      const mockError = new Error('请求超时')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('请求超时')
    })

    it('应该返回有效的连接数据', async () => {
      const connectRequest = {
        userId: 'user456'
      }
      const mockResponse = {
        sessionId: 'valid_session_123',
        opponentId: 'opponent_456',
        status: 'matched',
        roomId: 'room_789',
        gameMode: 'ranked'
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await connectWebSocketApi(connectRequest)

      expect(result.sessionId).toBeTruthy()
      expect(result.opponentId).toBeTruthy()
      expect(result.status).toBe('matched')
      expect(result).toHaveProperty('roomId')
      expect(result).toHaveProperty('gameMode')
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的用户ID', async () => {
      const connectRequest = {
        userId: ''
      }
      const mockError = new Error('用户ID不能为空')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('用户ID不能为空')
    })

    it('应该处理用户不存在', async () => {
      const connectRequest = {
        userId: 'nonexistent_user'
      }
      const mockError = new Error('用户不存在')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('用户不存在')
    })

    it('应该处理权限不足', async () => {
      const connectRequest = {
        userId: 'restricted_user'
      }
      const mockError = new Error('权限不足')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(connectWebSocketApi(connectRequest)).rejects.toThrow('权限不足')
    })
  })
}) 