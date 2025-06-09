<template>
  <v-app>
    <v-main class="repositories-live2d-main">
      <div class="repositories-live2d-container">
        <!-- 返回按钮区域 -->
        <div class="back-button-area">
          <v-btn variant="text" prepend-icon="mdi-arrow-left" class="back-button" @click="goBack">
            返回
          </v-btn>
        </div>

        <!-- 主要内容区域 - 左右布局 -->
        <div class="main-content-area">
          <!-- 左侧Live2D展示区域 - 宽度0.8 -->
          <div class="live2d-display-area">
            <!-- 商品名称 -->
            <h1 v-if="currentProduct" class="product-title">{{ currentProduct.name }}</h1>

            <!-- 控制按钮 -->
            <div class="live2d-controls">
              <v-btn icon size="small" color="white" variant="elevated" class="control-btn"
                @click="resetModelTransform" title="重置大小和位置">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </div>

            <!-- Live2D模型展示 -->
            <div class="live2d-view-container" ref="pixiContainerRef">
              <!-- PIXI Canvas 将被动态添加到这里 -->
            </div>
          </div>

          <!-- 右侧信息区域 - 宽度0.2 -->
          <div class="right-info-area">
            <!-- 商品信息卡片 -->
            <v-card v-if="currentProduct" class="product-card" elevation="2">
              <v-card-text class="product-details">
                <!-- 商品描述 -->
                <div class="product-description">
                  <h3>商品描述</h3>
                  <p>{{ currentProduct.description }}</p>
                </div>

                <!-- 价格显示 -->
                <div class="price-section">
                  <h3>价格：</h3>
                  <div class="price-display">
                    <span class="price-symbol">¥</span>
                    <span class="price-amount">{{ currentProduct.price }}</span>
                  </div>
                </div>

                <!-- 使用按钮 -->
                <div class="purchase-section">
                  <v-btn color="primary" size="large" variant="elevated" class="purchase-button"
                    :loading="isUsing" @click="handleUse" block>
                    <v-icon left>mdi-check</v-icon>
                    使用模型
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>

            <!-- 加载状态 -->
            <div v-else-if="loading" class="loading-state">
              <v-progress-circular indeterminate></v-progress-circular>
              <p class="mt-4">加载商品信息中...</p>
            </div>

            <!-- 商品不存在 -->
            <div v-else class="empty-state">
              <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
              <p class="mt-4 text-grey">商品不存在</p>
            </div>
          </div>
        </div>

        <!-- 使用成功提示 -->
        <v-snackbar v-model="showSuccessMessage" color="success" timeout="3000" location="top">
          使用成功！
        </v-snackbar>

        <!-- 使用失败提示 -->
        <v-snackbar v-model="showErrorMessage" color="error" timeout="3000" location="top">
          {{ errorMessage }}
        </v-snackbar>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import { useShopController } from '../controllers/ShopController'
import { getModelPath } from '../utils/live2d'

// 配置Live2D
window.PIXI = PIXI

const route = useRoute()
const router = useRouter()

// 使用 ShopController
const {
  productList,
  loading,
  loadShopData,
  useModel
} = useShopController()

// 页面状态
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const live2dModel = ref<Live2DModel | null>(null)
const isUsing = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const errorMessage = ref('')

// 模型交互状态
const modelScale = ref(0.3)
const modelPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const isMouseInContainer = ref(false)
const lastMousePos = ref({ x: 0, y: 0 })

// 清理函数
let resizeCleanup: (() => void) | null = null

// 当前商品
const productId = computed(() => route.params.id as string)
const currentProduct = computed(() =>
  productList.value.find(p => p.id === productId.value)
)

