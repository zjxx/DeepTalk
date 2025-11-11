<template>
  <v-container fluid class="mobile-page">
    <div class="top-bar">
      <h2 class="logo">测评概览</h2>
    </div>
    <div class="section">
      <h3 class="sec-title">当前分数</h3>
      <div class="score-box">
        <div class="score">82</div>
        <p class="tips"></p>
      </div>
    </div>
    <div class="section">
      <h3 class="sec-title">最近记录</h3>
      <div class="record" v-for="r in records" :key="r.id">
        <div class="l">
          <span class="dt">{{ r.date }}</span>
          <span class="tag" :class="r.level">{{ r.level }}</span>
        </div>
        <div class="r">{{ r.score }} 分</div>
      </div>
    </div>
    <div class="section">
      <h3 class="sec-title">建议</h3>
      <ul class="advise">
        <li>保持稳定练习节奏</li>
        <li>关注社区高分经验</li>
        <li>下次测评目标 +5 分</li>
      </ul>
    </div>

    <div class="tab-bar">
      <button @click="go('/m/community')">社区</button>
      <button @click="go('/m/shop')">商城</button>
      <button class="active" @click="go('/m/profile')">我的</button>
    </div>
  </v-container>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const go = (p: string) => router.push(p)

const records = [
  { id:1, date:'2025-10-01', score:78, level:'normal' },
  { id:2, date:'2025-10-08', score:80, level:'good' },
  { id:3, date:'2025-10-15', score:82, level:'good' },
]
</script>
<style scoped>
.mobile-page{ position:relative; min-height:100vh; background:#f7f8fa; padding-bottom:60px; }
.top-bar{ position:sticky; top:0; background:#fff; padding:14px 16px 8px; box-shadow:0 2px 4px rgba(0,0,0,.06); z-index:10; }
.logo{ margin:0; font-size:20px; font-weight:600; }
.section{ padding:16px; }
.sec-title{ margin:0 0 12px; font-size:15px; font-weight:600; color:#333; }
.score-box{ background:#fff; border-radius:14px; padding:24px 20px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.score{ font-size:42px; font-weight:700; color:#1976d2; margin-bottom:8px; }
.tips{ font-size:12px; color:#777; margin:0; }
.record{ background:#fff; border-radius:12px; padding:12px 14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,.05); }
.record .l{ display:flex; flex-direction:column; gap:4px; }
.record .dt{ font-size:12px; color:#666; }
.record .tag{ font-size:11px; padding:2px 6px; border-radius:6px; width:fit-content; }
.record .tag.normal{ background:#e0e0e0; color:#444; }
.record .tag.good{ background:#1976d2; color:#fff; }
.record .r{ font-size:14px; font-weight:600; color:#222; }
.advise{ background:#fff; padding:14px 18px; list-style:none; margin:0; border-radius:14px; box-shadow:0 2px 6px rgba(0,0,0,.06); }
.advise li{ font-size:13px; padding:6px 0; border-bottom:1px dashed #e0e0e0; }
.advise li:last-child{ border-bottom:none; }
.tab-bar{ position:fixed; left:0; bottom:0; width:100%; height:60px; background:#fff; display:flex; border-top:1px solid #eee; }
.tab-bar button{ flex:1; background:none; border:none; font-size:13px; color:#666; }
.tab-bar .active{ color:#1976d2; font-weight:600; }
@media (min-width:600px){ .mobile-page{ max-width:480px; margin:0 auto; } }
</style>
