<template>
  <v-container fluid class="fill-height pa-0">
    <div class="repositories-container">
      <v-sheet class="main-content">
        <!-- 搜索栏 -->
        <v-card class="search-section" flat>
          <div class="search-container">
            <!-- 搜索输入框 -->
            <v-text-field
              v-model="searchQuery"
              placeholder="搜索我的物品..."
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

        <!-- 物品展示区域 -->
        <div class="items-area">
          <!-- 加载状态 -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
            <p class="mt-4">加载中...</p>
          </div>

          <!-- 物品网格 -->
          <div v-else-if="productList.length > 0" class="items-grid">
            <v-card
              v-for="product in productList"
              :key="product.id"
              class="item-card"
              @click="viewItem(product.id)"
            >
              <v-img
                :src="product.imageUrl"
                height="200"
                cover
                class="item-image"
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                  </v-row>
                </template>
              </v-img>

              <v-card-title class="text-truncate">
                {{ product.name }}
              </v-card-title>

              <v-card-text>
                <div class="item-description text-truncate">
                  {{ product.description }}
                </div>
                <div class="item-meta mt-2">
                  <v-chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="mr-2"
                  >
                    Live2D模型
                  </v-chip>
                  <span class="text-caption text-grey">
                    价格: ¥{{ product.price }}
                  </span>
                </div>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  color="primary"
                  variant="text"
                  @click.stop="useItem(product)"
                >
                  使用
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  variant="text"
                  @click.stop="deleteItem(product)"
                >
                  删除
                </v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="empty-state text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
            <p class="mt-4 text-grey">暂无物品数据</p>
            <v-btn
              color="primary"
              class="mt-4"
              to="/shop"
            >
              去商店看看
            </v-btn>
          </div>
        </div>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useShopController } from '../controllers/ShopController'
import type { Product } from '../interface/ShopInterface'

const router = useRouter()
const searchQuery = ref('')

// 使用 ShopController
const {
  productList,
  loading,
  error,
  loadShopData,
  searchProducts
} = useShopController()

// 搜索物品
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    // 如果搜索为空，重新加载所有商品
    await loadShopData()
    return
  }
  
  // 调用控制器的搜索方法
  await searchProducts(searchQuery.value)
}

// 查看物品详情
const viewItem = (itemId: string) => {
  router.push(`/repositories/live2d/${itemId}`)
}

// 使用物品
const useItem = async (product: Product) => {
  try {
    // 跳转到 Live2D 预览页面
    router.push(`/repositories/live2d/${product.id}`)
  } catch {
    error.value = '使用物品失败，请重试'
  }
}

// 删除物品
const deleteItem = async (product: Product) => {
  try {
    // TODO: 实现删除物品的逻辑
    console.log('删除物品:', product.name)
    productList.value = productList.value.filter(p => p.id !== product.id)
  } catch {
    error.value = '删除物品失败，请重试'
  }
}

// 页面加载
onMounted(() => {
  loadShopData()
})
</script>

<style scoped>
.repositories-container {
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

.items-area {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 200px);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.item-card {
  transition: transform 0.2s;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-4px);
}

.item-image {
  border-radius: 8px 8px 0 0;
}

.item-description {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .main-content {
    width: 95%;
  }
  
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .items-grid {
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