// 获取相对于容器的鼠标位置
const getRelativeMousePos = (event: MouseEvent) => {
  if (!pixiContainerRef.value) return { x: 0, y: 0 }

  const rect = pixiContainerRef.value.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

// 计算模型适应容器的缩放和位置
const calculateModelFit = () => {
  if (!pixiAppInstance.value || !live2dModel.value || !pixiContainerRef.value) return

  const containerWidth = pixiContainerRef.value.clientWidth
  const containerHeight = pixiContainerRef.value.clientHeight

  // 设置一个合适的初始缩放值
  const initialScale = 0.2
  live2dModel.value.scale.set(initialScale)

  // 获取模型边界
  const bounds = live2dModel.value.getBounds()
  const modelWidth = bounds.width * initialScale
  const modelHeight = bounds.height * initialScale

  // 计算适应容器的缩放比例
  const scaleX = (containerWidth * 0.6) / modelWidth
  const scaleY = (containerHeight * 0.6) / modelHeight
  const fitScale = Math.min(scaleX, scaleY, 0.5) // 限制最大缩放比例

  // 应用缩放
  modelScale.value = fitScale
  live2dModel.value.scale.set(fitScale)

  // 设置居中位置
  modelPosition.value = {
    x: containerWidth / 2,
    y: containerHeight / 2
  }

  // 应用位置
  live2dModel.value.position.set(modelPosition.value.x, modelPosition.value.y)
}

// 更新模型变换
const updateModelTransform = () => {
  if (!live2dModel.value) return

  live2dModel.value.scale.set(modelScale.value)
  live2dModel.value.position.set(modelPosition.value.x, modelPosition.value.y)
}

// 处理鼠标滚轮缩放
const handleWheel = (event: WheelEvent) => {
  if (!isMouseInContainer.value || !live2dModel.value) return

  event.preventDefault()

  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(1.0, modelScale.value * delta)) // 限制最大缩放为1.0

  modelScale.value = newScale
  updateModelTransform()
}

// 处理鼠标按下
const handleMouseDown = (event: MouseEvent) => {
  if (!isMouseInContainer.value || !live2dModel.value) return

  event.preventDefault()
  isDragging.value = true

  const mousePos = getRelativeMousePos(event)
  dragStart.value = {
    x: mousePos.x - modelPosition.value.x,
    y: mousePos.y - modelPosition.value.y
  }

  lastMousePos.value = mousePos

  if (pixiContainerRef.value) {
    pixiContainerRef.value.style.cursor = 'grabbing'
  }
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value || !live2dModel.value || !isMouseInContainer.value) return

  event.preventDefault()

  const mousePos = getRelativeMousePos(event)

  modelPosition.value = {
    x: mousePos.x - dragStart.value.x,
    y: mousePos.y - dragStart.value.y
  }

  updateModelTransform()
  lastMousePos.value = mousePos
}

// 处理鼠标释放
const handleMouseUp = () => {
  if (!isDragging.value) return

  isDragging.value = false

  if (pixiContainerRef.value) {
    pixiContainerRef.value.style.cursor = isMouseInContainer.value ? 'grab' : 'default'
  }
}

// 处理鼠标进入容器
const handleMouseEnter = () => {
  isMouseInContainer.value = true

  if (pixiContainerRef.value && !isDragging.value) {
    pixiContainerRef.value.style.cursor = 'grab'
  }
}

// 处理鼠标离开容器
const handleMouseLeave = () => {
  isMouseInContainer.value = false
  isDragging.value = false

  if (pixiContainerRef.value) {
    pixiContainerRef.value.style.cursor = 'default'
  }
}

// 重置模型位置和缩放
const resetModelTransform = () => {
  calculateModelFit()
}

// 初始化PIXI应用和Live2D模型
const initPixiApp = async () => {
  await nextTick()
  if (pixiContainerRef.value && !pixiAppInstance.value) {
    try {
      const app = new PIXI.Application({
        width: pixiContainerRef.value.clientWidth,
        height: pixiContainerRef.value.clientHeight,
        backgroundAlpha: 0,
        autoStart: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })

      pixiContainerRef.value.appendChild(app.view as unknown as Node)
      pixiAppInstance.value = app

      // 添加鼠标事件监听器
      const container = pixiContainerRef.value

      container.style.position = 'relative'
      container.style.overflow = 'hidden'

      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)

      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)

      // 加载Live2D模型
      if (currentProduct.value) {
        await loadLive2DModel()
      }

      // 添加窗口大小变化监听
      const handleResize = () => {
        if (pixiAppInstance.value && pixiContainerRef.value) {
          const newWidth = pixiContainerRef.value.clientWidth
          const newHeight = pixiContainerRef.value.clientHeight

          pixiAppInstance.value.renderer.resize(newWidth, newHeight)

          setTimeout(() => {
            calculateModelFit()
          }, 100)
        }
      }

      window.addEventListener('resize', handleResize)

      // 保存清理函数
      resizeCleanup = () => {
        window.removeEventListener('resize', handleResize)
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('mousedown', handleMouseDown)
        container.removeEventListener('mouseenter', handleMouseEnter)
        container.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    } catch (error) {
      console.error('初始化PIXI应用失败:', error)
    }
  }
}

