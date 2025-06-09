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
        :loading="loading"
      >
        添加任务
      </v-btn>
    </v-card-title>

    <v-card-text class="timeline-section">
      <v-timeline align="start" side="end">
        <v-timeline-item
          v-for="todo in todos"
          :key="todo.id"
          :dot-color="todo.completed ? 'success' : 'primary'"
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
                  @update:model-value="(val: boolean | null) => val !== null && updateTodoStatus(todo.id, val)"
                ></v-checkbox>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteTodo(todo.id)"
                  class="delete-btn"
                  :loading="loading"
                ></v-btn>
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
            :disabled="loading"
          ></v-text-field>
          <v-text-field
            v-model="newTodo.time"
            label="时间"
            type="time"
            required
            variant="outlined"
            :disabled="loading"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="showAddDialog = false" :disabled="loading">
            取消
          </v-btn>
          <v-btn color="primary" @click="addTodo" class="add-confirm-btn" :loading="loading">
            添加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Todo {
  id: number
  title: string
  completed: boolean
  time: string
}

const loading = ref(false)
const todos = ref<Todo[]>([])
const showAddDialog = ref(false)
const newTodo = ref<Omit<Todo, 'id' | 'completed'>>({
  title: '',
  time: ''
})

// 模拟后端数据
const mockTodos: Todo[] = [
  {
    id: 1,
    title: '完成口语对战功能开发',
    completed: false,
    time: '09:00'
  },
  {
    id: 2,
    title: '实现评分系统',
    completed: true,
    time: '11:30'
  },
  {
    id: 3,
    title: '优化用户界面',
    completed: false,
    time: '14:00'
  },
  {
    id: 4,
    title: '代码审查',
    completed: false,
    time: '16:30'
  }
]

// 模拟获取待办事项列表
const fetchTodos = async () => {
  loading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    todos.value = [...mockTodos].sort((a, b) => a.time.localeCompare(b.time))
  } catch (error) {
    console.error('获取待办事项失败:', error)
  } finally {
    loading.value = false
  }
}

// 模拟添加待办事项
const addTodo = async () => {
  if (newTodo.value.title && newTodo.value.time) {
    loading.value = true
    try {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newItem: Todo = {
        id: Date.now(),
        title: newTodo.value.title,
        completed: false,
        time: newTodo.value.time
      }
      
      // 模拟后端添加
      mockTodos.push(newItem)
      // 更新本地数据并排序
      todos.value = [...mockTodos].sort((a, b) => a.time.localeCompare(b.time))
      
      newTodo.value.title = ''
      newTodo.value.time = ''
      showAddDialog.value = false
    } catch (error) {
      console.error('添加待办事项失败:', error)
    } finally {
      loading.value = false
    }
  }
}

// 模拟删除待办事项
const deleteTodo = async (id: number) => {
  loading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟后端删除
    const index = mockTodos.findIndex(todo => todo.id === id)
    if (index !== -1) {
      mockTodos.splice(index, 1)
      // 更新本地数据
      todos.value = [...mockTodos].sort((a, b) => a.time.localeCompare(b.time))
    }
  } catch (error) {
    console.error('删除待办事项失败:', error)
  } finally {
    loading.value = false
  }
}

// 模拟更新待办事项状态
const updateTodoStatus = async (id: number, completed: boolean) => {
  loading.value = true
  try {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟后端更新
    const todo = mockTodos.find(todo => todo.id === id)
    if (todo) {
      todo.completed = completed
      // 更新本地数据
      todos.value = [...mockTodos].sort((a, b) => a.time.localeCompare(b.time))
    }
  } catch (error) {
    console.error('更新待办事项状态失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化时获取数据
onMounted(() => {
  fetchTodos()
})
</script>

<style scoped>
.todo-list {
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  display: flex;
  flex-direction: column;
}

.title-section {
  background: linear-gradient(135deg, #e0ecff 0%, #f5faff 100%);
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
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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

.delete-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-title {
  background: linear-gradient(45deg, #1976d2, #2196f3) !important;
  color: white !important;
  padding: 16px 24px;
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