<template>
    <div class="websocket-demo">
      <h1>WebSocket 示例</h1>
      
      <div class="connection-status">
        <div class="status-indicator" :class="{ connected: isConnected }"></div>
        <span>{{ connectionStatus }}</span>
        <button @click="toggleConnection" class="connect-btn">
          {{ isConnected ? '断开连接' : '连接' }}
        </button>
        <button @click="sendConnectRequest" class="connect-btn" style="background-color: #2196F3;">
          发送连接请求
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

      <div class="video-container">
        <div class="video-wrapper">
          <video ref="uiLocalVideo" autoplay playsinline muted></video>
          <span class="video-label">本地视频</span>
        </div>
        <div class="video-wrapper">
          <video ref="uiRemoteVideo" autoplay playsinline></video>
          <span class="video-label">远程视频</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted, computed, nextTick, onMounted } from 'vue'
  
  import { http } from '../utils/http'
  
  // 声明全局变量
  declare const kurentoUtils: {
    WebRtcPeer: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      WebRtcPeerSendrecv: new (options: any, callback: (error: Error | null) => void) => WebRTCPeer;
    };
  };
  
  // 定义类型
  interface WebRTCPeer {
    dispose: () => void;
    generateOffer: (callback: (error: Error | null, sdpOffer: string) => void) => void;
    processAnswer: (sdpAnswer: string, callback: (error: Error | null) => void) => void;
    addIceCandidate: (candidate: RTCIceCandidate, callback: (error: Error | null) => void) => void;
  }

  type ConnectResponse = string;

  interface WebSocketMessage {
    id: string;
    sdpAnswer?: string;
    candidate?: RTCIceCandidate;
    message?: string;
  }
  
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<Array<{ content: string; time: string }>>([])
  const newMessage = ref('')
  const messageList = ref<HTMLElement | null>(null)
  const sessionId = ref('')
  const webRtcPeer = ref<WebRTCPeer | null>(null)
  const uiLocalVideo = ref<HTMLVideoElement | null>(null)
  const uiRemoteVideo = ref<HTMLVideoElement | null>(null)
  
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
    const wsUrl = 'ws://115.175.45.173:8080/api/speech/kurento'
  
    try {
      ws.value = new WebSocket(wsUrl)
      
      ws.value.onopen = () => {
        isConnected.value = true
        addMessage('系统', 'WebSocket 连接成功')
      }
      
      ws.value.onmessage = handleWebSocketMessage
      
      ws.value.onclose = () => {
        isConnected.value = false
        addMessage('系统', 'WebSocket 连接已断开')
        stopWebRTC()
      }
      
      ws.value.onerror = (error) => {
        console.error('WebSocket错误:', error)
        addMessage('系统', 'WebSocket 连接发生错误')
        stopWebRTC()
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      addMessage('系统', '创建 WebSocket 连接失败')
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
  
  const sendConnectRequest = async () => {
    try {
      // const userId = String(Math.floor(Math.random() * 100000))
      // const response = await http.post<ConnectResponse>('http://115.175.45.173:8080/api/speech/connect', {
      //   userId: userId,
      //   sessionId: "", // This will be empty for the first connection
      // })
      const response = "e5cebf40-265b-4daa-8e46-95001ff03706"
      if (response) {
        sessionId.value = response.toString()
        addMessage('系统', `连接请求成功，获取到 sessionId: ${sessionId.value}`)
        // 连接成功后自动开始 WebRTC 连接
        startWebRTC()
      } else {
        addMessage('系统', '连接请求失败：未获取到 sessionId')
      }
    } catch (error: unknown) {
      console.error('连接请求失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      addMessage('系统', `连接请求失败: ${errorMessage}`)
    }
  }
  
  const startWebRTC = () => {
    if (!sessionId.value) {
      addMessage('系统', '没有有效的 sessionId，无法启动 WebRTC')
      return
    }

    if (typeof kurentoUtils === 'undefined' || !kurentoUtils.WebRtcPeer) {
      addMessage('系统', 'WebRTC 工具未正确加载，请刷新页面重试')
      return
    }

    const options = {
      localVideo: uiLocalVideo.value,
      remoteVideo: uiRemoteVideo.value,
      mediaConstraints: { audio: true, video: true },
      onicecandidate: (candidate: RTCIceCandidate) => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
          ws.value.send(JSON.stringify({
            id: 'ADD_ICE_CANDIDATE',
            candidate: candidate,
            sessionId: sessionId.value,
          }))
        }
      },
    }

    try {
      webRtcPeer.value = new kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, (err: Error | null) => {
        if (err) {
          addMessage('系统', `WebRTC 错误: ${err.message}`)
          stopWebRTC()
          return
        }

        webRtcPeer.value?.generateOffer((err: Error | null, sdpOffer: string) => {
          if (err) {
            addMessage('系统', `生成 SDP Offer 错误: ${err.message}`)
            stopWebRTC()
            return
          }

          if (ws.value && ws.value.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify({
              id: 'PROCESS_SDP_OFFER',
              sdpOffer: sdpOffer,
              sessionId: sessionId.value,
            }))
          }
        })
      })
    } catch (error) {
      console.error('创建 WebRTC Peer 失败:', error)
      addMessage('系统', `创建 WebRTC Peer 失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }
  
  const stopWebRTC = () => {
    if (webRtcPeer.value) {
      webRtcPeer.value.dispose()
      webRtcPeer.value = null
    }
  }
  
  const handleWebSocketMessage = (event: MessageEvent) => {
    const jsonMessage = JSON.parse(event.data) as WebSocketMessage
    console.log('收到消息:', jsonMessage)

    switch (jsonMessage.id) {
      case 'PROCESS_SDP_ANSWER':
        if (webRtcPeer.value && jsonMessage.sdpAnswer) {
          webRtcPeer.value.processAnswer(jsonMessage.sdpAnswer, (err: Error | null) => {
            if (err) {
              addMessage('系统', `处理 SDP Answer 错误: ${err.message}`)
              stopWebRTC()
              return
            }
          })
        }
        break
      case 'ADD_ICE_CANDIDATE':
        if (webRtcPeer.value && jsonMessage.candidate) {
          webRtcPeer.value.addIceCandidate(jsonMessage.candidate, (err: Error | null) => {
            if (err) {
              console.error('添加 ICE candidate 错误:', err.message)
            }
          })
        }
        break
      case 'ERROR':
        addMessage('系统', `服务器错误: ${jsonMessage.message || '未知错误'}`)
        stopWebRTC()
        break
      default:
        addMessage('服务器', event.data)
    }
  }
  
  onUnmounted(() => {
    stopWebRTC()
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

  .video-container {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }

  .video-wrapper {
    flex: 1;
    position: relative;
  }

  .video-wrapper video {
    width: 100%;
    max-width: 400px;
    background-color: #000;
    border-radius: 4px;
  }

  .video-label {
    position: absolute;
    bottom: 10px;
    left: 10px;
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 4px 8px;
    border-radius: 4px;
  }
  </style>