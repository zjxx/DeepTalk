import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TimerService } from '../TimerService'

describe('TimerService', () => {
  let service: TimerService
  let mockCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    service = new TimerService()
    mockCallback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    service.stopAllTimers()
    vi.useRealTimers()
  })

  describe('构造函数和初始化', () => {
    it('应该正确初始化服务', () => {
      expect(service).toBeInstanceOf(TimerService)
    })
  })

  describe('主计时器功能', () => {
    it('应该能够启动主计时器', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(5)

      // 验证初始状态
      expect(mockCallback).not.toHaveBeenCalled()

      // 模拟 1 秒过去
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(4)

      // 模拟再过 1 秒
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(3)
    })

    it('应该在时间到达时停止计时器', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(2)

      // 模拟 2 秒过去
      vi.advanceTimersByTime(2000)
      expect(mockCallback).toHaveBeenCalledWith(1)

      // 模拟最后 1 秒
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(0)

      // 验证计时器已停止，再过 1 秒不应有更多调用
      const callCount = mockCallback.mock.calls.length
      vi.advanceTimersByTime(1000)
      expect(mockCallback.mock.calls.length).toBe(callCount)
    })

    it('应该能够手动停止主计时器', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(10)

      // 运行 2 秒
      vi.advanceTimersByTime(2000)
      expect(mockCallback).toHaveBeenCalledWith(8)

      // 手动停止
      service.stopMainTimer()

      // 验证停止后不再调用
      const callCount = mockCallback.mock.calls.length
      vi.advanceTimersByTime(2000)
      expect(mockCallback.mock.calls.length).toBe(callCount)
    })

    it('应该能够重新启动计时器', () => {
      service.onMainTimerTick = mockCallback
      
      // 启动第一个计时器
      service.startMainTimer(5)
      vi.advanceTimersByTime(2000)
      expect(mockCallback).toHaveBeenCalledWith(3)

      // 重新启动新的计时器
      service.startMainTimer(3)
      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(2)
    })

    it('应该在没有回调函数时正常工作', () => {
      service.startMainTimer(2)
      
      // 不应该抛出错误
      expect(() => {
        vi.advanceTimersByTime(3000)
      }).not.toThrow()
    })
  })

  describe('计时器管理', () => {
    it('应该能够停止所有计时器', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(10)

      vi.advanceTimersByTime(2000)
      expect(mockCallback).toHaveBeenCalledWith(8)

      // 停止所有计时器
      service.stopAllTimers()

      // 验证停止后不再调用
      const callCount = mockCallback.mock.calls.length
      vi.advanceTimersByTime(2000)
      expect(mockCallback.mock.calls.length).toBe(callCount)
    })

    it('应该能够安全地多次停止计时器', () => {
      service.startMainTimer(5)
      
      // 多次停止不应该抛出错误
      expect(() => {
        service.stopMainTimer()
        service.stopMainTimer()
        service.stopAllTimers()
        service.stopAllTimers()
      }).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该正确处理 0 秒计时器', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(0)

      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(0)
    })

    it('应该正确处理负数时间', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(-5)

      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(0)
    })

    it('应该正确处理大数值时间', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(1000000)

      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(999999)
    })
  })

  describe('回调函数管理', () => {
    it('应该能够动态更改回调函数', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      service.onMainTimerTick = callback1
      service.startMainTimer(3)

      vi.advanceTimersByTime(1000)
      expect(callback1).toHaveBeenCalledWith(2)
      expect(callback2).not.toHaveBeenCalled()

      // 更改回调函数
      service.onMainTimerTick = callback2

      vi.advanceTimersByTime(1000)
      expect(callback1).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledWith(1)
    })

    it('应该能够移除回调函数', () => {
      service.onMainTimerTick = mockCallback
      service.startMainTimer(3)

      vi.advanceTimersByTime(1000)
      expect(mockCallback).toHaveBeenCalledWith(2)

      // 移除回调函数
      service.onMainTimerTick = undefined

      // 不应该抛出错误
      expect(() => {
        vi.advanceTimersByTime(1000)
      }).not.toThrow()
    })
  })
}) 