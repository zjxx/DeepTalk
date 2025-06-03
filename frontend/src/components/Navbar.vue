<template>
  <a-layout-header class="header">
    <div class="logo">DeepTalk</div>
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="horizontal"
      class="main-menu"
    >
      <a-menu-item key="home">
        <router-link to="/home">
          <compass-outlined />
          主页
        </router-link>
      </a-menu-item>
      <a-menu-item key="profile">
        <router-link to="/profile">
          <home-outlined />
          个人资料
        </router-link>
      </a-menu-item>
      
      <a-menu-item key="explore">
        <router-link to="/explore">
          <compass-outlined />
          探索
        </router-link>
      </a-menu-item>
      <a-menu-item key="community">
        <router-link to="/community">
          <team-outlined />
          社区
        </router-link>
      </a-menu-item>
      <a-menu-item key="shop">
        <router-link to="/shop">
          <shop-outlined />
          商店
        </router-link>
      </a-menu-item>
    </a-menu>
    <a-menu mode="horizontal" :selectable="false">
      <a-menu-item key="settings">
        <router-link to="/settings">
          <setting-outlined />
          设置
        </router-link>
      </a-menu-item>
    </a-menu>
  </a-layout-header>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
  HomeOutlined,
  CompassOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'

export default defineComponent({
  name: 'Navbar',
  components: {
    HomeOutlined,
    CompassOutlined,
    TeamOutlined,
    ShopOutlined,
    SettingOutlined
  },
  setup() {
    const selectedKeys = ref(['home'])
    return {
      selectedKeys
    }
  }
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  padding: 0;
  background: #fff;
  box-shadow: none;
  width: 100%;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  padding: 0 24px;
}

.main-menu {
  flex: 1;
  border-bottom: none;
}

.ant-menu-horizontal.ant-menu-root {
  line-height: 64px;
  border-bottom: none;
}

.ant-menu-horizontal.ant-menu-root > .ant-menu-item,
.ant-menu-horizontal.ant-menu-root > .ant-menu-submenu {
  padding: 0 16px;
}
</style> 