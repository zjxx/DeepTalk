<template>
  <v-container fluid class="mobile-page">
    <!-- 顶部搜索与标题 -->
    <div class="top-bar">
      <h2 class="logo">社区</h2>
      <v-text-field v-model="search" density="compact" rounded placeholder="搜索帖子或作者" prepend-inner-icon="mdi-magnify" hide-details variant="outlined" class="search-input" @keyup.enter="doSearch" />
    </div>

    <!-- 帖子列表（优先展示后端数据；为空则展示示例数据） -->
    <div class="feed" v-if="displayPosts.length">
      <div v-for="p in displayPosts" :key="p.id" class="post-card" @click="goDetail(p.id)">
        <h3 class="title">{{ p.title }}</h3>
        <p class="summary">{{ (p.content || '').slice(0, 80) }}...</p>
        <div class="meta">
          <div class="author">
            <v-avatar size="32" class="mr-2">
              <img :src="p.author?.avatar || 'https://via.placeholder.com/64'" alt="avatar" />
            </v-avatar>
            <span class="name">{{ p.author?.username || '匿名作者' }}</span>
          </div>
          <div class="stats">
            <v-icon size="18" color="red">mdi-heart</v-icon>
            <span>{{ p.likesCount }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty">
      <v-icon size="64" color="grey-lighten-1">mdi-post-outline</v-icon>
      <p class="mt-2">暂无数据，演示占位</p>
    </div>

    <!-- 底部 TabBar -->
    <div class="tab-bar">
      <button :class="{active: tab==='community'}" @click="tab='community'">社区</button>
      <button :class="{active: tab==='shop'}" @click="go('/m/shop')">商城</button>
      <button :class="{active: tab==='profile'}" @click="go('/m/profile')">我的</button>
    </div>

    <!-- 悬浮发布按钮 -->
    <v-btn class="fab" color="primary" icon="mdi-pencil" @click="go('/post/create')" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCommunityController } from '../../controllers/CommunityController'
import type { Post } from '../../interface/CommunityInterface'

const router = useRouter()
const tab = ref('community')
const search = ref('')

// 使用已实现的社区控制器，从后端临时拉取数据
const { posts, loadCommunityData, searchPosts } = useCommunityController()

// 英语学习示例帖子（后端无数据时用于展示）
const samplePosts = ref<Post[]>([
  {
    id: 'demo-1',
    title: 'Daily English Tip: Collocations',
    content: 'Learn common collocations like make a decision, take a break, do homework. Try making 3 sentences today to reinforce them.',
    author: { id: 'u1', username: 'Emma (EN Coach)', avatar: 'https://i.pravatar.cc/64?img=12', authorLikes: 320, authorPosts: 58 },
    likesCount: 27,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-2',
    title: 'Pronunciation Drill: /θ/ vs /s/',
    content: 'Practice words with /θ/ like think, both, method. Contrast with /s/ in sink, boss, lesson. Record yourself for 30 seconds and compare.',
    author: { id: 'u2', username: 'Liam (Phonetics)', avatar: 'https://i.pravatar.cc/64?img=23', authorLikes: 211, authorPosts: 33 },
    likesCount: 41,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-3',
    title: 'Listening Routine: 15 mins a day',
    content: 'Pick a short podcast (B1–B2). Step 1: listen once without subtitles. Step 2: check keywords. Step 3: shadow 3 sentences you like.',
    author: { id: 'u3', username: 'Olivia (Listening Lab)', avatar: 'https://i.pravatar.cc/64?img=36', authorLikes: 145, authorPosts: 22 },
    likesCount: 19,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-4',
    title: 'Grammar Focus: Present Perfect in Use',
    content: 'have/has + past participle. Use it for experiences and results: I have visited London twice. She has finished her report already.',
    author: { id: 'u4', username: 'Noah (Grammar Plus)', avatar: 'https://i.pravatar.cc/64?img=45', authorLikes: 398, authorPosts: 76 },
    likesCount: 56,
    createdAt: new Date().toISOString()
  },
  {
    id: 'demo-5',
    title: 'Vocabulary Builder: Phrasal Verbs with “get”',
    content: 'get over (recover), get along (be friendly), get by (survive), get into (be interested). Make your own examples in the comments!',
    author: { id: 'u5', username: 'Ava (Vocab Box)', avatar: 'https://i.pravatar.cc/64?img=14', authorLikes: 172, authorPosts: 40 },
    likesCount: 33,
    createdAt: new Date().toISOString()
  }
])

// 优先展示后端数据；若为空则展示示例数据
const displayPosts = computed<Post[]>(() => (posts.value && posts.value.length > 0) ? posts.value : samplePosts.value)

const goDetail = (id: string) => router.push(`/post/${id}`)
const go = (path: string) => router.push(path)
const doSearch = async () => {
  // 为空则加载最新帖子，否则执行按内容搜索
  if (!search.value.trim()) {
    await loadCommunityData()
  } else {
    await searchPosts(search.value.trim())
  }
}

onMounted(async () => {
  await loadCommunityData()
})
</script>

<style scoped>
.mobile-page { position: relative; min-height: 100vh; background:#f7f8fa; padding-bottom:72px; margin-top:-64px; }
.top-bar { position: sticky; top:0; background:white; padding:12px 16px 4px; z-index:10; display:flex; flex-direction:column; box-shadow:0 2px 4px rgba(0,0,0,.08); }
.logo { margin:0 0 8px; font-size:20px; font-weight:600; }
.search-input { width:100%; }
.feed { padding:12px 12px 0; }
.post-card { background:white; border-radius:14px; padding:14px 16px; margin-bottom:12px; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.title { margin:0 0 8px; font-size:16px; font-weight:600; color:#222; }
.summary { margin:0 0 10px; font-size:13px; color:#666; line-height:1.4; }
.meta { display:flex; justify-content:space-between; align-items:center; }
.author { display:flex; align-items:center; font-size:13px; color:#333; }
.name { font-weight:500; }
.stats { display:flex; align-items:center; gap:4px; font-size:12px; color:#888; }
.empty { padding:60px 0; text-align:center; }
.tab-bar { position:fixed; left:0; bottom:0; width:100%; height:60px; background:#fff; display:flex; border-top:1px solid #eee; }
.tab-bar button { flex:1; background:none; border:none; font-size:13px; color:#666; display:flex; flex-direction:column; justify-content:center; }
.tab-bar button.active { color:#1976d2; font-weight:600; }
.fab { position:fixed; right:20px; bottom:80px; box-shadow:0 4px 12px rgba(0,0,0,.3); }
@media (min-width:600px){ .mobile-page{ max-width:480px; margin:0 auto; } }
</style>
