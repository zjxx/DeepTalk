import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AIService } from '../AIService'

describe('AIService', () => {
  let service: AIService
  let mockSpeakingStateChange: ReturnType<typeof vi.fn>
  let mockResponseGenerated: ReturnType<typeof vi.fn>

  beforeEach(() => {
    service = new AIService()
    mockSpeakingStateChange = vi.fn()
    mockResponseGenerated = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    service.cleanup()
    vi.useRealTimers()
  })

  describe('构造函数和初始化', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeInstanceOf(AIService)
    })
  })

  describe('AI 发言功能', () => {
    it('应该能够开始发言', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange
      service.onResponseGenerated = mockResponseGenerated

      service.startSpeaking()

      // 等待初始延迟 (1秒)
      vi.advanceTimersByTime(1000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 模拟发言时间，需要加上随机时间（5-15秒）
      // 由于是随机的，我们模拟最大时间 15 秒
      vi.advanceTimersByTime(15000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)
      expect(mockResponseGenerated).toHaveBeenCalled()
    })

    it('应该生成有效的 AI 回复', () => {
      service.onResponseGenerated = mockResponseGenerated

      service.startSpeaking()

      // 等待完整的发言周期 (1秒初始延迟 + 最大15秒发言)
      vi.advanceTimersByTime(16000)

      expect(mockResponseGenerated).toHaveBeenCalled()
      const response = mockResponseGenerated.mock.calls[0][0]
      expect(typeof response).toBe('string')
      expect(response.length).toBeGreaterThan(0)
    })

    it('应该生成预定义回复中的一个', () => {
      const expectedResponses = [
        "That's a very interesting perspective. Could you tell me more about your experience with this?",
        "I understand your point. Have you considered the alternative viewpoint?",
        "That's a great example. How do you think this applies in different situations?",
        "Very thoughtful response. What do you think are the main challenges in this area?",
        "I see what you mean. How has this changed over the years in your opinion?"
      ]

      service.onResponseGenerated = mockResponseGenerated

      service.startSpeaking()
      vi.advanceTimersByTime(16000)

      expect(mockResponseGenerated).toHaveBeenCalled()
      const response = mockResponseGenerated.mock.calls[0][0]
      expect(expectedResponses).toContain(response)
    })

    it('应该能够停止发言', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      vi.advanceTimersByTime(1000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 重置 mock 来清楚计数
      mockSpeakingStateChange.mockClear()

      // 手动停止发言
      service.stopSpeaking()
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)

      // 验证不会再有状态变化
      const callCount = mockSpeakingStateChange.mock.calls.length
      vi.advanceTimersByTime(20000)
      expect(mockSpeakingStateChange.mock.calls.length).toBe(callCount)
    })

    it('应该能够重新开始发言', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange

      // 第一次发言
      service.startSpeaking()
      vi.advanceTimersByTime(2000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 重新开始发言（应该停止之前的并开始新的）
      service.startSpeaking()
      
      // 检查是否先调用了 false（stopSpeaking），然后等待新的开始
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)
      
      vi.advanceTimersByTime(1000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)
    })

    it('应该在没有回调函数时正常工作', () => {
      // 不设置回调函数
      expect(() => {
        service.startSpeaking()
        vi.advanceTimersByTime(20000)
      }).not.toThrow()
    })
  })

  describe('发言时间控制', () => {
    it('应该有随机的发言时长', () => {
      // Mock Math.random 来测试固定的发言时长
      const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      vi.advanceTimersByTime(1000) // 初始延迟
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 清除之前的调用记录
      mockSpeakingStateChange.mockClear()

      // 应该在 10秒（5000 + 0.5 * 10000）后停止
      vi.advanceTimersByTime(9999)
      expect(mockSpeakingStateChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)

      mathRandomSpy.mockRestore()
    })

    it('应该处理最短发言时间', () => {
      const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      vi.advanceTimersByTime(1000) // 初始延迟
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 清除之前的调用记录
      mockSpeakingStateChange.mockClear()

      // 应该在 5秒后停止
      vi.advanceTimersByTime(5000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)

      mathRandomSpy.mockRestore()
    })

    it('应该处理最长发言时间', () => {
      const mathRandomSpy = vi.spyOn(Math, 'random').mockReturnValue(1)
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      vi.advanceTimersByTime(1000) // 初始延迟
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 清除之前的调用记录
      mockSpeakingStateChange.mockClear()

      // 应该在 15秒（5000 + 1 * 10000）后停止
      vi.advanceTimersByTime(14999)
      expect(mockSpeakingStateChange).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)

      mathRandomSpy.mockRestore()
    })
  })

  describe('资源清理', () => {
    it('应该能够清理资源', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      vi.advanceTimersByTime(1000)
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(true)

      // 清理资源
      service.cleanup()
      expect(mockSpeakingStateChange).toHaveBeenCalledWith(false)

      // 验证清理后不会有更多调用
      const callCount = mockSpeakingStateChange.mock.calls.length
      vi.advanceTimersByTime(20000)
      expect(mockSpeakingStateChange.mock.calls.length).toBe(callCount)
    })

    it('应该能够安全地多次清理', () => {
      expect(() => {
        service.cleanup()
        service.cleanup()
      }).not.toThrow()
    })
  })

  describe('回调函数管理', () => {

    it('应该能够动态更改响应回调函数', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      service.onResponseGenerated = callback1
      service.startSpeaking()

      // 在发言过程中更改回调
      vi.advanceTimersByTime(1000)
      service.onResponseGenerated = callback2

      // 完成发言
      vi.advanceTimersByTime(15000)

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalled()
    })

    it('应该能够移除回调函数', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange
      service.onResponseGenerated = mockResponseGenerated

      service.startSpeaking()

      // 移除回调函数
      service.onSpeakingStateChange = undefined
      service.onResponseGenerated = undefined

      // 不应该抛出错误
      expect(() => {
        vi.advanceTimersByTime(20000)
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该正确处理快速连续的开始停止操作', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange

      // 快速开始停止
      service.startSpeaking()
      service.stopSpeaking()
      service.startSpeaking()
      service.stopSpeaking()

      expect(() => {
        vi.advanceTimersByTime(20000)
      }).not.toThrow()
    })

    it('应该正确处理多次开始操作', () => {
      service.onSpeakingStateChange = mockSpeakingStateChange

      service.startSpeaking()
      service.startSpeaking()
      service.startSpeaking()

      expect(() => {
        vi.advanceTimersByTime(20000)
      }).not.toThrow()
    })
  })
}) 