<template>
  <v-container fluid>
    <div class="page-header">
      <h1>历史战绩</h1>
      <p class="subtitle">查看你近期的对战与评分记录，持续进步每一天！</p>
    </div>
    <v-row>
      <v-col v-for="(score, index) in scores" :key="index" cols="12">
        <v-card class="mx-auto score-card" max-width="800" elevation="4" rounded="xl">
          <v-card-title class="text-h6 card-title">{{ score.type }}</v-card-title>
          <v-card-text>
            <div class="score-row">
              <span class="score-type">{{ score.type }}</span>
              <span class="score-info">难度: {{ score.difficulty }}</span>
              <span class="score-info">CET等级: {{ score.cetLevel }}</span>
              <span class="score-value">评分: <b>{{ score.score }}</b></span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const scores = ref([
  { type: 'AI智能对战', difficulty: '初级', cetLevel: 'CET-4', score: 85 },
  { type: '真人对战', difficulty: '中级', cetLevel: 'CET-6', score: 92 },
  { type: 'AI智能对战', difficulty: '高级', cetLevel: 'CET-4', score: 78 },
  { type: '真人对战', difficulty: '初级', cetLevel: 'CET-6', score: 88 },
  { type: 'AI智能对战', difficulty: '中级', cetLevel: 'CET-4', score: 90 },
])
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  /* 保证和卡片左边对齐 */
  padding-left: 0;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.v-card.score-card {
  transition: transform 0.3s, box-shadow 0.3s;
  background: linear-gradient(135deg, #e0ecff 0%, #f5faff 100%);
  box-shadow: 0 4px 24px 0 rgba(80, 120, 200, 0.10);
  border-radius: 24px;
  margin-bottom: 24px;
}

.v-card.score-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 8px 32px 0 rgba(80, 120, 200, 0.18);
}

.card-title {
  text-align: center;
  font-weight: 700;
  color: #3b5998;
  letter-spacing: 2px;
}

.score-row {
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 18px;
  padding: 12px 0;
}

.score-type {
  font-weight: 600;
  color: #4a90e2;
}

.score-info {
  color: #666;
}

.score-value {
  color: #ff6f61;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 1px;
}
</style>