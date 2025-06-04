<!-- src/components/QuestionBankDemo.vue -->
<template>
  <v-card>
    <v-card-title>题库接口演示</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedDifficulty"
            :items="difficultyOptions"
            label="难度等级"
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn color="primary" @click="loadQuestion" :loading="loading">
            获取随机题目
          </v-btn>
        </v-col>
        <v-col cols="12" md="4">
          <v-btn color="secondary" @click="showStats" variant="outlined">
            题库统计
          </v-btn>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <!-- 当前题目显示 -->
      <div v-if="currentQuestion">
        <v-alert type="success" class="mb-4">
          成功获取题目！ID: {{ currentQuestion.id }}
        </v-alert>
        
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-h6">{{ currentQuestion.topic }}</v-card-title>
          <v-card-subtitle>
            <v-chip size="small" :color="difficultyColors[currentQuestion.difficulty]" class="mr-2">
              {{ difficultyLabels[currentQuestion.difficulty] }}
            </v-chip>
            <v-chip size="small" color="info" class="mr-2">
              {{ currentQuestion.category }}
            </v-chip>
            <v-chip size="small" color="grey">
              {{ currentQuestion.estimatedTime }}分钟
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            <p class="mb-3">{{ currentQuestion.description }}</p>
            <v-divider class="mb-3"></v-divider>
            <h4 class="mb-2">对话提示:</h4>
            <v-list density="compact">
              <v-list-item
                v-for="(prompt, index) in currentQuestion.prompts"
                :key="index"
                :prepend-icon="'mdi-chevron-right'"
              >
                {{ prompt }}
              </v-list-item>
            </v-list>
            <v-chip-group class="mt-3">
              <v-chip
                v-for="tag in currentQuestion.tags"
                :key="tag"
                size="small"
                variant="outlined"
              >
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </div>

      <!-- 错误信息 -->
      <v-alert v-if="errorMessage" type="error" class="mb-4">
        {{ errorMessage }}
      </v-alert>

      <!-- 题库统计 -->
      <v-card v-if="showStatsPanel" variant="outlined" class="mb-4">
        <v-card-title>题库统计信息</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6" md="3">
              <div class="text-center">
                <div class="text-h4 text-primary">{{ stats.total }}</div>
                <div class="text-caption">总题目数</div>
              </div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-center">
                <div class="text-h4 text-success">{{ stats.byDifficulty.beginner }}</div>
                <div class="text-caption">初级</div>
              </div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-center">
                <div class="text-h4 text-warning">{{ stats.byDifficulty.intermediate }}</div>
                <div class="text-caption">中级</div>
              </div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-center">
                <div class="text-h4 text-error">{{ stats.byDifficulty.advanced }}</div>
                <div class="text-caption">高级</div>
              </div>
            </v-col>
          </v-row>
          <v-divider class="my-3"></v-divider>
          <div>
            <h4 class="mb-2">分类:</h4>
            <v-chip-group>
              <v-chip v-for="category in stats.categories" :key="category" size="small">
                {{ category }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-card-text>
      </v-card>

      <!-- API 调用记录 -->
      <v-expansion-panels v-if="apiCalls.length > 0">
        <v-expansion-panel title="API 调用记录">
          <v-expansion-panel-text>
            <v-list>
              <v-list-item v-for="(call, index) in apiCalls" :key="index">
                <v-list-item-title>
                  <v-icon :color="call.success ? 'success' : 'error'" class="mr-2">
                    {{ call.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                  </v-icon>
                  {{ call.timestamp.toLocaleTimeString() }} - {{ call.type }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ call.success ? '成功' : call.error }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getRandomQuestion, getQuestionBankStats, type QuestionData } from '../api/QuestionBankAPI'

const loading = ref(false)
const currentQuestion = ref<QuestionData | null>(null)
const errorMessage = ref('')
const selectedDifficulty = ref<'beginner' | 'intermediate' | 'advanced' | null>(null)
const showStatsPanel = ref(false)
const stats = ref(getQuestionBankStats())
const apiCalls = ref<Array<{
  timestamp: Date
  type: string
  success: boolean
  error?: string
}>>([])

const difficultyOptions = [
  { title: '初级', value: 'beginner' },
  { title: '中级', value: 'intermediate' },
  { title: '高级', value: 'advanced' }
]

const difficultyLabels = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级'
}

const difficultyColors = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error'
}

const loadQuestion = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const response = await getRandomQuestion({
      difficulty: selectedDifficulty.value || undefined
    })
    
    apiCalls.value.unshift({
      timestamp: new Date(),
      type: `获取${selectedDifficulty.value ? difficultyLabels[selectedDifficulty.value] : '随机'}题目`,
      success: response.success
    })
    
    if (response.success && response.data) {
      currentQuestion.value = response.data
    } else {
      errorMessage.value = response.message || '获取题目失败'
      apiCalls.value[0].error = errorMessage.value
    }  } catch (error) {
    console.error('获取题目时发生错误:', error)
    errorMessage.value = '网络请求失败'
    apiCalls.value.unshift({
      timestamp: new Date(),
      type: '获取题目',
      success: false,
      error: errorMessage.value
    })
  } finally {
    loading.value = false
  }
}

const showStats = () => {
  showStatsPanel.value = !showStatsPanel.value
  stats.value = getQuestionBankStats()
  
  apiCalls.value.unshift({
    timestamp: new Date(),
    type: '获取题库统计',
    success: true
  })
}
</script>