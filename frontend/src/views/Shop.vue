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
              @click="handleSearch"
            >
              搜索
            </v-btn>
          </div>
        </v-card>

        <!-- 商品展示区域 -->
        <div class="products-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <p class="mt-4">加载中...</p>
          </div>

          <!-- 商品网格 -->
          <div v-else-if="products.length > 0" class="products-grid">
            <ProductCard
              v-for="product in products"
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

const router = useRouter()

// 商品数据类型定义
interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  rating: number
}

// 状态管理
const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')

// 样品商品数据
const sampleProducts: Product[] = [
  {
    id: '1',
    name: '智能手机',
    description: '最新款智能手机，性能强劲，拍照清晰，电池持久。',
    price: 3999,
    image: '/images/phone.jpg',
    category: '电子产品',
    stock: 50,
    rating: 4.8
  },
  {
    id: '2',
    name: '无线耳机',
    description: '高品质无线耳机，降噪效果出色，音质清晰。',
    price: 299,
    image: '/images/earphones.jpg',
    category: '电子产品',
    stock: 100,
    rating: 4.6
  },
  
]

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    products.value = sampleProducts
  } catch (error) {
    console.error('加载商品失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索商品
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    products.value = sampleProducts
    return
  }
  
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    products.value = sampleProducts.filter(product => 
      product.name.includes(searchQuery.value) || 
      product.description.includes(searchQuery.value) ||
      product.category.includes(searchQuery.value)
    )
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

// 查看商品详情
const viewProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}

// 添加到购物车
const handleAddToCart = (productId: string) => {
  console.log('添加到购物车:', productId)
  // 这里后续实现购物车逻辑
}

// 页面加载
onMounted(() => {
  loadProducts()
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