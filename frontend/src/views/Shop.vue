<template>
  <v-container fluid class="fill-height pa-0">
    <div class="shop-container">
      <v-sheet class="main-content">
        <!-- 搜索栏 -->
        <v-card class="search-section" flat>
          <div class="search-container">
            <!-- 搜索输入框 -->
            <v-text-field
              v-model="searchQuery"
              placeholder="搜索商品..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              class="search-input"
              @keyup.enter="handleSearch"
            ></v-text-field>
            
            <!-- 搜索按钮 -->
            <v-btn
              color="primary"
              variant="elevated"
              class="search-button"
              :loading="loading"
              @click="handleSearch"
            >
              搜索
            </v-btn>
          </div>
        </v-card>

        <!-- 错误提示 -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- 商品展示区域 -->
        <div class="products-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <p class="mt-4">加载中...</p>
          </div>

          <!-- 商品网格 -->
          <div v-else-if="productList.length > 0" class="products-grid">
            <ProductCard
              v-for="product in productList"
              :key="product.id"
              :product="product"
              @click="viewProduct(product.id)"
              @add-to-cart="handleAddToCart"
            />
          </div>

          <!-- 无数据状态 -->
          <div v-else class="empty-state text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-store-outline</v-icon>
            <p class="mt-4 text-grey">暂无商品数据</p>
          </div>
        </div>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useShopController } from '../controllers/ShopController'
//import type { Product } from '../interface/ShopInterface'

const router = useRouter()

// 使用 ShopController
const {
  productList,
  loading,
  error,
  loadShopData,
  searchProducts,
  purchaseProduct
} = useShopController()

// 搜索状态
const searchQuery = ref('')

// 搜索商品
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    // 如果搜索为空，重新加载所有商品
    await loadShopData()
    return
  }
  
  // 调用控制器的搜索方法
  await searchProducts(searchQuery.value)
}

// 查看商品详情
const viewProduct = (productId: string) => {
  router.push(`/Shop/live2d/${productId}`)
}

// 添加到购物车 - 本商品不需要购物车这里简化为直接购买
const handleAddToCart = async (productId: string) => {
  const product = productList.value.find(p => p.id === productId)
  if (product) {
    try {
      await purchaseProduct(product)
      // 可以添加成功提示
      console.log('购买成功:', product.name)
    } catch (error) {
      console.error('购买失败:', error)
    }
  }
}

// 页面加载
onMounted(() => {
  loadShopData()
})
</script>

<style scoped>
.shop-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
}

.main-content {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
  background-color: transparent;
}

.search-section {
  width: 100%;
  margin-bottom: 24px;
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.search-button {
  width: 100px;
  flex-shrink: 0;
}

.products-area {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.empty-state {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .main-content {
    width: 95%;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-button {
    width: 100%;
  }
}
</style>