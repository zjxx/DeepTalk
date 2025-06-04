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
    console.log('AudioService: 开始请求麦克风权限...')
    
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
    
    console.log('AudioService: 麦克风权限获取成功')
    
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
      console.log('AudioService: 使用 webm/opus 格式')
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options.mimeType = 'audio/webm'
      console.log('AudioService: 使用 webm 格式')
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      options.mimeType = 'audio/mp4'
      console.log('AudioService: 使用 mp4 格式')
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      options.mimeType = 'audio/ogg;codecs=opus'
      console.log('AudioService: 使用 ogg/opus 格式')
    } else {
      console.log('AudioService: 使用默认格式')
    }
    
    this.mediaRecorder = new MediaRecorder(stream, options)
    
    this.mediaRecorder.ondataavailable = (event) => {
      console.log('AudioService: 收到录音数据', event.data.size, 'bytes')
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }
    
    this.mediaRecorder.onstop = () => {
      console.log('AudioService: 录音停止，开始处理数据')
      this.processRecordedAudio()
    }

    this.mediaRecorder.onerror = (event) => {
      console.error('AudioService: 录音错误', event)
      throw new Error('录音过程中发生错误')
    }
    
    // 设置较短的时间片，确保数据及时收集
    this.mediaRecorder.start(250) // 每250ms收集一次数据
    this.startAudioLevelMonitoring(stream)
    
    console.log('AudioService: 录音已开始')
    
  } catch (error) {
    console.error('AudioService: 录音启动失败', error)
    throw error
  }
}

  stopRecording(): void {
    console.log('AudioService: 停止录音')
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
      
      if (this.audioStream) {
        this.audioStream.getTracks().forEach(track => {
          console.log('AudioService: 停止音频轨道', track.label)
          track.stop()
        })
        this.audioStream = null
      }
      
      if (this.onRecordingStateChange) {
        this.onRecordingStateChange(false, 0)
      }
    }
  }
  // 在 AudioService 中添加格式转换方法
private async convertAudioFormat(audioBlob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const audioContext = new AudioContext()
      const fileReader = new FileReader()
      
      fileReader.onload = async () => {
        try {
          const arrayBuffer = fileReader.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // 重新编码为WAV格式
          const wavBlob = this.audioBufferToWav(audioBuffer)
          resolve(wavBlob)
        } catch (error) {
          reject(error)
        }
      }
      
      fileReader.onerror = () => reject(fileReader.error)
      fileReader.readAsArrayBuffer(audioBlob)
    } catch (error) {
      reject(error)
    }
  })
}

private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels
  const length = audioBuffer.length * numOfChan * 2 + 44
  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)
  const channels = []
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, length - 8, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numOfChan, true)
  view.setUint32(24, audioBuffer.sampleRate, true)
  view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChan, true)
  view.setUint16(32, numOfChan * 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length - 44, true)
  
  // PCM data
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i))
  }
  
  let offset = 44
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
  }
  
  return new Blob([buffer], { type: 'audio/wav' })
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
  console.log('AudioService: 开始处理录音数据')
  console.log('- chunk 数量:', this.audioChunks.length)
  
  if (this.audioChunks.length === 0) {
    console.warn('AudioService: 没有录音数据')
    return
  }
  
  // 计算总大小
  const totalSize = this.audioChunks.reduce((total, chunk) => total + chunk.size, 0)
  console.log('- 总数据大小:', totalSize, 'bytes')
  
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
  
  console.log('- 使用MIME类型:', mimeType)
  
  // 创建音频blob
  const audioBlob = new Blob(this.audioChunks, { type: mimeType })
  
  console.log('AudioService: 录音处理完成')
  console.log('- 最终大小:', audioBlob.size, 'bytes')
  console.log('- 最终类型:', audioBlob.type)
  
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
    console.log('AudioService: 开始播放音频')
    console.log('- 大小:', audioBlob.size, 'bytes')
    console.log('- 类型:', audioBlob.type)
    
    // 检查音频文件是否有效
    if (audioBlob.size === 0) {
      throw new Error('音频文件为空')
    }
    
    // 停止当前播放
    if (this.currentAudioElement) {
      console.log('AudioService: 停止当前播放')
      this.currentAudioElement.pause()
      this.currentAudioElement.currentTime = 0
      this.currentAudioElement = null
    }
    
    const audioUrl = URL.createObjectURL(audioBlob)
    console.log('AudioService: 创建音频URL:', audioUrl)
    
    const audio = new Audio()
    
    // 设置音频属性
    audio.volume = 1.0
    audio.preload = 'auto'
    audio.crossOrigin = 'anonymous' // 避免CORS问题
    
    // 详细的事件监听
    audio.addEventListener('loadstart', () => {
      console.log('AudioService: 开始加载音频')
    })
    
    audio.addEventListener('loadedmetadata', () => {
      console.log('AudioService: 元数据加载完成')
      console.log('- 时长:', audio.duration)
      console.log('- 当前时间:', audio.currentTime)
    })
    
    audio.addEventListener('canplay', () => {
      console.log('AudioService: 可以开始播放')
    })
    
    audio.addEventListener('play', () => {
      console.log('AudioService: 播放事件触发')
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(true)
      }
    })
    
    audio.addEventListener('playing', () => {
      console.log('AudioService: 正在播放')
    })
    
    audio.addEventListener('timeupdate', () => {
      // 只在开发模式下输出，避免控制台过于繁忙
      if (process.env.NODE_ENV === 'development') {
        console.log('AudioService: 播放进度:', audio.currentTime, '/', audio.duration)
      }
    })
    
    audio.addEventListener('ended', () => {
      console.log('AudioService: 播放结束')
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false)
      }
      this.currentAudioElement = null
      URL.revokeObjectURL(audioUrl)
    })
    
    audio.addEventListener('error', (event) => {
      console.error('AudioService: 播放错误事件:', event)
      console.error('AudioService: 错误详情:', audio.error)
      
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
      console.log('AudioService: 播放暂停')
      if (this.onPlaybackStateChange) {
        this.onPlaybackStateChange(false)
      }
    })
    
    // 保存音频元素引用
    this.currentAudioElement = audio
    
    // 设置音频源并开始播放
    audio.src = audioUrl
    
    // 尝试播放
    console.log('AudioService: 尝试开始播放...')
    const playPromise = audio.play()
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('✅ AudioService: 播放成功启动')
        })
        .catch(error => {
          console.error('❌ AudioService: 播放启动失败:', error)
          
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
    console.log('AudioService: 停止播放')
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
    console.log('AudioService: 清理资源')
    this.stopRecording()
    this.stopPlayback()
  }
}