import { ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WebSocketEventCallback = (...args: any[]) => void;

export class WebSocketService {
  private ws: WebSocket | null = null
  private isConnected = ref(false)
  private eventListeners: Map<string, WebSocketEventCallback[]> = new Map()
  public userId: string = `user_${Math.random().toString(36).substr(2, 9)}`

  constructor(private url: string) {}

  connect(): Promise<void> {
    if (this.isConnected.value) {
      console.log('WebSocket is already connected.')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.isConnected.value = true
          console.log('WebSocket connection established.')
          this.emit('open')
          this.sendUserJoin()
          resolve()
        }

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          this.emit(data.type, data)
        }

        this.ws.onclose = () => {
          this.isConnected.value = false
          console.log('WebSocket connection closed.')
          this.emit('close')
          this.ws = null
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.emit('error', error)
          reject(error)
        }
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected.value
  }

  on(eventName: string, callback: WebSocketEventCallback): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)?.push(callback)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(eventName: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(eventName)
    if (listeners) {
      listeners.forEach(callback => callback(...args))
    }
  }

  private send(data: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not open. Cannot send data.')
    }
  }
  
  private sendUserJoin(): void {
    this.send({
      type: 'user_join',
      userId: this.userId,
      userName: `用户${this.userId.slice(-4)}`
    })
  }

  async sendAudio(audioBlob: Blob): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const base64Data = await this.blobToBase64(audioBlob)
        this.send({
          type: 'voice',
          userId: this.userId,
          audioData: base64Data,
          format: audioBlob.type,
          metadata: {
            size: audioBlob.size,
            timestamp: Date.now(),
            mimeType: audioBlob.type
          }
        })
        console.log('Audio data sent via WebSocket.')
      } catch (error) {
        console.error('Failed to send audio data:', error)
      }
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // result contains the data as a URL (e.g., data:audio/webm;base64,xxxx)
        // we only need the base64 part
        const base64String = (reader.result as string).split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
} 