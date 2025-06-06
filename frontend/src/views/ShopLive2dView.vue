<template>
  <v-app>
    <v-main class="shop-live2d-main">
      <div class="shop-live2d-container">
        <!-- 返回按钮区域 -->
        <div class="back-button-area">
          <v-btn
            variant="text"
            prepend-icon="mdi-arrow-left"
            class="back-button"
            @click="goBack"
          >
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
      <v-btn
        icon
        size="small"
        color="white"
        variant="elevated"
        class="control-btn"
        @click="resetModelTransform"
        title="重置大小和位置"
      >
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
                
                <!-- 购买按钮 -->
                <div class="purchase-section">
                  <v-btn
                    color="primary"
                    size="large"
                    variant="elevated"
                    class="purchase-button"
                    :loading="isPurchasing"
                    @click="handlePurchase"
                    block
                  >
                    <v-icon left>mdi-cart</v-icon>
                    立即购买
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

        <!-- 购买成功提示 -->
        <v-snackbar
          v-model="showSuccessMessage"
          color="success"
          timeout="3000"
          location="top"
        >
          购买成功！
        </v-snackbar>

        <!-- 购买失败提示 -->
        <v-snackbar
          v-model="showErrorMessage"
          color="error"
          timeout="3000"
          location="top"
        >
          {{ errorMessage }}
        </v-snackbar>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import { useShopController } from '../controllers/ShopController'

// 配置Live2D
window.PIXI = PIXI

const route = useRoute()
const router = useRouter()

// 使用 ShopController
const {
  productList,
  loading,
  loadShopData,
  purchaseProduct
} = useShopController()

// 页面状态
const pixiContainerRef = ref<HTMLDivElement | null>(null)
const pixiAppInstance = ref<PIXI.Application | null>(null)
const live2dModel = ref<Live2DModel | null>(null)
const isPurchasing = ref(false)
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

// 根据产品ID获取对应的模型路径
const getModelPath = (productId: string): string => {
  const modelPaths: Record<string, string> = {
    '1': '/live2d/Mahiro_GG/Mahiro_V1.model3.json',  // 真寻
    '2': '/live2d/miku/runtime/miku.model3.json',     // miku
    '3': '/live2d/Nahida_1080/Nahida_1080.model3.json' // 纳西妲
  }
  return modelPaths[productId] || '/live2d/miku/runtime/miku.model3.json'
}

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
  
  // 获取模型的原始尺寸（在缩放为1时）
  const originalScale = live2dModel.value.scale.x
  live2dModel.value.scale.set(1)
  const bounds = live2dModel.value.getBounds()
  live2dModel.value.scale.set(originalScale)
  
  const modelWidth = bounds.width
  const modelHeight = bounds.height

  if (modelWidth === 0 || modelHeight === 0) {
    // 如果无法获取边界，使用默认缩放
    modelScale.value = 0.3
  } else {
    // 计算适应容器的缩放比例，留一些边距
    const scaleX = (containerWidth * 0.8) / modelWidth
    const scaleY = (containerHeight * 0.8) / modelHeight
    const fitScale = Math.min(scaleX, scaleY, 0.8) // 最大不超过0.8
    modelScale.value = fitScale
  }

  // 设置居中位置
  modelPosition.value = {
    x: containerWidth / 2,
    y: containerHeight / 2
  }

  // 应用到模型
  updateModelTransform()
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
  const newScale = Math.max(0.1, Math.min(3.0, modelScale.value * delta))
  
  modelScale.value = newScale
  updateModelTransform()
  
  console.log('缩放模型:', modelScale.value)
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
  
  console.log('开始拖拽', { mousePos, modelPos: modelPosition.value, dragStart: dragStart.value })
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
  
  console.log('拖拽模型', { mousePos, newModelPos: modelPosition.value })
}

// 处理鼠标释放
const handleMouseUp = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  
  if (pixiContainerRef.value) {
    pixiContainerRef.value.style.cursor = isMouseInContainer.value ? 'grab' : 'default'
  }
  
  console.log('结束拖拽')
}

// 处理鼠标进入容器
const handleMouseEnter = () => {
  isMouseInContainer.value = true
  
  if (pixiContainerRef.value && !isDragging.value) {
    pixiContainerRef.value.style.cursor = 'grab'
  }
  
  console.log('鼠标进入容器')
}

// 处理鼠标离开容器
const handleMouseLeave = () => {
  isMouseInContainer.value = false
  isDragging.value = false
  
  if (pixiContainerRef.value) {
    pixiContainerRef.value.style.cursor = 'default'
  }
  
  console.log('鼠标离开容器')
}

// 重置模型位置和缩放
const resetModelTransform = () => {
  console.log('重置模型变换')
  calculateModelFit()
}

