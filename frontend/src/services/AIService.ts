// src/services/AIService.ts
export class AIService {
  private aiSpeakingTimeout: number | null = null
  
  // 回调函数
  onSpeakingStateChange?: (isSpeaking: boolean) => void
  onResponseGenerated?: (response: string) => void

  startSpeaking(): void {
    this.stopSpeaking()
    
    setTimeout(() => {
      if (this.onSpeakingStateChange) {
        this.onSpeakingStateChange(true)
      }
      
      // 模拟AI发言时长（随机5-15秒）
      const speakingDuration = Math.random() * 10000 + 5000
      
      this.aiSpeakingTimeout = window.setTimeout(() => {
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false)
        }
        
        // 生成AI回复
        const aiResponses = [
          "That's a very interesting perspective. Could you tell me more about your experience with this?",
          "I understand your point. Have you considered the alternative viewpoint?",
          "That's a great example. How do you think this applies in different situations?",
          "Very thoughtful response. What do you think are the main challenges in this area?",
          "I see what you mean. How has this changed over the years in your opinion?"
        ]
        
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
        
        if (this.onResponseGenerated) {
          this.onResponseGenerated(randomResponse)
        }
        
        this.aiSpeakingTimeout = null
      }, speakingDuration)
    }, 1000)
  }

  stopSpeaking(): void {
    if (this.aiSpeakingTimeout) {
      clearTimeout(this.aiSpeakingTimeout)
      this.aiSpeakingTimeout = null
    }
    
    if (this.onSpeakingStateChange) {
      this.onSpeakingStateChange(false)
    }
  }

  cleanup(): void {
    this.stopSpeaking()
  }
}