// src/services/AudioService.ts

export class AudioService {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private currentAudioElement: HTMLAudioElement | null = null
  
  // 回调函数
  onRecordingStateChange?: (isRecording: boolean, audioLevel: number) => void
  onRecordingComplete?: (audioBlob: Blob) => void
  onPlaybackStateChange?: (isPlaying: boolean) => void
 async startRecording(): Promise<void> {
  try {
    // 检查是否支持getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持麦克风录音功能')
    }

    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100
      }
    })
    
    this.audioStream = stream
    this.audioChunks = []
    
    // 检查MediaRecorder支持
    if (!window.MediaRecorder) {
      throw new Error('您的浏览器不支持录音功能')
    }

    // 尝试不同的音频格式
    const options: MediaRecorderOptions = {}
    
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options.mimeType = 'audio/webm'
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options.mimeType = 'audio/mp4'
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      options.mimeType = 'audio/ogg;codecs=opus'
    }
    
    this.mediaRecorder = new MediaRecorder(stream, options)
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }
    
    this.mediaRecorder.onstop = () => {
      this.processRecordedAudio()
    }

    this.mediaRecorder.onerror = (event) => {
      console.error('AudioService: 录音错误', event)
      throw new Error('录音过程中发生错误')
    }
    
    // 设置较短的时间片，确保数据及时收集
    this.mediaRecorder.start(250) // 每250ms收集一次数据
    this.startAudioLevelMonitoring(stream)
    
  } catch (error) {
    console.error('AudioService: 录音启动失败', error)
    throw error
  }
}
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => {
          track.stop()
        })
        this.audioStream = null
      }
      
      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(false, 0)
      }
    }
  }

  private startAudioLevelMonitoring(stream: MediaStream): void {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      microphone.connect(analyser)
      analyser.fftSize = 256
      
      const checkAudioLevel = () => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          analyser.getByteFrequencyData(dataArray)
          
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const average = sum / dataArray.length
          const audioLevel = Math.floor((average / 255) * 100)
          
          if (this.onRecordingStateChange) {
            this.onRecordingStateChange(true, audioLevel)
          }
          
          requestAnimationFrame(checkAudioLevel)
        }
      }
      
      checkAudioLevel()
    } catch (error) {
      console.error('AudioService: 音频级别监听启动失败', error)
    }
  }

private processRecordedAudio(): void {
  if (this.audioChunks.length === 0) {
    console.warn('AudioService: 没有录音数据')
    return
  }
  
  // 计算总大小
  const totalSize = this.audioChunks.reduce((total, chunk) => total + chunk.size, 0)
  
  if (totalSize === 0) {
    console.warn('AudioService: 录音数据总大小为0')
    return
  }
  
  // 使用录音时的mimeType，如果没有则尝试推断
  let mimeType = this.mediaRecorder?.mimeType
  if (!mimeType) {
    // 尝试从第一个chunk推断类型
    if (this.audioChunks[0] && this.audioChunks[0].type) {
      mimeType = this.audioChunks[0].type
    } else {
      mimeType = 'audio/webm' // 默认类型
    }
  }
  
  // 创建音频blob
  const audioBlob = new Blob(this.audioChunks, { type: mimeType })
  
  // 验证音频数据
  if (audioBlob.size < 100) { // 至少应该有100字节的数据
    console.warn('AudioService: 警告 - 录音数据可能太小:', audioBlob.size, 'bytes')
  }
  
  if (this.onRecordingComplete) {
    this.onRecordingComplete(audioBlob)
  }
  
  // 清空chunks，准备下次录音
  this.audioChunks = []
}
  // src/services/AudioService.ts
playAudio(audioBlob: Blob): void {
  try {
    // 检查音频文件是否有效
    if (audioBlob.size === 0) {
      throw new Error('音频文件为空')
    }
    
    // 停止当前播放
    if (this.currentAudioElement) {
      this.currentAudioElement.pause()
      this.currentAudioElement.currentTime = 0
      this.currentAudioElement = null
    }
    
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio()
    
    // 设置音频属性
    audio.volume = 1.0
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous' // 避免CORS问题
    
    // 基本事件监听
    audio.addEventListener('play', () => {
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(true)
      }
    })
    
    audio.addEventListener('ended', () => {
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false)
      }
      this.currentAudioElement = null
      URL.revokeObjectURL(audioUrl)
    })
    
    audio.addEventListener('error', (event) => {
      console.error('AudioService: 播放错误事件:', event)
      
      let errorMessage = '音频播放失败'
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = '音频播放被中止'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = '网络错误导致播放失败'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = '音频解码失败'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = '音频格式不支持'
            break
          default:
            errorMessage = `未知错误 (${audio.error.code})`
        }
      }
      
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false)
      }
      this.currentAudioElement = null
      URL.revokeObjectURL(audioUrl)
      
      throw new Error(errorMessage)
    })
    
    audio.addEventListener('pause', () => {
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false)
      }
    })
    
    // 保存音频元素引用
    this.currentAudioElement = audio
    
    // 设置音频源并开始播放
    audio.src = audioUrl
    
    // 尝试播放
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // 播放成功
        })
        .catch(error => {
          // 清理资源
          if (this.onPlaybackStateChange) {
            this.onPlaybackStateChange(false)
          }
          this.currentAudioElement = null
          URL.revokeObjectURL(audioUrl)
          
          // 如果是用户手势问题，给出具体提示
          if (error.name === 'NotAllowedError') {
            throw new Error('浏览器阻止了音频播放，请先与页面进行交互（如点击按钮）')
          } else {
            throw new Error(`播放失败: ${error.message}`)
          }
        })
    }
    
  } catch (error) {
    console.error('AudioService: 创建音频对象失败:', error)
    throw error
  }
}
  stopPlayback(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause()
      this.currentAudioElement.currentTime = 0
      this.currentAudioElement = null
    }
    
    if (this.onPlaybackStateChange) {
      this.onPlaybackStateChange(false)
    }
  }

  cleanup(): void {
    this.stopRecording()
    this.stopPlayback()
  }
}