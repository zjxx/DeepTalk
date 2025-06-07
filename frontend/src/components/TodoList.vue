<template>
  <v-card class="todo-list" elevation="2">
    <v-card-title class="d-flex align-center title-section">
      <v-icon icon="mdi-format-list-checks" class="mr-2 title-icon"></v-icon>
      今日待办
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        size="small"
        prepend-icon="mdi-plus"
        @click="showAddDialog = true"
        class="add-btn"
      >
        添加任务
      </v-btn>
    </v-card-title>

    <v-card-text class="timeline-section">
      <v-timeline align="start" side="end">
        <v-timeline-item
          v-for="todo in todos"
          :key="todo.id"
          :dot-color="todo.completed ? 'success' : getCategoryColor(todo.category)"
          size="small"
          class="timeline-item"
        >
          <div class="d-flex">
            <strong class="me-4 time-text">{{ todo.time }}</strong>
            <div class="task-content">
              <div class="d-flex align-center">
                <v-checkbox
                  v-model="todo.completed"
                  :label="todo.title"
                  class="mr-2 task-checkbox"
                  hide-details
                  density="compact"
                  color="primary"
                ></v-checkbox>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteTodo(todo.id)"
                  class="delete-btn"
                ></v-btn>
              </div>
              <div class="text-caption category-text">
                {{ todo.category }}
              </div>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>

    <!-- 添加任务对话框 -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">添加新任务</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newTodo.title"
            label="任务标题"
            required
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-text-field
            v-model="newTodo.time"
            label="时间"
            type="time"
            required
            variant="outlined"
            class="mb-4"
          ></v-text-field>
          <v-select
            v-model="newTodo.category"
            :items="categories"
            label="分类"
            required
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showAddDialog = false">
            取消
          </v-btn>
          <v-btn color="primary" @click="addTodo" class="add-confirm-btn">
            添加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  id: number
  title: string
  completed: boolean
  time: string
  category: string
}

const categories = [
  '开发任务',
  '功能开发',
  'UI设计',
  '团队协作',
  '会议',
  '其他'
]

// 本地数据
const todos = ref<Todo[]>([
  {
    id: 1,
    title: '完成口语对战功能开发',
    completed: false,
    time: '09:00',
    category: '开发任务'
  },
  {
    id: 2,
    title: '实现评分系统',
    completed: true,
    time: '11:30',
    category: '功能开发'
  },
  {
    id: 3,
    title: '优化用户界面',
    completed: false,
    time: '14:00',
    category: 'UI设计'
  },
  {
    id: 4,
    title: '代码审查',
    completed: false,
    time: '16:30',
    category: '团队协作'
  }
])

const showAddDialog = ref(false)
const newTodo = ref<Omit<Todo, 'id' | 'completed'>>({
  title: '',
  time: '',
  category: ''
})

// 获取分类对应的颜色
const getCategoryColor = (category: string): string => {
  const colorMap: { [key: string]: string } = {
    '开发任务': 'blue',
    '功能开发': 'green',
    'UI设计': 'purple',
    '团队协作': 'orange',
    '会议': 'red',
    '其他': 'grey'
  }
  return colorMap[category] || 'primary'
}

// 添加新任务
const addTodo = () => {
  if (newTodo.value.title && newTodo.value.time && newTodo.value.category) {
    todos.value.push({
      id: Date.now(),
      title: newTodo.value.title,
      completed: false,
      time: newTodo.value.time,
      category: newTodo.value.category
    })
    newTodo.value.title = ''
    newTodo.value.time = ''
    newTodo.value.category = ''
    showAddDialog.value = false
  }
}

// 删除任务
const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}
</script>

<style scoped>
.todo-list {
  max-width: 800px;
  margin: 20px auto;
  border-radius: 12px;
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
}

.title-section {
  background: linear-gradient(45deg, #1976d2, #2196f3);
  color: white;
  padding: 16px 24px;
  border-radius: 12px 12px 0 0;
}

.title-icon {
  color: white;
}

.add-btn {
  background-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(5px);
}

.timeline-section {
  padding: 24px;
}

.timeline-item {
  min-height: 60px;
  margin-bottom: 16px;
}

.time-text {
  color: #1976d2;
  font-size: 0.9rem;
  min-width: 60px;
}

.task-content {
  flex: 1;
}

.task-checkbox {
  margin-top: 0;
}

.category-text {
  color: #666;
  margin-top: 4px;
  font-weight: 500;
}

.delete-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.dialog-card {
  border-radius: 12px;
}

.dialog-title {
  background: linear-gradient(45deg, #1976d2, #2196f3);
  color: white;
  padding: 16px 24px;
  border-radius: 12px 12px 0 0;
}

.add-confirm-btn {
  background: linear-gradient(45deg, #1976d2, #2196f3) !important;
}

.me-4 {
  margin-right: 16px;
}

:deep(.v-timeline-item__body) {
  padding: 4px 0;
  background-color: transparent;
  box-shadow: none;
}

:deep(.v-timeline-item__dot) {
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1);
}

:deep(.v-checkbox .v-label) {
  color: #333;
  font-weight: 500;
}

:deep(.v-checkbox.v-selection-control--dirty .v-label) {
  color: #666;
  text-decoration: line-through;
}
</style> 