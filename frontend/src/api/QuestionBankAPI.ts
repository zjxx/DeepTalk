// src/api/QuestionBankAPI.ts

export interface QuestionData {
  id: string
  topic: string
  description: string
  prompts: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  estimatedTime: number
}

export interface QuestionResponse {
  success: boolean
  data: QuestionData | null
  message?: string
}

export interface QuestionsResponse {
  success: boolean
  data: QuestionData[]
  total: number
  message?: string
}

export interface QuestionRequest {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  excludeIds?: string[]
}

class QuestionBankAPI {
  private static instance: QuestionBankAPI
  private questionBank: QuestionData[] = []

  private constructor() {
    this.initializeQuestionBank()
  }

  public static getInstance(): QuestionBankAPI {
    if (!QuestionBankAPI.instance) {
      QuestionBankAPI.instance = new QuestionBankAPI()
    }
    return QuestionBankAPI.instance
  }

  // 初始化题库数据（模拟后端数据）
  private initializeQuestionBank(): void {
    this.questionBank = [
      // 初级题目
      {
        id: 'q001',
        topic: 'My Daily Routine',
        description: '描述您的日常生活安排',
        prompts: [
          'What time do you usually wake up and why?',
          'What is your favorite part of the day?',
          'How do you spend your weekends?',
          'What would you change about your routine?'
        ],
        difficulty: 'beginner',
        category: 'lifestyle',
        tags: ['daily life', 'habits', 'time management'],
        estimatedTime: 3
      },
      {
        id: 'q002',
        topic: 'Food and Cooking',
        description: '谈论美食和烹饪',
        prompts: [
          'What is your favorite dish and why?',
          'Do you prefer cooking at home or eating out?',
          'Describe a traditional dish from your country.',
          'What cooking skills would you like to learn?'
        ],
        difficulty: 'beginner',
        category: 'lifestyle',
        tags: ['food', 'cooking', 'culture'],
        estimatedTime: 4
      },
      {
        id: 'q003',
        topic: 'Hobbies and Interests',
        description: '分享您的兴趣爱好',
        prompts: [
          'What hobbies do you enjoy in your free time?',
          'How did you become interested in these activities?',
          'What new hobby would you like to try?',
          'How do hobbies help you relax?'
        ],
        difficulty: 'beginner',
        category: 'personal',
        tags: ['hobbies', 'leisure', 'personal growth'],
        estimatedTime: 3
      },

      // 中级题目
      {
        id: 'q004',
        topic: 'Technology and Society',
        description: '科技对社会的影响',
        prompts: [
          'How has technology changed the way we communicate?',
          'What are the advantages and disadvantages of social media?',
          'Do you think we rely too much on technology?',
          'What technological advancement excites you most?'
        ],
        difficulty: 'intermediate',
        category: 'society',
        tags: ['technology', 'social media', 'communication'],
        estimatedTime: 5
      },
      {
        id: 'q005',
        topic: 'Education and Learning',
        description: '教育和学习方式的探讨',
        prompts: [
          'What do you think about online vs traditional education?',
          'How do you prefer to learn new skills?',
          'What role should technology play in education?',
          'How has your learning style changed over the years?'
        ],
        difficulty: 'intermediate',
        category: 'education',
        tags: ['education', 'learning', 'skills'],
        estimatedTime: 5
      },
      {
        id: 'q006',
        topic: 'Work-Life Balance',
        description: '工作与生活的平衡',
        prompts: [
          'How do you maintain work-life balance?',
          'What does a perfect work environment look like to you?',
          'How has remote work changed your perspective?',
          'What career advice would you give to young people?'
        ],
        difficulty: 'intermediate',
        category: 'career',
        tags: ['work', 'career', 'balance', 'lifestyle'],
        estimatedTime: 6
      },

      // 高级题目
      {
        id: 'q007',
        topic: 'Climate Change and Environment',
        description: '气候变化与环境保护',
        prompts: [
          'What actions can individuals take to combat climate change?',
          'How should governments prioritize environmental policies?',
          'What role does innovation play in environmental solutions?',
          'How do you balance economic growth with environmental protection?'
        ],
        difficulty: 'advanced',
        category: 'environment',
        tags: ['climate change', 'environment', 'policy', 'sustainability'],
        estimatedTime: 8
      },
      {
        id: 'q008',
        topic: 'Globalization and Cultural Identity',
        description: '全球化与文化认同',
        prompts: [
          'How does globalization affect local cultures?',
          'Can cultural diversity coexist with global unity?',
          'What aspects of your culture are most important to preserve?',
          'How do you see the future of cultural exchange?'
        ],
        difficulty: 'advanced',
        category: 'culture',
        tags: ['globalization', 'culture', 'identity', 'diversity'],
        estimatedTime: 7
      },
      {
        id: 'q009',
        topic: 'Artificial Intelligence and Ethics',
        description: '人工智能与伦理道德',
        prompts: [
          'What ethical concerns do you have about AI development?',
          'How should society regulate AI technology?',
          'What jobs do you think AI will replace or create?',
          'How can we ensure AI benefits everyone equally?'
        ],
        difficulty: 'advanced',
        category: 'technology',
        tags: ['AI', 'ethics', 'society', 'future'],
        estimatedTime: 8
      },
      {
        id: 'q010',
        topic: 'Mental Health and Wellbeing',
        description: '心理健康与幸福感',
        prompts: [
          'How do you maintain good mental health?',
          'What role does community support play in wellbeing?',
          'How has society\'s understanding of mental health changed?',
          'What strategies help you cope with stress?'
        ],
        difficulty: 'intermediate',
        category: 'health',
        tags: ['mental health', 'wellbeing', 'stress', 'community'],
        estimatedTime: 6
      }
    ]
  }

