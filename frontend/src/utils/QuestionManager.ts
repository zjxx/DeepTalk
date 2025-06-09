// src/utils/QuestionManager.ts
import { getRandomQuestion, type QuestionData, type QuestionRequest } from '../api/QuestionBankAPI'

export class QuestionManager {
  private currentQuestion: QuestionData | null = null
  private usedQuestionIds: string[] = []
  private currentTopic: string = ''
  private currentPrompts: string[] = []
  private isServerTopic: boolean = false

  // 获取新的随机题目
  async loadNewQuestion(difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<QuestionData | null> {
    try {
      const request: QuestionRequest = {
        excludeIds: this.usedQuestionIds
      }

      if (difficulty) {
        request.difficulty = difficulty
      }

      const response = await getRandomQuestion(request)
      
      if (response.success && response.data) {
        this.currentQuestion = response.data
        this.usedQuestionIds.push(response.data.id)
        
        // 限制历史记录数量，避免无限增长
        if (this.usedQuestionIds.length > 50) {
          this.usedQuestionIds = this.usedQuestionIds.slice(-25)
        }
        
        return response.data
      }

      return null
    } catch (error) {
      console.error('加载新题目失败:', error)
      return null
    }
  }

  // 根据难度级别映射获取题目
  async loadQuestionByLevel(difficultyLevel: '初级' | '中级' | '高级'): Promise<QuestionData | null> {
    const difficultyMap = {
      '初级': 'beginner' as const,
      '中级': 'intermediate' as const,
      '高级': 'advanced' as const
    }

    const difficulty = difficultyMap[difficultyLevel]
    return this.loadNewQuestion(difficulty)
  }

  // 获取当前题目
  getCurrentQuestion(): QuestionData | null {
    return this.currentQuestion
  }

  // 获取当前题目的主题
  getCurrentTopic(): string {
    // 优先使用服务器分配的主题
    if (this.isServerTopic && this.currentTopic) {
      return this.currentTopic
    }
    
    // 如果没有服务器主题，使用本地题目的主题
    return this.currentQuestion?.topic || ''
  }

  // 获取当前题目的描述
  getCurrentDescription(): string {
    return this.currentQuestion?.description || ''
  }

  // 获取当前题目的提示列表
  getCurrentPrompts(): string[] {
    // 优先使用服务器分配的提示
    if (this.isServerTopic && this.currentPrompts.length > 0) {
      return this.currentPrompts
    }
    
    // 如果没有服务器提示，使用本地题目的提示
    return this.currentQuestion?.prompts || []
  }

  // 获取指定索引的提示
  getPromptByIndex(index: number): string {
    const prompts = this.getCurrentPrompts()
    if (prompts.length === 0) return ''
    
    const validIndex = Math.max(0, Math.min(index, prompts.length - 1))
    return prompts[validIndex]
  }

  // 获取下一个提示（循环）
  getNextPrompt(currentIndex: number): { prompt: string; nextIndex: number } {
    const prompts = this.getCurrentPrompts()
    if (prompts.length === 0) {
      return { prompt: '', nextIndex: 0 }
    }

    const nextIndex = (currentIndex + 1) % prompts.length
    return {
      prompt: prompts[nextIndex],
      nextIndex
    }
  }

  // 清除使用历史
  clearHistory(): void {
    this.usedQuestionIds = []
  }

  // 重置当前题目
  reset(): void {
    this.currentQuestion = null
    this.currentTopic = ''
    this.currentPrompts = []
    this.isServerTopic = false
  }

  // 获取题目统计信息
  getQuestionInfo() {
    if (!this.currentQuestion) return null

    return {
      id: this.currentQuestion.id,
      topic: this.currentQuestion.topic,
      description: this.currentQuestion.description,
      difficulty: this.currentQuestion.difficulty,
      category: this.currentQuestion.category,
      tags: this.currentQuestion.tags,
      estimatedTime: this.currentQuestion.estimatedTime,
      promptCount: this.currentQuestion.prompts.length
    }
  }

  // 设置服务器分配的主题和提示
  setServerTopic(topic: string, prompts: string[]): void {
    console.log('QuestionManager: 设置服务器主题:', {
      topic,
      prompts: prompts.length
    })
    
    // 创建服务器主题对象
    this.currentTopic = topic
    this.currentPrompts = prompts || []
    this.isServerTopic = true // 标记为服务器分配的主题
    
    console.log('QuestionManager: 服务器主题设置完成:', {
      currentTopic: this.currentTopic,
      promptCount: this.currentPrompts.length
    })
  }

  // 检查是否使用服务器主题
  isUsingServerTopic(): boolean {
    return this.isServerTopic || false
  }
}