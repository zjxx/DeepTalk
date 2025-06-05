<template>
    <div class="websocket-demo">
      <h1>WebSocket 示例</h1>
      
      <div class="connection-status">
        <div class="status-indicator" :class="{ connected: isConnected }"></div>
        <span>{{ connectionStatus }}</span>
        <button @click="toggleConnection" class="connect-btn">
          {{ isConnected ? '断开连接' : '连接' }}
        </button>
      </div>
  
      <div class="message-container">
        <div class="message-list" ref="messageList">
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <span class="message-time">{{ msg.time }}</span>
            <span class="message-content">{{ msg.content }}</span>
          </div>
        </div>
  
        <div class="message-input">
          <input 
            v-model="newMessage" 
            @keyup.enter="sendMessage"
            placeholder="输入消息..."
            :disabled="!isConnected"
          >
          <button @click="sendMessage" :disabled="!isConnected">发送</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref,onUnmounted, computed, nextTick } from 'vue'
  
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<Array<{ content: string; time: string }>>([])
  const newMessage = ref('')
  const messageList = ref<HTMLElement | null>(null)
  
  const connectionStatus = computed(() => {
    return isConnected.value ? '已连接' : '未连接'
  })
  
  const toggleConnection = () => {
    if (isConnected.value) {
      ws.value?.close()
    } else {
      connectWebSocket()
    }
  }
  
  const connectWebSocket = () => {
    const wsUrl = 'ws://10.208.90.113:8765'
  
    try {
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        isConnected.value = true
        addMessage('系统', '连接成功')
      }
      
      ws.value.onmessage = (event) => {
        addMessage('服务器', event.data)
      }
      
      ws.value.onclose = () => {
        isConnected.value = false
        addMessage('系统', '连接已断开')
      }
      
      ws.value.onerror = (error) => {
        console.error('WebSocket错误:', error)
        addMessage('系统', '连接发生错误')
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      addMessage('系统', '创建连接失败')
    }
  }
  
  const sendMessage = () => {
    if (!newMessage.value.trim() || !ws.value || ws.value.readyState !== WebSocket.OPEN) return
  
    ws.value.send(newMessage.value)
    addMessage('我', newMessage.value)
    newMessage.value = ''
  }
  
  const addMessage = (sender: string, content: string) => {
    const time = new Date().toLocaleTimeString()
    messages.value.push({ content: `${sender}: ${content}`, time })
  
    nextTick(() => {
      if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
      }
    })
  }
  
  onUnmounted(() => {
    if (ws.value) {
      ws.value.close()
    }
  })
  </script>
  
  <style scoped>
  .websocket-demo {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
  }
  
  .connection-status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #ff4444;
  }
  
  .status-indicator.connected {
    background-color: #00ff00;
  }
  
  .connect-btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
  }
  
  .connect-btn:hover {
    background-color: #45a049;
  }
  
  .message-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .message-list {
    height: 400px;
    overflow-y: auto;
    padding: 10px;
    background-color: #f9f9f9;
  }
  
  .message {
    margin-bottom: 10px;
    padding: 8px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  
  .message-time {
    font-size: 0.8em;
    color: #666;
    margin-right: 8px;
  }
  
  .message-input {
    display: flex;
    padding: 10px;
    background-color: white;
    border-top: 1px solid #ddd;
  }
  
  .message-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
  }
  
  .message-input button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #2196F3;
    color: white;
    cursor: pointer;
  }
  
  .message-input button:hover {
    background-color: #1976D2;
  }
  
  .message-input button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  </style>