  // 获取随机题目 - 主要接口
  async getRandomQuestion(request: QuestionRequest = {}): Promise<QuestionResponse> {
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300))

      const {
        difficulty,
        category,
        excludeIds = []
      } = request

      // 筛选题目
      let filteredQuestions = this.questionBank.filter(q => {
        if (excludeIds.includes(q.id)) return false
        if (difficulty && q.difficulty !== difficulty) return false
        if (category && q.category !== category) return false
        return true
      })

      // 如果没有符合条件的题目，返回所有题目
      if (filteredQuestions.length === 0) {
        filteredQuestions = this.questionBank.filter(q => !excludeIds.includes(q.id))
      }

      if (filteredQuestions.length === 0) {
        return {
          success: false,
          data: null,
          message: 'No questions available'
        }
      }

      // 随机选择一个题目
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length)
      const selectedQuestion = filteredQuestions[randomIndex]

      return {
        success: true,
        data: selectedQuestion,
        message: 'Question retrieved successfully'
      }
    } catch (error) {
      console.error('QuestionBankAPI: 获取题目失败', error)
      return {
        success: false,
        data: null,
        message: 'Failed to retrieve question'
      }
    }
  }

  // 根据难度获取题目
  async getQuestionByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<QuestionResponse> {
    return this.getRandomQuestion({ difficulty })
  }

  // 获取多个题目
  async getMultipleQuestions(count: number, request: QuestionRequest = {}): Promise<QuestionsResponse> {
    try {
      const questions: QuestionData[] = []
      const excludeIds = [...(request.excludeIds || [])]

      for (let i = 0; i < count; i++) {
        const response = await this.getRandomQuestion({
          ...request,
          excludeIds
        })

        if (response.success && response.data) {
          questions.push(response.data)
          excludeIds.push(response.data.id)
        }
      }

      return {
        success: true,
        data: questions,
        total: questions.length,
        message: `Retrieved ${questions.length} questions`
      }    } catch (error) {
      console.error('获取多个题目失败:', error)
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Failed to retrieve questions'
      }
    }
  }
  // 获取题库统计信息
  getQuestionBankStats() {
    const categories = new Set(this.questionBank.map(q => q.category))
    const tags = new Set(this.questionBank.flatMap(q => q.tags))
    
    const stats = {
      total: this.questionBank.length,
      byDifficulty: {
        beginner: this.questionBank.filter(q => q.difficulty === 'beginner').length,
        intermediate: this.questionBank.filter(q => q.difficulty === 'intermediate').length,
        advanced: this.questionBank.filter(q => q.difficulty === 'advanced').length
      },
      categories: Array.from(categories),
      tags: Array.from(tags)
    }

    return stats
  }

  // 根据ID获取特定题目
  getQuestionById(id: string): QuestionData | null {
    return this.questionBank.find(q => q.id === id) || null
  }
}

// 导出单例实例
export const questionBankAPI = QuestionBankAPI.getInstance()

// 导出便捷方法
export const getRandomQuestion = (request?: QuestionRequest) => questionBankAPI.getRandomQuestion(request)
export const getQuestionByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => questionBankAPI.getQuestionByDifficulty(difficulty)
export const getMultipleQuestions = (count: number, request?: QuestionRequest) => questionBankAPI.getMultipleQuestions(count, request)
export const getQuestionBankStats = () => questionBankAPI.getQuestionBankStats()