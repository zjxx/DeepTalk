// src/services/SpeechRecognitionService.ts
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private isListening: boolean = false;
  private config: SpeechRecognitionConfig;

  // 回调函数
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = {
      continuous: true,
      interimResults: true,
      lang: 'zh-CN',
      maxAlternatives: 1,
      ...config
    };

    this.checkSupport();
    this.initializeRecognition();
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  private checkSupport(): void {
    this.isSupported = !!(
      window.SpeechRecognition || 
      window.webkitSpeechRecognition
    );
  }

  /**
   * 初始化语音识别实例
   */
  private initializeRecognition(): void {
    if (!this.isSupported) {
      console.warn('当前浏览器不支持语音识别功能');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // 配置语音识别参数
    this.recognition.continuous = this.config.continuous || true;
    this.recognition.interimResults = this.config.interimResults || true;
    this.recognition.lang = this.config.lang || 'zh-CN';
    this.recognition.maxAlternatives = this.config.maxAlternatives || 1;

    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.log('语音识别开始');
      this.isListening = true;
      this.onStartCallback?.();
    };

    this.recognition.onend = () => {
      console.log('语音识别结束');
      this.isListening = false;
      this.onEndCallback?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const resultIndex = event.resultIndex;

      for (let i = resultIndex; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        const isFinal = result.isFinal;

        console.log('语音识别结果:', {
          transcript,
          confidence,
          isFinal
        });

        this.onResultCallback?.({
          transcript: transcript.trim(),
          confidence,
          isFinal
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', event.error, event.message);
      this.isListening = false;
      
      let errorMessage = '语音识别发生错误';
      switch (event.error) {
        case 'no-speech':
          errorMessage = '未检测到语音输入';
          break;
        case 'audio-capture':
          errorMessage = '无法访问麦克风';
          break;
        case 'not-allowed':
          errorMessage = '麦克风权限被拒绝';
          break;
        case 'network':
          errorMessage = '网络连接错误';
          break;
        case 'service-not-allowed':
          errorMessage = '语音识别服务不可用';
          break;
        default:
          errorMessage = `语音识别错误: ${event.error}`;
      }

      this.onErrorCallback?.(errorMessage);
    };
  }

  /**
   * 开始语音识别
   */
  start(): boolean {
    if (!this.isSupported) {
      this.onErrorCallback?.('当前浏览器不支持语音识别功能');
      return false;
    }

    if (!this.recognition) {
      this.onErrorCallback?.('语音识别服务未初始化');
      return false;
    }

    if (this.isListening) {
      console.warn('语音识别已在进行中');
      return false;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      this.onErrorCallback?.('启动语音识别失败');
      return false;
    }
  }

  /**
   * 停止语音识别
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * 中止语音识别
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  /**
   * 设置结果回调
   */
  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * 设置开始回调
   */
  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * 设置结束回调
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * 检查是否支持语音识别
   */
  getIsSupported(): boolean {
    return this.isSupported;
  }

  /**
   * 检查是否正在监听
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SpeechRecognitionConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous || true;
      this.recognition.interimResults = this.config.interimResults || true;
      this.recognition.lang = this.config.lang || 'zh-CN';
      this.recognition.maxAlternatives = this.config.maxAlternatives || 1;
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    this.stop();
    this.recognition = null;
    this.onResultCallback = undefined;
    this.onErrorCallback = undefined;
    this.onStartCallback = undefined;
    this.onEndCallback = undefined;
  }
}
