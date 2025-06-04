// src/services/TimerService.ts
export class TimerService {
  private mainTimerInterval: number | null = null
  
  // 回调函数
  onMainTimerTick?: (timeLeft: number) => void
  
  private mainTimeLeft = 0

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

  stopMainTimer(): void {
    if (this.mainTimerInterval) {
      clearInterval(this.mainTimerInterval)
      this.mainTimerInterval = null
    }
  }

  stopAllTimers(): void {
    this.stopMainTimer()
  }
}