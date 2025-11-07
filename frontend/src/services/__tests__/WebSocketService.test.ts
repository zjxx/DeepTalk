import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WebSocketService } from '../WebSocketService'

// 定义具体的事件监听器类型
type WebSocketEventData = Record<string, unknown>

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  url: string
  readyState: number = MockWebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string) {
    this.url = url
    // 模拟异步连接
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 0)
  }

  send(_data: string) {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
      console.log(_data)
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close'))
    }
  }
}

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  onloadend: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null

  readAsDataURL(_blob: Blob) {
    setTimeout(() => {
      console.log(_blob)
      this.result = 'data:audio/webm;base64,dGVzdERhdGE='
      if (this.onloadend) {
        this.onloadend({} as ProgressEvent<FileReader>)
      }
    }, 0)
  }
}

// Setup global mocks
global.WebSocket = MockWebSocket as unknown as typeof WebSocket
global.FileReader = MockFileReader as unknown as typeof FileReader

describe('WebSocketService', () => {
  let service: WebSocketService
  const testUrl = 'ws://localhost:8080'

  beforeEach(() => {
    service = new WebSocketService(testUrl)
  })

  afterEach(() => {
    service.disconnect()
  })

  describe('构造函数和初始化', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeInstanceOf(WebSocketService)
      expect(service.getIsConnected()).toBe(false)
      expect(service.userId).toMatch(/^user_[a-z0-9]{9}$/)
    })
  })

  describe('连接管理', () => {
    it('应该能够成功连接', async () => {
      await service.connect()
      expect(service.getIsConnected()).toBe(true)
    })

    it('应该在已连接时返回 resolved promise', async () => {
      await service.connect()
      await expect(service.connect()).resolves.toBeUndefined()
    })

    it('应该能够断开连接', async () => {
      await service.connect()
      service.disconnect()
      expect(service.getIsConnected()).toBe(false)
    })
  })

  describe('事件监听', () => {
    it('应该能够注册事件监听器', () => {
      const callback = vi.fn()
      service.on('test', callback)
      
      // 通过私有方法触发事件来测试
      ;(service as unknown as { emit: (event: string, ...args: unknown[]) => void }).emit('test', 'data')
      expect(callback).toHaveBeenCalledWith('data')
    })

    it('应该能够注册多个监听器', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      service.on('test', callback1)
      service.on('test', callback2)
      
      ;(service as unknown as { emit: (event: string, ...args: unknown[]) => void }).emit('test', 'data')
      expect(callback1).toHaveBeenCalledWith('data')
      expect(callback2).toHaveBeenCalledWith('data')
    })
  })

  describe('消息发送', () => {
    it('应该在连接状态下发送消息', async () => {
      await service.connect()
      const ws = (service as unknown as { ws: MockWebSocket }).ws
      const sendSpy = vi.spyOn(ws, 'send')
      
      ;(service as unknown as { send: (data: WebSocketEventData) => void }).send({ type: 'test', data: 'hello' })
      
      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({ type: 'test', data: 'hello' })
      )
    })

    it('应该在未连接状态下不发送消息', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      ;(service as unknown as { send: (data: WebSocketEventData) => void }).send({ type: 'test' })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'WebSocket is not open. Cannot send data.'
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('音频发送', () => {

    it('应该在未连接时不发送音频', async () => {
      const audioBlob = new Blob(['test'], { type: 'audio/webm' })
      
      await expect(service.sendAudio(audioBlob)).resolves.toBeUndefined()
    })
  })

  describe('Blob 转 Base64', () => {
    it('应该正确转换 Blob 为 Base64', async () => {
      const blob = new Blob(['test'], { type: 'audio/webm' })
      const base64 = await (service as unknown as { blobToBase64: (blob: Blob) => Promise<string> }).blobToBase64(blob)
      
      expect(base64).toBe('dGVzdERhdGE=')
    })
  })

  describe('用户加入', () => {
    it('应该在连接时发送用户加入消息', async () => {
      const ws = new MockWebSocket(testUrl)
      const sendSpy = vi.spyOn(ws, 'send')
      
      // 手动设置 ws 来测试
      ;(service as unknown as { ws: MockWebSocket }).ws = ws
      ws.readyState = MockWebSocket.OPEN
      
      ;(service as unknown as { sendUserJoin: () => void }).sendUserJoin()
      
      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'user_join',
          userId: service.userId,
          userName: `用户${service.userId.slice(-4)}`
        })
      )
    })
  })
}) 