<template>
  <div class="home">
    <v-container fluid>
      <v-row>
        <!-- 左侧待办列表 -->
        <v-col cols="12" md="6">
          <TodoList />
        </v-col>
        
        <!-- 右侧评分图表 -->
        <v-col cols="12" md="6">
          <ScoreChart />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import TodoList from '../components/TodoList.vue'
import ScoreChart from '../components/ScoreChart.vue'
</script>

<style scoped>
.home {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>