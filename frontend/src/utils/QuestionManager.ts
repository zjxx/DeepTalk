// src/utils/QuestionManager.ts
import { getRandomQuestion, type QuestionData, type QuestionRequest } from '../api/QuestionBankAPI'

export class QuestionManager {
  private currentQuestion: QuestionData | null = null
  private usedQuestionIds: string[] = []

  // ��ȡ�µ������Ŀ
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
        
        // ������ʷ��¼������������������
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

  // �����Ѷȼ���ӳ���ȡ��Ŀ
  async loadQuestionByLevel(difficultyLevel: '初级' | '中级' | '高级'): Promise<QuestionData | null> {
    const difficultyMap = {
      '初级': 'beginner' as const,
      '中级': 'intermediate' as const,
      '高级': 'advanced' as const
    }

    const difficulty = difficultyMap[difficultyLevel]
    return this.loadNewQuestion(difficulty)
  }

  // ��ȡ��ǰ��Ŀ
  getCurrentQuestion(): QuestionData | null {
    return this.currentQuestion
  }

  // ��ȡ��ǰ��Ŀ������
  getCurrentTopic(): string {
    return this.currentQuestion?.topic || ''
  }

  // ��ȡ��ǰ��Ŀ������
  getCurrentDescription(): string {
    return this.currentQuestion?.description || ''
  }

  getCurrentPrompts(): string[] {
    return this.currentQuestion?.prompts || []
  }

  getPromptByIndex(index: number): string {
    const prompts = this.getCurrentPrompts()
    if (prompts.length === 0) return ''
    
    const validIndex = Math.max(0, Math.min(index, prompts.length - 1))
    return prompts[validIndex]
  }

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

  // ���ʹ����ʷ
  clearHistory(): void {
    this.usedQuestionIds = []
  }

  // ���õ�ǰ��Ŀ
  reset(): void {
    this.currentQuestion = null
  }

  // ��ȡ��Ŀͳ����Ϣ
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
}