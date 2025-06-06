<template>
  <div id="userPageContainer" class="user-page">
    <div class="user">
      <div class="user-content-wrapper">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <v-avatar>
              <v-img :src="userAvatar" alt="User Avatar"></v-img>
            </v-avatar>
            <div class="avatar-overlay" @click="editAvatar">
              <v-icon>mdi-pencil</v-icon> <!-- 可添加编辑图标 -->
            </div>
          </div>
        </div>
        <div class="info-section">
          <h2 class="text-h5 font-weight-bold">{{ username }}</h2>
          <p class="user-id-text text-grey-darken-1">id：{{ xiaohongshuId }}</p>
          <v-icon size="small" color="blue">mdi-gender-male</v-icon>
          <div class="data-info">
            <div class="user-interactions">
              <div>
                <span class="count">{{ followCount }}</span>
                <span class="shows">关注</span>
              </div>
              <div>
                <span class="count">{{ fanCount }}</span>
                <span class="shows">粉丝</span>
              </div>
              <div>
                <span class="count">{{ likesAndCollections }}</span>
                <span class="shows">获赞与收藏</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <v-divider class="my-4"></v-divider> -->

    <div class="profile-nav">
      <div
        class="nav-item"
        :class="{ active: activeTab === 'posts' }"
        @click="activeTab = 'posts'"
      >
        帖子
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'likes' }"
        @click="activeTab = 'likes'"
      >
        点赞
      </div>
      <div
        class="nav-item"
        :class="{ active: activeTab === 'collections' }"
        @click="activeTab = 'collections'"
      >
        收藏
      </div>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'posts'">
        <!-- 帖子内容区域 -->
        <p>这里显示用户的帖子列表。</p>
      </div>
      <div v-if="activeTab === 'likes'">
        <!-- 点赞内容区域 -->
        <p>这里显示用户点赞的内容。</p>
      </div>
      <div v-if="activeTab === 'collections'">
        <!-- 收藏内容区域 -->
        <p>这里显示用户收藏的内容。</p>
      </div>
    </div>

   

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const userAvatar = ref('https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31b593h86ng005p4rmeo7531ts9tr1og?imageView2/2/w/540/format/webp|imageMogr2/strip2') // 使用提供图片中的头像URL
const username = ref('山有木兮')
const xiaohongshuId = ref('9643589600')
const followCount = ref(1)
const fanCount = ref(2)
const likesAndCollections = ref(0)

const activeTab = ref('posts') // 默认激活"帖子"选项卡

const editAvatar = () => {
  alert('点击了头像，准备修改头像');
  // TODO: 实现头像修改逻辑
};

</script>

<style scoped>
.user-page {
  background-color: #fff; /* 移除灰色背景 */
  padding-top: 20px; /* 顶部间距 */
  margin: 0 auto;
  max-width: 1000px; /* 设置最大宽度并居中 */
}

.user {
  background-color: #fff; /* 用户信息区域背景色 */
  padding: 20px;
  box-shadow: none;
  border-radius: 0;
}

.user-content-wrapper {
  display: flex;
  align-items: stretch; /* 使子项等高 */
}

.avatar-section {
  flex-shrink: 0; /* 防止头像区域缩小 */
  margin-right: 20px; /* 头像与信息间距 */
  display: flex;
  align-items: center; /* 垂直居中头像 wrapper */
  justify-content: center; /* 水平居中头像 wrapper */
  /* 尝试让头像区域的宽度等于其由右侧内容确定的高度 */
  width: 184px; /* 显式设置一个宽度，基于截图的高度 */
  height: auto; /* 高度由 align-items: stretch 决定 */
  aspect-ratio: 1 / 1; /* 保持宽高比 */
}

.avatar-wrapper {
  /* 让 wrapper 占满头像区域的宽度和高度 */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center; /* 垂直居中头像 */
  justify-content: center; /* 水平居中头像 */
  position: relative; /* 使蒙层能够绝对定位在其内部 */
  overflow: hidden; /* 隐藏超出部分的蒙层 */
  border-radius: 50%; /* 使蒙层形状与圆形头像匹配 */
}

.avatar-wrapper .v-avatar {
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色蒙层 */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.3s ease; /* 添加过渡效果 */
  cursor: pointer; /* 鼠标样式为手型 */
  color: #fff; /* 蒙层上的图标或文字颜色 */
}

.avatar-section:hover .avatar-overlay {
  opacity: 1; /* 鼠标悬停时显示 */
}

.info-section {
  flex-grow: 1;
  display: flex; /* 使 info-section 成为 flex 容器 */
  flex-direction: column; /* 垂直排列子元素 */
  justify-content: space-between; /* 在垂直方向上平均分配空间 */
}

.avatar {
  margin-right: 20px; /* 头像与信息间距 */
  width: auto;
  height: auto;
}

.basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-basic {
  display: flex;
  flex-direction: column;
}

.user-nickname {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.user-redId {
  font-size: 14px;
  color: #888;
}

.user-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #555;
}

.user-tags {
  margin-top: 8px;
}

.gender .v-icon {
  vertical-align: middle;
}

.user-id-text {
  font-size: 12px; /* 设置字体大小为 12px */
}

.data-info {
  margin-top: auto; /* 将此元素推到 flex 容器的底部 */
}

.user-interactions {
  display: flex;
  gap: 20px; /* 统计数据之间的间距 */
}

.user-interactions .count {
  font-weight: bold;
  margin-right: 4px;
}

.user-interactions .shows {
  font-size: 14px;
  color: #888;
}

.profile-nav {
  display: flex;
  justify-content: space-around; /* 使项目之间有空间 */
  margin-top: 20px; /* 与分割线的间距 */
  font-size: 16px;
  border-bottom: 1px solid #eee; /* 添加底部细线 */
}

.nav-item {
  cursor: pointer;
  padding: 10px;
  position: relative; /* 用于底部激活指示线 */
}

.nav-item.active {
  color: #000; /* 激活状态字体颜色 */
  font-weight: bold; /* 激活状态字体加粗 */
}

.nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-color: #1890ff; 
}

v-divider {
  margin-top: 20px;
}

.tab-content {
  margin-top: 20px; /* 与导航的间距 */
  padding: 0 20px; /* 内容内边距 */
}

/* 删除与选项卡相关的样式 */
/*
.reds-sticky-box {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.reds-tabs-list {
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.reds-tab-item {
  padding: 10px 0;
  cursor: pointer;
  font-size: 16px;
  color: #555;
  flex-grow: 1;
  text-align: center;
  border-right: 1px solid #eee;
}

.reds-tab-item:last-child {
  border-right: none;
}

.reds-tab-item.active {
  color: #000;
  font-weight: bold;
  border-bottom: 2px solid red;
}
*/

/* 删除与内容区域相关的样式 */
/*
.feeds-tab-container {
   margin: 20px auto;\n   max-width: 1000px;\n}
*/

.divider {
  height: 1px;
  background-color: #eee;
  margin: 0 auto;
  max-width: 1000px; /* 适当调整最大宽度，或移除 */
}

</style>