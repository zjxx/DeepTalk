<template>
    <div class="websocket-demo">
      <h1>语音聊天室</h1>
      
      <div class="connection-status">
        <div class="status-indicator" :class="{ connected: isConnected }"></div>
        <span>{{ connectionStatus }}</span>
        <button @click="toggleConnection" class="connect-btn">
          {{ isConnected ? '断开连接' : '连接' }}
        </button>
      </div>
  
      <div class="voice-chat-container">
        <!-- 用户列表 -->
        <div class="user-list">
          <h3>在线用户</h3>
          <div v-for="user in connectedUsers" :key="user.id" class="user-item">
            <span class="user-name">{{ user.name }}</span>
            <div class="voice-indicator" :class="{ active: user.isSpeaking }"></div>
          </div>
        </div>
  
        <!-- 语音控制区域 -->
        <div class="voice-controls">
          <button 
            @click="toggleMicrophone" 
            class="mic-btn"
            :class="{ 'recording': isRecording }"
            :disabled="!isConnected"
          >
            <span class="mic-icon">{{ isRecording ? '🎤' : '🔇' }}</span>
            {{ isRecording ? '停止录音' : '开始录音' }}
          </button>
  
          <!-- 音量指示器 -->
          <div v-if="isRecording" class="audio-level-indicator">
            <div class="audio-level-bar" :style="{ width: `${audioLevel}%` }"></div>
          </div>
        </div>
  
        <!-- 消息历史 -->
        <div class="message-container">
          <div class="message-list" ref="messageList">
            <div v-for="(msg, index) in messages" :key="index" class="message">
              <span class="message-time">{{ msg.time }}</span>
              <span class="message-content">{{ msg.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted, computed, nextTick } from 'vue'
  
  interface User {
    id: string;
    name: string;
    isSpeaking: boolean;
  }
  
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<Array<{ content: string; time: string }>>([])
  const messageList = ref<HTMLElement | null>(null)
  const connectedUsers = ref<User[]>([])
  const isRecording = ref(false)
  const audioLevel = ref(0)
  const mediaRecorder = ref<MediaRecorder | null>(null)
  const audioContext = ref<AudioContext | null>(null)
  const audioAnalyser = ref<AnalyserNode | null>(null)
  const audioDestination = ref<MediaStreamAudioDestinationNode | null>(null)
  const audioChunks = ref<Blob[]>([])
  const audioQueue = ref<ArrayBuffer[]>([])
  const isPlaying = ref(false)
  const userId = ref<string>(`user_${Math.random().toString(36).substr(2, 9)}`)
  
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
    const wsUrl = 'ws://localhost:8765'
  
    try {
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        isConnected.value = true
        addMessage('系统', '连接成功')
        // 发送用户加入消息
        sendUserJoin()
      }
      
      ws.value.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'system': {
            addMessage('系统', data.message)
            break
          }
          case 'user_join': {
            connectedUsers.value.push({
              id: data.userId,
              name: data.userName,
              isSpeaking: false
            })
            addMessage('系统', `${data.userName} 加入了聊天室`)
            break
          }
          case 'user_leave': {
            connectedUsers.value = connectedUsers.value.filter(u => u.id !== data.userId)
            addMessage('系统', `${data.userName} 离开了聊天室`)
            break
          }
          case 'voice': {
            console.log('收到语音数据:', {
              userId: data.userId,
              dataSize: data.audioData.length,
              timestamp: data.metadata?.timestamp,
              format: data.format
            })
            // 如果不是自己发送的音频才播放
            if (data.userId !== userId.value) {
              // 播放接收到的语音数据
              await playAudio(data.audioData)
            } else {
              console.log('跳过播放自己发送的音频')
            }
            // 更新说话状态
            const user = connectedUsers.value.find(u => u.id === data.userId)
            if (user) {
              user.isSpeaking = true
              setTimeout(() => {
                user.isSpeaking = false
              }, 1000)
            }
            break
          }
        }
      }
      
      ws.value.onclose = () => {
        isConnected.value = false
        addMessage('系统', '连接已断开')
        stopRecording()
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
  
  const sendUserJoin = () => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        type: 'user_join',
        userId: userId.value,
        userName: `用户${userId.value.slice(-4)}`
      }))
    }
  }
  
  const toggleMicrophone = async () => {
    if (isRecording.value) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkAudioSupport = () => {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4'
    ]
    
    const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type))
    if (!supportedType) {
      console.warn('浏览器不支持任何音频格式，将使用默认格式')
      return null
    }
    
    console.log('使用音频格式:', supportedType)
    return supportedType
  }
  
  // 初始化音频上下文
  const initAudioContext = () => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext()
      audioDestination.value = audioContext.value.createMediaStreamDestination()
    }
    return audioContext.value
  }
  
  // 播放音频队列
  const playNextAudio = async () => {
    if (isPlaying.value || audioQueue.value.length === 0) return
    
    try {
      isPlaying.value = true
      const audioData = audioQueue.value.shift()
      if (!audioData) {
        console.log('没有可播放的音频数据')
        return
      }
      
      console.log('准备播放音频数据:', {
        size: audioData.byteLength,
        firstBytes: Array.from(new Uint8Array(audioData.slice(0, 10)))
      })
      
      const context = initAudioContext()
      
      // 使用 AudioContext 解码音频数据
      try {
        const audioBuffer = await context.decodeAudioData(audioData.slice(0))
        console.log('音频解码成功:', {
          duration: audioBuffer.duration,
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: audioBuffer.sampleRate
        })
        
        const source = context.createBufferSource()
        source.buffer = audioBuffer
        
        // 创建增益节点来控制音量
        const gainNode = context.createGain()
        gainNode.gain.value = 1.0 // 可以调整音量
        
        // 连接节点
        source.connect(gainNode)
        gainNode.connect(context.destination)
        
        source.onended = () => {
          console.log('音频播放完成')
          isPlaying.value = false
          playNextAudio() // 播放队列中的下一个音频
        }
        
        source.start(0)
        console.log('开始播放音频')
      } catch (decodeError) {
        console.error('音频解码失败:', {
          error: decodeError,
          dataSize: audioData.byteLength,
          firstBytes: Array.from(new Uint8Array(audioData.slice(0, 20)))
        })
        throw decodeError
      }
    } catch (error) {
      console.error('音频播放失败:', error)
      isPlaying.value = false
      // 如果解码失败，尝试播放下一个
      setTimeout(() => playNextAudio(), 100)
    }
  }
  
  const playAudio = async (base64Data: string) => {
    try {
      console.log('开始处理接收到的音频数据')
      
      // 解码 base64 数据
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      console.log('解码后的音频数据:', {
        size: bytes.length,
        firstBytes: Array.from(bytes.slice(0, 10)), // 显示前10个字节
        isWebM: bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3 // WebM文件头检查
      })
      
      // 创建 Blob 对象
      const blob = new Blob([bytes], { type: 'audio/webm;codecs=opus' })
      console.log('创建的Blob:', {
        size: blob.size,
        type: blob.type
      })
      
      // 使用 FileReader 读取 Blob 数据
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          if (!arrayBuffer) {
            console.error('FileReader 没有返回数据')
            return
          }
          
          console.log('FileReader 读取完成:', {
            size: arrayBuffer.byteLength,
            firstBytes: Array.from(new Uint8Array(arrayBuffer.slice(0, 10)))
          })
          
          // 将数据添加到播放队列
          audioQueue.value.push(arrayBuffer)
          console.log('当前音频队列长度:', audioQueue.value.length)
          
          // 如果当前没有在播放，开始播放
          if (!isPlaying.value) {
            await playNextAudio()
          }
        } catch (error) {
          console.error('音频数据处理失败:', error)
        }
      }
      
      reader.onerror = (error) => {
        console.error('文件读取失败:', error)
      }
      
      reader.readAsArrayBuffer(blob)
    } catch (error) {
      console.error('音频数据处理失败:', error)
    }
  }
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      // 初始化音频上下文
      const context = initAudioContext()
      const source = context.createMediaStreamSource(stream)
      audioAnalyser.value = context.createAnalyser()
      audioAnalyser.value.fftSize = 256
      source.connect(audioAnalyser.value)
      
      // 开始录音，使用固定的音频格式
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      }
      
      try {
        mediaRecorder.value = new MediaRecorder(stream, options)
      } catch (e) {
        console.warn('无法使用首选格式，尝试使用默认格式:', e)
        mediaRecorder.value = new MediaRecorder(stream)
      }
      
      audioChunks.value = []
      
      mediaRecorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.value.push(event.data)
        }
      }

      mediaRecorder.value.onstop = () => {
        if (audioChunks.value.length > 0) {
          const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' })
          sendAudioData(audioBlob)
          audioChunks.value = []
        }
      }

      mediaRecorder.value.start()
      isRecording.value = true
      
      // 开始音量监测
      monitorAudioLevel()
    } catch (error) {
      console.error('启动录音失败:', error)
      addMessage('系统', '无法访问麦克风')
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorder.value && isRecording.value) {
      mediaRecorder.value.stop()
      mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
      isRecording.value = false
      audioLevel.value = 0
      
      // 清理音频上下文
      if (audioContext.value) {
        audioContext.value.close()
        audioContext.value = null
        audioDestination.value = null
      }
    }
  }
  
  const monitorAudioLevel = () => {
    if (!audioAnalyser.value || !isRecording.value) return
    
    const dataArray = new Uint8Array(audioAnalyser.value.frequencyBinCount)
    const updateLevel = () => {
      if (!audioAnalyser.value || !isRecording.value) return
      
      audioAnalyser.value.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      audioLevel.value = Math.min(100, (average / 128) * 100)
      
      requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }
  
  const sendAudioData = async (audioData: Blob) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      try {
        const arrayBuffer = await audioData.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // 检查数据大小
        if (arrayBuffer.byteLength < 100) {
          console.log('音频数据太小，跳过发送')
          return
        }
        
        console.log('发送音频数据:', {
          size: arrayBuffer.byteLength,
          firstBytes: Array.from(uint8Array.slice(0, 10)),
          isWebM: uint8Array[0] === 0x1A && uint8Array[1] === 0x45 && uint8Array[2] === 0xDF && uint8Array[3] === 0xA3,
          mimeType: audioData.type
        })
        
        // 将ArrayBuffer转换为base64
        const base64Data = btoa(
          Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('')
        )
        
        ws.value.send(JSON.stringify({
          type: 'voice',
          userId: userId.value,
          audioData: base64Data,
          format: audioData.type,
          metadata: {
            size: arrayBuffer.byteLength,
            timestamp: Date.now(),
            mimeType: audioData.type
          }
        }))
      } catch (error) {
        console.error('发送音频数据失败:', error)
      }
    }
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
    stopRecording()
    if (audioContext.value) {
      audioContext.value.close()
    }
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
  
  .voice-chat-container {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 20px;
    margin-top: 20px;
  }
  
  .user-list {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
  }
  
  .user-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    margin-bottom: 8px;
    background-color: white;
    border-radius: 4px;
  }
  
  .voice-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ccc;
  }
  
  .voice-indicator.active {
    background-color: #4CAF50;
    animation: pulse 1s infinite;
  }
  
  .voice-controls {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
  }
  
  .mic-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background-color: #2196F3;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  }
  
  .mic-btn.recording {
    background-color: #f44336;
    animation: pulse 1.5s infinite;
  }
  
  .audio-level-indicator {
    flex: 1;
    height: 8px;
    background-color: #ddd;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .audio-level-bar {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50 0%, #FFC107 50%, #F44336 100%);
    transition: width 0.1s ease;
  }
  
  .message-container {
    grid-column: 1 / -1;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .message-list {
    height: 300px;
    overflow-y: auto;
    padding: 15px;
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
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  </style>