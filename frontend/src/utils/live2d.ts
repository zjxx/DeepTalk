import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import type { Live2DModel as Live2DModelType } from 'pixi-live2d-display'

Live2DModel.registerTicker(PIXI.Ticker);

// Live2D 模型路径映射
export const MODEL_PATHS: Record<string, string> = {
  '1': '/live2d/Mahiro_GG/Mahiro_V1.model3.json',  // 真寻
  '2': '/live2d/miku/runtime/miku.model3.json',     // miku
  '3': '/live2d/Nahida_1080/Nahida_1080.model3.json' // 纳西妲
}

// 默认模型路径
export const DEFAULT_MODEL_PATH = '/live2d/miku/runtime/miku.model3.json'

// 根据产品ID获取对应的模型路径
export const getModelPath = (productId: string): string => {
  return MODEL_PATHS[productId] || DEFAULT_MODEL_PATH
}

interface ExtendedRenderer extends PIXI.Renderer {
  events?: PIXI.InteractionManager
}

export interface ModelConfig {
  modelPath: string
  position?: {
    x?: number
    y?: number
    scale?: number
  }
}

export interface ModelConfigSharedApp extends Omit<ModelConfig, 'width' | 'height' | 'transparent' | 'canvasId'> {
  app: PIXI.Application;
}

/**
 * 初始化 Live2D 模型并将其添加到提供的 PIXI 应用中
 * @param config 模型配置，包含 PIXI 应用实例
 * @returns 加载的 Live2D 模型对象
 */
export async function initLive2DModel(config: ModelConfigSharedApp): Promise<Live2DModelType> {
  const {
    app,
    modelPath,
    position = { x: 0, y: 0, scale: 0.25 },
  } = config

  try {
    // 加载模型
    const model = await Live2DModel.from(modelPath)
    
    // 设置模型位置和缩放
    model.scale.set(position.scale || 0.25)
    model.x = position.x || 0
    model.y = position.y || 0
    
    // 添加到舞台
    app.stage.addChild(model)

    // 注册交互事件
    const renderer = app.renderer as ExtendedRenderer
    if (renderer.events) {
      model.registerInteraction(renderer.events)
    }

    // 添加拖拽功能
    model.buttonMode = true
    let isDragging = false
    let dragPoint = { x: 0, y: 0 }

    model.on('pointerdown', (e: PIXI.InteractionEvent) => {
      isDragging = true
      const localPos = e.data.getLocalPosition(app.stage);
      dragPoint = { x: localPos.x - model.x, y: localPos.y - model.y };
    })

    model.on('pointermove', (e: PIXI.InteractionEvent) => {
      if (isDragging) {
        const newPosition = e.data.getLocalPosition(app.stage);
        model.x = newPosition.x - dragPoint.x;
        model.y = newPosition.y - dragPoint.y;
      }
    })

    model.on('pointerup', () => {
      isDragging = false
    })
    model.on('pointerupoutside', () => {
        isDragging = false;
    });

    // 监听模型点击事件
    model.on('hit', (hitAreas: string[]) => {
      console.log('点击区域:', hitAreas)
      // 这里可以添加模型动作触发逻辑
      // if (hitAreas.includes('body')) {
      //   model.motion('tap_body')
      // }
    })

    return model
  } catch (error) {
    console.error('加载模型失败:', error)
    throw error
  }
} 