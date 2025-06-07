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
        prepend-icon="mdi-sword-cross"
        title="口语对战"
        value="versus"
        to="/versus"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-calculator-variant"
        title="评分结果"
        value="evaluation"
        to="/evaluation"
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

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(false)
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