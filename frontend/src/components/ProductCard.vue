<template>
  <v-card
    class="product-card"
    elevation="2"
    hover
    @click="$emit('click')"
  >
    <!-- 商品图片 -->
    <div class="product-image-container">
      <v-img
        :src="product.image"
        :alt="product.name"
        class="product-image"
        cover
        height="200"
      >
        <template v-slot:placeholder>
          <div class="image-placeholder">
            <v-icon size="48" color="grey-lighten-3">mdi-image</v-icon>
          </div>
        </template>
      </v-img>
      
      <!-- 悬停时显示的操作按钮 -->
      <div class="product-overlay">
        <v-btn
          icon
          size="small"
          color="white"
          class="overlay-btn"
          @click.stop="$emit('add-to-cart', product.id)"
        >
          <v-icon>mdi-cart-plus</v-icon>
        </v-btn>
      </div>
    </div>

    <v-card-text class="product-info">
      <!-- 商品名称 -->
      <h3 class="product-name">{{ product.name }}</h3>
      
      <!-- 商品描述 -->
      <p class="product-description">{{ formatDescription(product.description) }}</p>
      
      <!-- 底部信息 -->
      <div class="product-footer">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-amount">{{ product.price }}</span>
        </div>
        
        <div class="product-rating">
          <v-icon size="16" color="orange">mdi-star</v-icon>
          <span>{{ product.rating }}</span>
        </div>
      </div>
      
      <!-- 库存信息 -->
      <div class="product-stock">
        <span :class="stockClass">库存: {{ product.stock }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const props = defineProps<{
  product: Product
}>()

defineEmits<{
  click: []
  'add-to-cart': [productId: string]
}>()

// 格式化描述 - 限制在50字以内
const formatDescription = (description: string) => {
  if (description.length > 50) {
    return description.substring(0, 50) + '...'
  }
  return description
}

// 库存状态样式
const stockClass = computed(() => {
  if (props.product.stock <= 0) return 'stock-out'
  if (props.product.stock <= 10) return 'stock-low'
  return 'stock-normal'
})
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #f5f5f5;
}

.product-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.overlay-btn {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(4px);
}

.product-info {
  padding: 16px;
  height: 160px;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 12px 0;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #e53e3e;
  font-weight: 500;
}

.price-amount {
  font-size: 18px;
  font-weight: 700;
  color: #e53e3e;
  margin-left: 2px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.product-stock {
  font-size: 12px;
}

.stock-normal {
  color: #38a169;
}

.stock-low {
  color: #d69e2e;
}

.stock-out {
  color: #e53e3e;
}
</style>