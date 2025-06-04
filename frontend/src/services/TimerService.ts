// src/services/TimerService.ts
export class TimerService {
  private mainTimerInterval: number | null = null
  private speakingTimerInterval: number | null = null
  
  // 回调函数
  onMainTimerTick?: (timeLeft: number) => void
  onSpeakingTimerTick?: (timeLeft: number) => void
  
  private mainTimeLeft = 0
  private speakingTimeLeft = 0

  startMainTimer(initialTime: number): void {
    this.stopMainTimer()
    
    this.mainTimeLeft = initialTime
    this.mainTimerInterval = window.setInterval(() => {
      if (this.mainTimeLeft > 0) {
        this.mainTimeLeft--
        if (this.onMainTimerTick) {
          this.onMainTimerTick(this.mainTimeLeft)
        }
      } else {
        this.stopMainTimer()
        if (this.onMainTimerTick) {
          this.onMainTimerTick(0)
        }
      }
    }, 1000)
  }

  startSpeakingTimer(initialTime: number): void {
    this.stopSpeakingTimer()
    
    this.speakingTimeLeft = initialTime
    this.speakingTimerInterval = window.setInterval(() => {
      if (this.speakingTimeLeft > 0) {
        this.speakingTimeLeft--
        if (this.onSpeakingTimerTick) {
          this.onSpeakingTimerTick(this.speakingTimeLeft)
        }
      } else {
        this.stopSpeakingTimer()
        if (this.onSpeakingTimerTick) {
          this.onSpeakingTimerTick(0)
        }
      }
    }, 1000)
  }

  stopMainTimer(): void {
    if (this.mainTimerInterval) {
      clearInterval(this.mainTimerInterval)
      this.mainTimerInterval = null
    }
  }

  stopSpeakingTimer(): void {
    if (this.speakingTimerInterval) {
      clearInterval(this.speakingTimerInterval)
      this.speakingTimerInterval = null
    }
  }

  stopAllTimers(): void {
    this.stopMainTimer()
    this.stopSpeakingTimer()
  }
}