// 加载Live2D模型
const loadLive2DModel = async () => {
  if (!pixiAppInstance.value || !currentProduct.value) return

  try {
    const modelPath = getModelPath(currentProduct.value.id)
    const model = await Live2DModel.from(modelPath)

    // 设置模型锚点为中心
    model.anchor.set(0.5, 0.5)

    // 让模型可交互
    model.interactive = true

    // 添加模型到舞台
    pixiAppInstance.value.stage.addChild(model)
    live2dModel.value = model

    // 等待模型完全加载后计算适应大小
    setTimeout(() => {
      calculateModelFit()
    }, 500)

  } catch (error) {
    console.error('加载Live2D模型失败:', error)
  }
}

// 清理PIXI应用
const cleanupPixi = () => {
  if (live2dModel.value) {
    live2dModel.value.destroy()
    live2dModel.value = null
  }

  if (pixiAppInstance.value) {
    try {
      pixiAppInstance.value.destroy(true, { children: true, texture: true })
      pixiAppInstance.value = null
    } catch (error) {
      console.error('清理PIXI应用时出错:', error)
    }
  }

  if (pixiContainerRef.value) {
    pixiContainerRef.value.innerHTML = ''
  }

  if (resizeCleanup) {
    resizeCleanup()
    resizeCleanup = null
  }
}

// 处理使用模型
const handleUse = async () => {
  if (!currentProduct.value || isUsing.value) return

  isUsing.value = true
  const success = await useModel(currentProduct.value.id)
  showSuccessMessage.value = success
  showErrorMessage.value = !success
  isUsing.value = false
}

// 返回仓库
const goBack = async () => {
  cleanupPixi()
  await nextTick()
  router.replace('/repositories')
}

// 页面初始化
onMounted(async () => {
  try {
    if (productList.value.length === 0) {
      await loadShopData()
    }
    await initPixiApp()
  } catch (error) {
    console.error('页面初始化失败:', error)
  }
})

// 页面销毁
onBeforeUnmount(() => {
  cleanupPixi()
})
</script>

<style scoped>
.repositories-live2d-main {
  padding: 0 !important;
}

.repositories-live2d-container {
  margin: 0 12.5%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding-bottom: 5vh;
}

.back-button-area {
  height: 5vh;
  display: flex;
  align-items: center;
  padding: 8px 0;
  background-color: #ffffff;
}

.back-button {
  font-size: 16px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background-color: #f0f0f0;
}

.main-content-area {
  height: 95vh;
  display: flex;
  gap: 16px;
}

.live2d-display-area {
  width: 80%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #ffc7c7 0%, #e3e9ff 100%);
  border-radius: 12px;
  overflow: hidden;
}

.product-title {
  position: absolute;
  top: 20px;
  left: 30px;
  color: white;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10;
  margin: 0;
}

.live2d-view-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.right-info-area {
  width: 20%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card {
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.product-details {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-description {
  flex: 1;
}

.product-description h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.product-description p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.price-section {
  margin: 16px 0;
}

.price-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.price-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin: 12px 0;
}

.price-symbol {
  font-size: 18px;
  color: #e53e3e;
  font-weight: 600;
}

.price-amount {
  font-size: 28px;
  font-weight: 700;
  color: #e53e3e;
  margin-left: 4px;
}

.purchase-section {
  margin-top: auto;
}

.purchase-button {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
}

.live2d-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 15;
  display: flex;
  gap: 8px;
}

.control-btn {
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.9) !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content-area {
    flex-direction: column;
    gap: 12px;
  }

  .live2d-display-area {
    width: 100%;
    height: 70%;
  }

  .right-info-area {
    width: 100%;
    height: 30%;
  }

  .product-details {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }

  .product-description {
    flex: 1;
  }

  .price-section {
    margin: 0 16px;
    text-align: center;
  }

  .purchase-section {
    margin: 0;
    min-width: 140px;
  }
}

@media (max-width: 960px) {
  .repositories-live2d-container {
    margin: 0 5%;
  }

  .product-title {
    font-size: 24px;
    left: 20px;
  }

  .price-amount {
    font-size: 24px;
  }
}

@media (max-width: 600px) {
  .product-title {
    font-size: 20px;
    left: 16px;
    top: 16px;
  }

  .price-amount {
    font-size: 20px;
  }

  .product-details {
    flex-direction: column;
    gap: 12px;
  }

  .price-section {
    margin: 12px 0;
  }

  .purchase-section {
    min-width: auto;
  }
}
</style> 