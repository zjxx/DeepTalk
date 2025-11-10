<template>
  <v-container fluid class="mobile-page">
    <div class="profile-header">
      <v-avatar size="72" class="mr-3"><img :src="avatarUrl" alt="avatar" /></v-avatar>
      <div class="user">
        <h3 class="name">{{ nickname }}</h3>
        <p class="desc">{{ bio }}</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" color="primary" @click="editOpen = true">编辑资料</v-btn>
    </div>

    <!-- 简易资料编辑弹窗（本地演示用） -->
    <v-dialog v-model="editOpen" max-width="420">
      <v-card>
        <v-card-title>编辑个人资料</v-card-title>
        <v-card-text>
          <v-text-field v-model="nickname" label="昵称" maxlength="30" counter></v-text-field>
          <v-text-field v-model="avatarUrl" label="头像链接 (URL)"></v-text-field>
          <v-textarea v-model="bio" label="个人简介" rows="3" maxlength="120" counter></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelEdit">取消</v-btn>
          <v-btn color="primary" @click="saveProfile">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="cards">
      <div class="card" @click="go('/community')">
        <v-icon color="primary">mdi-forum</v-icon>
        <span>我的帖子</span>
      </div>
      <div class="card" @click="go('/shop')">
        <v-icon color="teal">mdi-cart</v-icon>
        <span>已购商品</span>
      </div>
      <div class="card" @click="go('/security')">
        <v-icon color="orange">mdi-shield-key</v-icon>
        <span>安全中心</span>
      </div>
      <div class="card" @click="go('/evaluation')">
        <v-icon color="purple">mdi-chart-line</v-icon>
        <span>测评记录</span>
      </div>
    </div>

    <div class="list">
      <div class="item"><span>消息通知</span><v-icon>mdi-chevron-right</v-icon></div>
      <div class="item"><span>隐私设置</span><v-icon>mdi-chevron-right</v-icon></div>
      <div class="item"><span>关于我们</span><v-icon>mdi-chevron-right</v-icon></div>
    </div>

    <div class="tab-bar">
      <button @click="go('/m/community')">社区</button>
      <button @click="go('/m/shop')">商城</button>
      <button class="active">我的</button>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userModel from '../../models/user'

const router = useRouter()
const go = (p: string) => router.push(p)

const editOpen = ref(false)
const nickname = ref('Lynn · EN Learner')
const avatarUrl = ref('https://i.pravatar.cc/150?img=47')
const bio = ref('坚持每天15分钟口语跟读与词块积累。')

const loadFromStorage = () => {
  const saved = localStorage.getItem('userInfo')
  if (saved) {
    try {
      const obj = JSON.parse(saved)
      nickname.value = obj.username || nickname.value
      avatarUrl.value = obj.avatar || avatarUrl.value
      bio.value = obj.bio || bio.value
      // 同步到全局模型
      userModel.username = nickname.value
      userModel.avatar = avatarUrl.value
      userModel.isLoggedIn = !!(obj.token || userModel.isLoggedIn)
    } catch (e) {
      // 忽略解析错误，保留默认演示数据
      console.warn('解析 userInfo 失败', e)
    }
  } else {
    // 没有本地存储则从全局模型取一次
    if (userModel.username) nickname.value = userModel.username
    if (userModel.avatar) avatarUrl.value = userModel.avatar
  }
}

const cancelEdit = () => {
  editOpen.value = false
  loadFromStorage()
}

const saveProfile = () => {
  // 更新全局模型
  userModel.username = nickname.value
  userModel.avatar = avatarUrl.value
  // 持久化（包含 bio，兼容 App 恢复逻辑）
  localStorage.setItem('userInfo', JSON.stringify({
    username: nickname.value,
    avatar: avatarUrl.value,
    bio: bio.value
  }))
  editOpen.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('userInfo')
  loadFromStorage()
  if (!saved) {
    localStorage.setItem('userInfo', JSON.stringify({
      username: nickname.value,
      avatar: avatarUrl.value,
      bio: bio.value
    }))
  }
})
</script>

<style scoped>
.mobile-page{ position:relative; min-height:100vh; padding-bottom:60px; background:#f7f8fa; }
.profile-header{ display:flex; align-items:center; gap:12px; padding:16px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,.06); }
.user .name{ margin:0 0 6px; font-size:18px; font-weight:700; }
.user .desc{ margin:0; font-size:12px; color:#777; max-width:60ch; }
.cards{ display:grid; grid-template-columns:repeat(2,1fr); gap:12px; padding:12px; }
.card{ background:#fff; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:8px; align-items:flex-start; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.list{ background:#fff; margin:12px; border-radius:14px; overflow:hidden; }
.item{ display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-top:1px solid #eee; }
.item:first-child{ border-top:none; }
.tab-bar{ position:fixed; left:0; bottom:0; width:100%; height:60px; background:#fff; display:flex; border-top:1px solid #eee; }
.tab-bar button{ flex:1; background:none; border:none; font-size:13px; color:#666; }
.tab-bar .active{ color:#1976d2; font-weight:600; }
@media (min-width:600px){ .mobile-page{ max-width:480px; margin:0 auto; } }
</style>
