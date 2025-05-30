import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'

// 设置全局 PIXI 实例
window.PIXI = PIXI

interface ModelConfig {
  width?: number
  height?: number
  transparent?: boolean
  modelPath: string
  position?: {
    x?: number
    y?: number
    scale?: number
  }
}

export async function initLive2DModel(config: ModelConfig) {
  const {
    width = 280,
    height = 300,
    transparent = true,
    modelPath,
    position = { x: 0, y: 0, scale: 0.25 }
  } = config

  // 构建画布
  const app = new PIXI.Application({
    view: document.getElementById('live2d-canvas') as HTMLCanvasElement,
    autoStart: true,
    width,
    height,
    transparent,
    backgroundColor: 0xffffff
  })

  try {
    // 加载模型
    const model = await Live2DModel.from(modelPath)
    
    // 设置模型位置和缩放
    model.scale.set(position.scale || 0.25)
    model.x = position.x || app.screen.width / 2
    model.y = position.y || app.screen.height / 2
    
    // 添加到舞台
    app.stage.addChild(model)

    // 注册交互事件
    model.registerInteraction(app.renderer.events)

    // 添加拖拽功能
    model.buttonMode = true
    let isDragging = false
    let dragPoint = { x: 0, y: 0 }

    model.on('pointerdown', (e: PIXI.InteractionEvent) => {
      isDragging = true
      dragPoint = e.data.getLocalPosition(model.parent)
    })

    model.on('pointermove', (e: PIXI.InteractionEvent) => {
      if (isDragging) {
        const newPosition = e.data.getLocalPosition(model.parent)
        model.x += (newPosition.x - dragPoint.x)
        model.y += (newPosition.y - dragPoint.y)
        dragPoint = newPosition
      }
    })

    model.on('pointerup', () => {
      isDragging = false
    })

    // 监听模型点击事件
    model.on('hit', (hitAreas: string[]) => {
      console.log('点击区域:', hitAreas)
      // 这里可以添加模型动作触发逻辑
      // if (hitAreas.includes('body')) {
      //   model.motion('tap_body')
      // }
    })

    // 添加窗口大小改变事件
    window.addEventListener('resize', () => {
      const canvas = document.getElementById('live2d-canvas') as HTMLCanvasElement
      if (canvas?.parentElement) {
        app.renderer.resize(
          canvas.parentElement.clientWidth,
          canvas.parentElement.clientHeight
        )
      }
    })

    return { app, model }
  } catch (error) {
    console.error('加载模型失败:', error)
    throw error
  }
} 