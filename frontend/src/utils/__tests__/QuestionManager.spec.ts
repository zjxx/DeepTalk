import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { QuestionManager } from '../QuestionManager'
import { getRandomQuestion } from '../../api/QuestionBankAPI'

// Mock QuestionBankAPI
vi.mock('../../api/QuestionBankAPI', () => ({
  getRandomQuestion: vi.fn()
}))

describe('QuestionManager', () => {
  const mockGetRandomQuestion = vi.mocked(getRandomQuestion)

  const createMockQuestionData = (id: string) => ({
    id,
    topic: '测试主题',
    description: '测试描述',
    prompts: ['提示1', '提示2', '提示3'],
    difficulty: 'beginner' as const,
    category: 'test',
    tags: ['测试', '示例'],
    estimatedTime: 5
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })



  describe('getCurrentQuestion', () => {
    it('应该返回当前题目', async () => {
      const questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test008')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })

      await questionManager.loadNewQuestion()
      const result = questionManager.getCurrentQuestion()

      expect(result).toEqual(mockQuestionData)
    })

    it('没有题目时应该返回null', () => {
      const questionManager = new QuestionManager()
      const result = questionManager.getCurrentQuestion()
      expect(result).toBeNull()
    })
  })

  describe('getCurrentTopic', () => {
    it('应该返回服务器主题（优先级高）', () => {
      const questionManager = new QuestionManager()
      questionManager.setServerTopic('服务器主题', ['服务器提示'])
      const result = questionManager.getCurrentTopic()
      expect(result).toBe('服务器主题')
    })

    it('应该返回本地题目主题（无服务器主题时）', async () => {
      const questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test009')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })

      await questionManager.loadNewQuestion()
      const result = questionManager.getCurrentTopic()

      expect(result).toBe('测试主题')
    })

    it('没有题目时应该返回空字符串', () => {
      const questionManager = new QuestionManager()
      const result = questionManager.getCurrentTopic()
      expect(result).toBe('')
    })
  })

  describe('getCurrentDescription', () => {
    it('应该返回当前题目的描述', async () => {
      const questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test010')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })

      await questionManager.loadNewQuestion()
      const result = questionManager.getCurrentDescription()

      expect(result).toBe('测试描述')
    })

    it('没有题目时应该返回空字符串', () => {
      const questionManager = new QuestionManager()
      const result = questionManager.getCurrentDescription()
      expect(result).toBe('')
    })
  })

  describe('getCurrentPrompts', () => {
    it('应该返回服务器提示（优先级高）', () => {
      const questionManager = new QuestionManager()
      const serverPrompts = ['服务器提示1', '服务器提示2']
      questionManager.setServerTopic('服务器主题', serverPrompts)
      
      const result = questionManager.getCurrentPrompts()
      expect(result).toEqual(serverPrompts)
    })

    it('应该返回本地题目提示（无服务器提示时）', async () => {
      const questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test011')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })

      await questionManager.loadNewQuestion()
      const result = questionManager.getCurrentPrompts()

      expect(result).toEqual(['提示1', '提示2', '提示3'])
    })

    it('没有题目时应该返回空数组', () => {
      const questionManager = new QuestionManager()
      const result = questionManager.getCurrentPrompts()
      expect(result).toEqual([])
    })
  })

  describe('getPromptByIndex', () => {
    let questionManager: QuestionManager
    
    beforeEach(async () => {
      questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test012')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })
      await questionManager.loadNewQuestion()
    })

    it('应该返回指定索引的提示', () => {
      const result = questionManager.getPromptByIndex(1)
      expect(result).toBe('提示2')
    })

    it('应该处理索引超出范围的情况（返回最后一个）', () => {
      const result = questionManager.getPromptByIndex(999)
      expect(result).toBe('提示3')
    })

    it('应该处理负索引（返回第一个）', () => {
      const result = questionManager.getPromptByIndex(-1)
      expect(result).toBe('提示1')
    })

    it('没有提示时应该返回空字符串', () => {
      const emptyManager = new QuestionManager()
      const result = emptyManager.getPromptByIndex(0)
      expect(result).toBe('')
    })
  })

  describe('getNextPrompt', () => {
    let questionManager: QuestionManager
    
    beforeEach(async () => {
      questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test013')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })
      await questionManager.loadNewQuestion()
    })

    it('应该返回下一个提示', () => {
      const result = questionManager.getNextPrompt(0)
      expect(result).toEqual({
        prompt: '提示2',
        nextIndex: 1
      })
    })

    it('应该循环到第一个提示', () => {
      const result = questionManager.getNextPrompt(2)
      expect(result).toEqual({
        prompt: '提示1',
        nextIndex: 0
      })
    })

    it('没有提示时应该返回空结果', () => {
      const emptyManager = new QuestionManager()
      const result = emptyManager.getNextPrompt(0)
      expect(result).toEqual({
        prompt: '',
        nextIndex: 0
      })
    })
  })



  describe('reset', () => {
    it('应该重置所有状态', async () => {
      const questionManager = new QuestionManager()
      
      // 设置一些状态
      const mockQuestionData = createMockQuestionData('test016')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })
      await questionManager.loadNewQuestion()
      questionManager.setServerTopic('服务器主题', ['服务器提示'])

      // 重置
      questionManager.reset()

      // 验证状态被重置
      expect(questionManager.getCurrentQuestion()).toBeNull()
      expect(questionManager.getCurrentTopic()).toBe('')
      expect(questionManager.getCurrentPrompts()).toEqual([])
      expect(questionManager.isUsingServerTopic()).toBe(false)
    })
  })

  describe('getQuestionInfo', () => {
    it('应该返回题目信息', async () => {
      const questionManager = new QuestionManager()
      const mockQuestionData = createMockQuestionData('test017')
      mockGetRandomQuestion.mockResolvedValue({
        success: true,
        data: mockQuestionData
      })

      await questionManager.loadNewQuestion()
      const result = questionManager.getQuestionInfo()

      expect(result).toEqual({
        id: 'test017',
        topic: '测试主题',
        description: '测试描述',
        difficulty: 'beginner',
        category: 'test',
        tags: ['测试', '示例'],
        estimatedTime: 5,
        promptCount: 3
      })
    })

    it('没有题目时应该返回null', () => {
      const questionManager = new QuestionManager()
      const result = questionManager.getQuestionInfo()
      expect(result).toBeNull()
    })
  })

  describe('setServerTopic', () => {
    it('应该设置服务器主题和提示', () => {
      const questionManager = new QuestionManager()
      const topic = '服务器主题'
      const prompts = ['服务器提示1', '服务器提示2']

      questionManager.setServerTopic(topic, prompts)

      expect(questionManager.getCurrentTopic()).toBe(topic)
      expect(questionManager.getCurrentPrompts()).toEqual(prompts)
      expect(questionManager.isUsingServerTopic()).toBe(true)
      expect(console.log).toHaveBeenCalledWith('QuestionManager: 设置服务器主题:', {
        topic,
        prompts: 2
      })
    })

    it('应该处理空提示数组', () => {
      const questionManager = new QuestionManager()
      questionManager.setServerTopic('主题', [])

      expect(questionManager.getCurrentPrompts()).toEqual([])
    })
  })

  describe('isUsingServerTopic', () => {
    it('应该返回false（初始状态）', () => {
      const questionManager = new QuestionManager()
      expect(questionManager.isUsingServerTopic()).toBe(false)
    })

    it('设置服务器主题后应该返回true', () => {
      const questionManager = new QuestionManager()
      questionManager.setServerTopic('主题', ['提示'])
      expect(questionManager.isUsingServerTopic()).toBe(true)
    })

    it('重置后应该返回false', () => {
      const questionManager = new QuestionManager()
      questionManager.setServerTopic('主题', ['提示'])
      questionManager.reset()
      expect(questionManager.isUsingServerTopic()).toBe(false)
    })
  })
}) 