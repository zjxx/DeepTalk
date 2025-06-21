import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MODEL_PATHS, DEFAULT_MODEL_PATH, getModelPath, initLive2DModel } from '../live2d'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'

// Mock PIXI and Live2DModel
vi.mock('pixi.js', () => ({
  Ticker: {},
  Application: class MockApplication {
    stage = {
      addChild: vi.fn()
    }
    renderer = {
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn()
      }
    }
  },
  InteractionEvent: class MockInteractionEvent {
    data = {
      getLocalPosition: vi.fn()
    }
  }
}))

vi.mock('pixi-live2d-display', () => ({
  Live2DModel: {
    registerTicker: vi.fn(),
    from: vi.fn()
  }
}))

describe('live2d utils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('MODEL_PATHS', () => {
    it('应该包含所有预定义的模型路径', () => {
      expect(MODEL_PATHS).toEqual({
        '1': '/live2d/Mahiro_GG/Mahiro_V1.model3.json',
        '2': '/live2d/miku/runtime/miku.model3.json',
        '3': '/live2d/Nahida_1080/Nahida_1080.model3.json'
      })
    })
  })

  describe('DEFAULT_MODEL_PATH', () => {
    it('应该设置正确的默认模型路径', () => {
      expect(DEFAULT_MODEL_PATH).toBe('/live2d/miku/runtime/miku.model3.json')
    })
  })

  describe('getModelPath', () => {
    it('应该返回对应产品ID的模型路径', () => {
      expect(getModelPath('1')).toBe('/live2d/Mahiro_GG/Mahiro_V1.model3.json')
      expect(getModelPath('2')).toBe('/live2d/miku/runtime/miku.model3.json')
      expect(getModelPath('3')).toBe('/live2d/Nahida_1080/Nahida_1080.model3.json')
    })

    it('应该为未知产品ID返回默认路径', () => {
      expect(getModelPath('unknown')).toBe(DEFAULT_MODEL_PATH)
      expect(getModelPath('')).toBe(DEFAULT_MODEL_PATH)
      expect(getModelPath('999')).toBe(DEFAULT_MODEL_PATH)
    })
  })

  describe('initLive2DModel', () => {
    let mockApp: ReturnType<typeof PIXI.Application>
    let mockModel: Record<string, unknown>

    beforeEach(() => {
      mockModel = {
        scale: {
          set: vi.fn()
        },
        x: 0,
        y: 0,
        buttonMode: false,
        registerInteraction: vi.fn(),
        on: vi.fn()
      }

      mockApp = new PIXI.Application() as ReturnType<typeof PIXI.Application>
      vi.mocked(Live2DModel.from).mockResolvedValue(mockModel)
    })

    it('应该成功初始化Live2D模型', async () => {
      const config = {
        app: mockApp,
        modelPath: '/test/model.json',
        position: { x: 100, y: 200, scale: 0.5 }
      }

      const result = await initLive2DModel(config)

      expect(Live2DModel.from).toHaveBeenCalledWith('/test/model.json')
      expect(mockModel.scale.set).toHaveBeenCalledWith(0.5)
      expect(mockModel.x).toBe(100)
      expect(mockModel.y).toBe(200)
      expect(mockApp.stage.addChild).toHaveBeenCalledWith(mockModel)
      expect(result).toBe(mockModel)
    })

    it('应该使用默认位置参数', async () => {
      const config = {
        app: mockApp,
        modelPath: '/test/model.json'
      }

      await initLive2DModel(config)

      expect(mockModel.scale.set).toHaveBeenCalledWith(0.25)
      expect(mockModel.x).toBe(0)
      expect(mockModel.y).toBe(0)
    })

    it('应该注册交互事件', async () => {
      const config = {
        app: mockApp,
        modelPath: '/test/model.json'
      }

      await initLive2DModel(config)

      expect(mockModel.registerInteraction).toHaveBeenCalledWith(mockApp.renderer.events)
    })

    it('应该设置拖拽功能', async () => {
      const config = {
        app: mockApp,
        modelPath: '/test/model.json'
      }

      await initLive2DModel(config)

      expect(mockModel.buttonMode).toBe(true)
      expect(mockModel.on).toHaveBeenCalledWith('pointerdown', expect.any(Function))
      expect(mockModel.on).toHaveBeenCalledWith('pointermove', expect.any(Function))
      expect(mockModel.on).toHaveBeenCalledWith('pointerup', expect.any(Function))
      expect(mockModel.on).toHaveBeenCalledWith('pointerupoutside', expect.any(Function))
    })

    it('应该设置点击事件监听', async () => {
      const config = {
        app: mockApp,
        modelPath: '/test/model.json'
      }

      await initLive2DModel(config)

      expect(mockModel.on).toHaveBeenCalledWith('hit', expect.any(Function))
    })

    it('应该处理没有交互管理器的情况', async () => {
      const mockAppNoEvents = {
        stage: {
          addChild: vi.fn()
        },
        renderer: {}
      } as unknown as ReturnType<typeof PIXI.Application>

      const config = {
        app: mockAppNoEvents,
        modelPath: '/test/model.json'
      }

      await initLive2DModel(config)

      expect(mockModel.registerInteraction).not.toHaveBeenCalled()
    })

    it('应该处理模型加载失败的情况', async () => {
      const error = new Error('模型加载失败')
      vi.mocked(Live2DModel.from).mockRejectedValue(error)

      const config = {
        app: mockApp,
        modelPath: '/test/model.json'
      }

      await expect(initLive2DModel(config)).rejects.toThrow('模型加载失败')
      expect(console.error).toHaveBeenCalledWith('加载模型失败:', error)
    })

    describe('拖拽事件处理', () => {
      let pointerdownHandler: (event: unknown) => void
      let pointermoveHandler: (event: unknown) => void
      let pointerupHandler: () => void
      let pointerupoutsideHandler: () => void

      beforeEach(async () => {
        const config = {
          app: mockApp,
          modelPath: '/test/model.json'
        }

        await initLive2DModel(config)

        // 获取事件处理器
        const onCalls = (mockModel.on as ReturnType<typeof vi.fn>).mock.calls
        pointerdownHandler = onCalls.find(([event]: [string, (event: unknown) => void]) => event === 'pointerdown')[1]
        pointermoveHandler = onCalls.find(([event]: [string, (event: unknown) => void]) => event === 'pointermove')[1]
        pointerupHandler = onCalls.find(([event]: [string, () => void]) => event === 'pointerup')[1]
        pointerupoutsideHandler = onCalls.find(([event]: [string, () => void]) => event === 'pointerupoutside')[1]
      })

      it('应该处理pointerdown事件', () => {
        const mockEvent = {
          data: {
            getLocalPosition: vi.fn().mockReturnValue({ x: 150, y: 250 })
          }
        }

        mockModel.x = 100
        mockModel.y = 200

        pointerdownHandler(mockEvent)

        expect(mockEvent.data.getLocalPosition).toHaveBeenCalledWith(mockApp.stage)
      })

      it('应该处理pointermove事件', () => {
        // 先触发pointerdown
        const downEvent = {
          data: {
            getLocalPosition: vi.fn().mockReturnValue({ x: 150, y: 250 })
          }
        }
        mockModel.x = 100
        mockModel.y = 200
        pointerdownHandler(downEvent)

        // 然后触发pointermove
        const moveEvent = {
          data: {
            getLocalPosition: vi.fn().mockReturnValue({ x: 200, y: 300 })
          }
        }
        pointermoveHandler(moveEvent)

        expect(moveEvent.data.getLocalPosition).toHaveBeenCalledWith(mockApp.stage)
      })

      it('应该处理pointerup事件', () => {
        pointerupHandler()
        // 这个测试主要确保函数可以正常调用而不抛出错误
        expect(true).toBe(true)
      })

      it('应该处理pointerupoutside事件', () => {
        pointerupoutsideHandler()
        // 这个测试主要确保函数可以正常调用而不抛出错误
        expect(true).toBe(true)
      })
    })

    describe('hit事件处理', () => {
      let hitHandler: (hitAreas: string[]) => void

      beforeEach(async () => {
        const config = {
          app: mockApp,
          modelPath: '/test/model.json'
        }

        await initLive2DModel(config)

        // 获取hit事件处理器
        const onCalls = (mockModel.on as ReturnType<typeof vi.fn>).mock.calls
        hitHandler = onCalls.find(([event]: [string, (hitAreas: string[]) => void]) => event === 'hit')[1]
      })

      it('应该处理hit事件并记录日志', () => {
        const hitAreas = ['body', 'head']
        
        hitHandler(hitAreas)

        expect(console.log).toHaveBeenCalledWith('点击区域:', hitAreas)
      })
    })
  })
}) 