// 初始化PIXI应用和Live2D模型
const initPixiApp = async () => {
  await nextTick()
  if (pixiContainerRef.value && !pixiAppInstance.value) {
    try {
      console.log('初始化PIXI应用...')
      
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
      
      // 确保事件能正确触发
      container.style.position = 'relative'
      container.style.overflow = 'hidden'
      
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('mousedown', handleMouseDown, { passive: false })
      container.addEventListener('mouseenter', handleMouseEnter)
      container.addEventListener('mouseleave', handleMouseLeave)
      
      // 全局鼠标事件（用于拖拽）
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
          
          // 重新计算模型适应大小
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

      console.log('PIXI应用初始化完成')
    } catch (error) {
      console.error('初始化PIXI应用失败:', error)
    }
  }
}

// 加载Live2D模型
const loadLive2DModel = async () => {
  if (!pixiAppInstance.value || !currentProduct.value) return

  try {
    console.log('加载Live2D模型...')
    
    const modelPath = getModelPath(currentProduct.value.id)
    console.log('模型路径:', modelPath)
    
    const model = await Live2DModel.from(modelPath)
    
    // 设置模型锚点为中心
    model.anchor.set(0.5, 0.5)
    
    // 让模型可交互
    model.interactive = true
    
    // 添加模型到舞台
    pixiAppInstance.value.stage.addChild(model)
    live2dModel.value = model
    
    console.log('Live2D模型加载完成，边界:', model.getBounds())
    
    // 等待模型完全加载后计算适应大小
    setTimeout(() => {
      calculateModelFit()
    }, 1000)
    
  } catch (error) {
    console.error('加载Live2D模型失败:', error)
  }
}

// 清理PIXI应用
const cleanupPixi = () => {
  console.log('开始清理PIXI应用...')
  
  if (live2dModel.value) {
    live2dModel.value.destroy()
    live2dModel.value = null
    console.log('Live2D模型已销毁')
  }
  
  if (pixiAppInstance.value) {
    try {
      pixiAppInstance.value.destroy(true, { children: true, texture: true })
      pixiAppInstance.value = null
      console.log('PIXI应用已销毁')
    } catch (error) {
      console.error('清理PIXI应用时出错:', error)
    }
  }
  
  if (pixiContainerRef.value) {
    pixiContainerRef.value.innerHTML = ''
    console.log('DOM容器已清理')
  }
  
  // 清理事件监听器
  if (resizeCleanup) {
    resizeCleanup()
    resizeCleanup = null
    console.log('事件监听器已清理')
  }
}

// 处理购买
const handlePurchase = async () => {
  if (!currentProduct.value || isPurchasing.value) return

  isPurchasing.value = true
  try {
    await purchaseProduct(currentProduct.value)
    showSuccessMessage.value = true
  } catch (error) {
    console.error('购买失败:', error)
    errorMessage.value = '购买失败，请稍后重试'
    showErrorMessage.value = true
  } finally {
    isPurchasing.value = false
  }
}

// 返回商店
const goBack = async () => {
  console.log('准备返回商店...')
  
  // 先清理资源
  cleanupPixi()
  
  // 等待清理完成后再跳转
  await nextTick()
  
  console.log('跳转到商店页面')
  router.replace('/shop')
}

// 监听产品变化，重新加载模型
watch(currentProduct, async (newProduct, oldProduct) => {
  if (newProduct && newProduct.id !== oldProduct?.id) {
    if (live2dModel.value) {
      live2dModel.value.destroy()
      live2dModel.value = null
    }
    await loadLive2DModel()
  }
})

// 页面初始化
onMounted(async () => {
  console.log('ShopLive2dView 页面挂载')
  try {
    // 如果商品列表为空，先加载数据
    if (productList.value.length === 0) {
      await loadShopData()
    }
    
    // 初始化PIXI应用
    await initPixiApp()
  } catch (error) {
    console.error('页面初始化失败:', error)
  }
})

// 页面销毁
onBeforeUnmount(() => {
  console.log('ShopLive2dView 页面即将卸载')
  cleanupPixi()
})
</script>

<style scoped>
.shop-live2d-main {
  padding: 0 !important;
}

.shop-live2d-container {
  margin: 0 12.5%; /* 左右各留空0.125 */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  padding-bottom: 5vh; /* 底部留空5% */
}

/* 返回按钮区域 - 高度5% */
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

/* 主要内容区域 - 左右布局 */
.main-content-area {
  height: 95vh;
  display: flex;
  gap: 16px;
}

/* 左侧Live2D展示区域 - 宽度80% */
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

/* 右侧信息区域 - 宽度20% */
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
  .shop-live2d-container {
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
/* Live2D控制按钮 */
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

.live2d-view-container {
  width: 100%;
  height: 100%;
  position: relative;
  user-select: none; /* 防止拖拽时选中文本 */
}
</style>