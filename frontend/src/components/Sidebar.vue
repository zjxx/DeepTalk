<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click.stop="rail = false"
    app
  >
    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-account"
        title="首页"
        value="home"
        to="/home"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-cog"
        title="个人信息"
        value="profile"
        to="/profile"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-source-repository"
        title="我的仓库"
        value="repositories"
        to="/repositories"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-shield-account"
        title="隐私与安全"
        value="security"
        to="/security"
      ></v-list-item>
    </v-list>
    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          icon
          @click.stop="rail = !rail"
        >
          <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'Sidebar',
  setup() {
    const drawer = ref(true)
    const rail = ref(false)

    return {
      drawer,
      rail
    }
  }
})
</script>

<style scoped>
.v-navigation-drawer {
  background-color: #fff;
  border-right: 1px solid #e0e0e0;
}

.v-list-item {
  margin: 4px 0;
}

.v-list-item:hover {
  background-color: #f5f5f5;
}
</style> 