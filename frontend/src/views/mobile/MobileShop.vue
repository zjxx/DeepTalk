<template>
  <v-container fluid class="mobile-page">
    <div class="top-bar">
      <h2 class="logo">商城</h2>
      <div class="category-scroll">
        <button v-for="c in cats" :key="c" :class="['chip', {active: c===cat}]" @click="cat=c">{{ c }}</button>
      </div>
    </div>

    <div class="grid">
      <div v-for="g in displayProducts" :key="g.id" class="goods" @click="go('/shop')">
        <div class="cover" :style="coverStyle(g.imageUrl)" />
        <div class="info">
          <h4 class="name">{{ g.name }}</h4>
          <div class="line">
            <span class="price">¥ {{ Number(g.price||0).toFixed(2) }}</span>
            <v-btn size="small" color="primary" variant="flat">购买</v-btn>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <button @click="go('/m/community')">社区</button>
      <button class="active">商城</button>
      <button @click="go('/m/profile')">我的</button>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useShopController } from '../../controllers/ShopController'
import type { Product } from '../../interface/ShopInterface'

const router = useRouter()
const cats = ['精选','模型','皮肤','周边','会员']
const cat = ref('精选')
const go = (p: string) => router.push(p)

const { productList, loadShopData, searchProducts } = useShopController()

// 示例商品（后端无数据时使用）
const sampleProducts = ref<Product[]>([
  { id: 'p1', name: 'Hatsune Miku Pack', description: '初音未来主题周边套装', price: 199, imageUrl: '/live2d/miku/image.png' },
  { id: 'p2', name: 'Nahida Art Print', description: '纳西妲限定艺术印刷', price: 129, imageUrl: '/live2d/Nahida_1080/icon.jpg' },
  { id: 'p3', name: 'Mahiro Sticker Set', description: '绪山真寻贴纸套装', price: 39, imageUrl: '/live2d/Mahiro_GG/真寻.png' },
  { id: 'p4', name: 'Angela Keychain', description: '安哲拉亚克力钥匙扣', price: 25, imageUrl: '/live2d/anzhela/anzhela.jpg' },
  { id: 'p5', name: 'Furina Poster', description: '芙莉莲精美海报', price: 59, imageUrl: '/live2d/test1/fulilian.jpg' },
  { id: 'p6', name: 'DeepTalk VIP', description: '年度会员（演示）', price: 299, imageUrl: '' },
])

const displayProducts = computed<Product[]>(() => (productList.value && productList.value.length>0) ? productList.value : sampleProducts.value)

const coverStyle = (url?: string) => {
  return url ? { backgroundImage:`url(${url})`, backgroundSize:'cover', backgroundPosition:'center' } : { background: 'linear-gradient(135deg,#cce1ff,#e0f7fa)' }
}

onMounted(async () => {
  await loadShopData()
})

watch(cat, async (val) => {
  await searchProducts(val === '精选' ? '' : val)
})
</script>

<style scoped>
.mobile-page{ position:relative; min-height:100vh; padding-bottom:60px; background:#f7f8fa; }
.top-bar{ position:sticky; top:0; background:#fff; padding:12px 12px 8px; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,.06); }
.logo{ margin:0 0 8px; font-size:20px; font-weight:600; }
.category-scroll{ display:flex; gap:8px; overflow:auto; padding-bottom:4px; }
.chip{ padding:6px 12px; border-radius:999px; border:1px solid #e5e5e5; background:#fff; color:#333; }
.chip.active{ background:#1976d2; color:#fff; border-color:#1976d2; }
.grid{ padding:12px; display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.goods{ background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.cover{ background:linear-gradient(135deg,#cce1ff,#e0f7fa); height:110px; }
.info{ padding:10px 12px 12px; }
.name{ margin:0 0 8px; font-size:14px; color:#222; }
.line{ display:flex; justify-content:space-between; align-items:center; }
.price{ color:#d32f2f; font-weight:600; }
.tab-bar{ position:fixed; left:0; bottom:0; width:100%; height:60px; background:#fff; display:flex; border-top:1px solid #eee; }
.tab-bar button{ flex:1; background:none; border:none; font-size:13px; color:#666; }
.tab-bar .active{ color:#1976d2; font-weight:600; }
@media (min-width:600px){ .mobile-page{ max-width:480px; margin:0 auto; } }
</style>
