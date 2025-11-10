<template>
  <v-container fluid class="fill-height pa-0">
    <div class="community-container">
      <v-sheet class="main-content">
        <!-- 搜索栏 -->
        <v-card class="search-section" flat>
          <div class="search-container">
            <!-- 搜索类型下拉选择框 -->
            <v-select v-model="searchType" :items="searchOptions" item-title="text" item-value="value"
              variant="outlined" hide-details class="search-type-select" density="compact"></v-select>

            <!-- 搜索输入框 -->
            <v-text-field v-model="searchQuery" placeholder="搜索社区内容..." prepend-inner-icon="mdi-magnify"
              variant="outlined" hide-details class="search-input"
              @keyup.enter="handleSearch"></v-text-field>

            <!-- 搜索按钮 -->
            <v-btn color="primary" variant="elevated" class="search-button" @click="handleSearch">
              搜索
            </v-btn>
          </div>
        </v-card>

        <!-- 三栏布局区域 -->
        <div class="content-layout">
          <!-- 左侧关注列表 -->
          <v-card class="left-sidebar" elevation="1">
            <v-card-title class="text-h6 font-weight-bold">关注列表</v-card-title>
            <v-card-text class="following-list">
              <!-- 这里后续添加关注列表组件 -->

            </v-card-text>
          </v-card>

          <!-- 中间主要内容区 -->
          <v-card class="center-content" elevation="1">
            <v-card-text class="posts-container">
              <!-- 加载状态 -->
              <div v-if="loading" class="text-center pa-4">
                <v-progress-circular indeterminate></v-progress-circular>
                <p class="mt-2">加载中...</p>
              </div>

              <!-- 帖子列表 -->
              <div v-else-if="posts.length > 0" class="posts-list">
                <div v-for="post in posts" :key="post.id" class="post-wrapper">
                  <PostPreview :post="post" @click="viewPost(post.id)" />
                  <div class="social-actions">
                    <v-btn size="small" variant="text" :color="followedAuthors.has(post.author.id) ? 'primary' : 'grey'" @click.stop="toggleFollow(post.author.id)">
                      <v-icon start size="16">{{ followedAuthors.has(post.author.id) ? 'mdi-account-check' : 'mdi-account-plus' }}</v-icon>
                      {{ followedAuthors.has(post.author.id) ? '已关注' : '关注' }}
                    </v-btn>
                    <v-btn size="small" variant="text" :color="favorites.has(post.id) ? 'orange' : 'grey'" @click.stop="toggleFavorite(post.id)">
                      <v-icon size="16">{{ favorites.has(post.id) ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
                    </v-btn>
                    <v-menu transition="scale-transition" location="bottom">
                      <template #activator="{ props }">
                        <v-btn v-bind="props" size="small" variant="text" color="grey">
                          <v-icon size="16">mdi-emoticon-happy-outline</v-icon>
                        </v-btn>
                      </template>
                      <v-card class="pa-2" min-width="200">
                        <div class="reaction-row">
                          <v-btn v-for="r in reactionTypes" :key="r" variant="text" size="small" :color="getMyReaction(post.id) === r ? 'primary' : 'grey'" @click="handleReaction(post.id, r)">
                            {{ reactionEmoji[r] }}
                          </v-btn>
                        </div>
                        <div class="reaction-counts mt-2 text-caption">
                          <span v-for="r in reactionTypes" :key="r" class="mr-2">
                            {{ reactionEmoji[r] }} {{ getCounter(post.id, r) }}
                          </span>
                        </div>
                      </v-card>
                    </v-menu>
                  </div>
                </div>
              </div>

              <!-- 无数据状态 -->
              <div v-else class="empty-state text-center pa-8">
                <v-icon size="64" color="grey-lighten-1">mdi-post-outline</v-icon>
                <p class="mt-4 text-grey">暂无帖子数据</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- 右侧作者和工具箱 -->
          <div class="right-sidebar">
            <v-card class="author-section mb-4" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">推荐作者</v-card-title>
              <v-card-text>
                <div v-if="recommendedAuthors.length === 0" class="text-caption text-grey">暂无推荐</div>
                <div v-else class="author-list">
                  <div v-for="a in recommendedAuthors" :key="a.id" class="author-item">
                    <v-avatar size="36"><v-img :src="a.avatar || '/default-avatar.png'" /></v-avatar>
                    <div class="author-meta">
                      <div class="name">{{ a.username }}</div>
                      <div class="stats">{{ a.authorPosts }} 帖 · {{ a.followerCount }} 粉</div>
                    </div>
                    <v-btn size="x-small" :color="a.followed ? 'primary' : 'grey'" variant="outlined" @click="toggleFollowSidebar(a)">
                      {{ a.followed ? '已关注' : '关注' }}
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
            <v-card class="toolbox" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">工具箱</v-card-title>
              <v-card-text>
                <div class="toolbox-content">
                  <v-btn icon size="large" color="primary" variant="elevated" class="create-post-btn"
                    @click="goToCreatePost" title="发布新帖">
                    <v-icon size="24">mdi-pencil</v-icon>
                  </v-btn>
                  <p class="btn-label mt-2">发布新帖</p>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-sheet>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PostPreview from '../components/PostPreview.vue'
import { useCommunityController } from '../controllers/CommunityController'
import { useSocialController } from '../controllers/SocialController'
import type { ReactionRequest } from '../interface/SocialInterface'

const router = useRouter()

const { posts, loading, loadCommunityData } = useCommunityController()
const { toggleFollow: apiToggleFollow, toggleFavorite: apiToggleFavorite, react, getReactionSummary, getFollowStatus, getRecommendedAuthors } = useSocialController()

// 搜索相关状态
const searchQuery = ref('')
const searchType = ref('posts')

// 跳转到发帖页面
const goToCreatePost = () => { router.push('/post/create') }

// 搜索选项
const searchOptions = [
  { text: '按内容搜索', value: 'posts' },
  { text: '按作者搜索', value: 'authors' }
]

// 处理搜索（简化为重新加载）
const handleSearch = async () => { await loadCommunityData() }

// 查看帖子详情
const viewPost = (postId: string) => { router.push(`/post/${postId}`) }

const currentUserId = 'current_user_id'
const followedAuthors = ref<Set<string>>(new Set())
const favorites = ref<Set<string>>(new Set())
const reactionSummary = ref<Record<string, { counters: Record<string, number>; myReaction?: string | null }>>({})
const reactionTypes: ReactionRequest['type'][] = ['like','love','laugh','sad','angry']
const reactionEmoji: Record<string,string> = { like:'👍', love:'❤️', laugh:'😂', sad:'😢', angry:'😡' }

const ensureReactionSummary = async (postId: string) => {
  if (!reactionSummary.value[postId]) {
    const resp = await getReactionSummary(postId, currentUserId)
    if (resp) reactionSummary.value[postId] = { counters: resp.counters, myReaction: resp.myReaction }
  }
}

const getCounter = (postId: string, type: string) => reactionSummary.value[postId]?.counters?.[type] ?? 0
const getMyReaction = (postId: string) => reactionSummary.value[postId]?.myReaction

const handleReaction = async (postId: string, type: ReactionRequest['type']) => {
  await ensureReactionSummary(postId)
  const my = getMyReaction(postId)
  const add = my !== type
  const resp = await react(postId, currentUserId, type, add)
  if (resp) reactionSummary.value[postId] = { counters: resp.counters, myReaction: resp.myReaction }
}

const toggleFollow = async (authorId: string) => {
  const follow = !followedAuthors.value.has(authorId)
  const resp = await apiToggleFollow(currentUserId, authorId, follow)
  if (resp) {
    if (resp.followed) { followedAuthors.value.add(authorId) } else { followedAuthors.value.delete(authorId) }
  }
}

const toggleFavorite = async (postId: string) => {
  const fav = !favorites.value.has(postId)
  const resp = await apiToggleFavorite(postId, currentUserId, fav)
  if (resp) {
    if (resp.favorited) { favorites.value.add(postId) } else { favorites.value.delete(postId) }
  }
}

const recommendedAuthors = ref<Array<{ id: string; username: string; avatar: string; authorPosts: number; followerCount: number; followed: boolean }>>([])

const loadRecommendedAuthors = async () => {
  const res = await getRecommendedAuthors(currentUserId, 10)
  if (res?.authors) recommendedAuthors.value = res.authors
}

const toggleFollowSidebar = async (a: { id: string; followed: boolean }) => {
  const resp = await apiToggleFollow(currentUserId, a.id, !a.followed)
  if (resp) a.followed = resp.followed
}

onMounted(async () => {
  await loadCommunityData()
  for (const p of posts.value) {
    getReactionSummary(p.id, currentUserId).then(r => { if (r) reactionSummary.value[p.id] = { counters: r.counters, myReaction: r.myReaction } })
  }
  const seen = new Set<string>()
  for (const p of posts.value) {
    const aid = p.author?.id
    if (!aid || seen.has(aid)) continue
    seen.add(aid)
    getFollowStatus(currentUserId, aid).then(res => { if (res?.followed) followedAuthors.value.add(aid) }).catch(() => {})
  }
  // 加载推荐作者
  await loadRecommendedAuthors()
})
</script>

<style scoped>
/* 工具箱内容 */
.toolbox-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}

.create-post-btn {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-label {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin: 0;
}

.community-container {
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
  margin-bottom: 20px;
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

.search-type-select {
  width: 18%;
  flex-shrink: 0;
}

.search-input {
  width: 70%;
  flex-shrink: 0;
}

.search-button {
  width: 8%;
  flex-shrink: 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 0.1875fr 0.625fr 0.1875fr;
  gap: 20px;
  min-height: calc(100vh - 100px);
}

.left-sidebar,
.right-sidebar,
.center-content {
  border-radius: 8px;
  overflow: hidden;
}

.center-content {
  background: white;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
}

.posts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.author-section {
  margin-bottom: 20px;
}

.toolbox {
  background: white;
}

.v-card-title {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.v-card-text {
  padding: 16px;
}

/* 修改响应式设计部分 */
/* @media (max-width: 960px) {
  .main-content {
    width: 95%;
  }

  .content-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .left-sidebar,
  .right-sidebar {
    position: static; //在移动端取消固定定位 
    max-height: none;
  }
} */

.post-wrapper { position: relative; }
.social-actions { position: absolute; top: 4px; right: 8px; display: flex; gap: 4px; z-index: 5; }
.reaction-row { display: flex; flex-wrap: wrap; gap: 4px; }
.author-list { display: flex; flex-direction: column; gap: 10px; }
.author-item { display: flex; align-items: center; gap: 10px; justify-content: space-between; }
.author-meta { flex: 1; min-width: 0; }
.author-meta .name { font-size: 14px; font-weight: 600; color: #333; }
.author-meta .stats { font-size: 12px; color: #999; }
</style>
