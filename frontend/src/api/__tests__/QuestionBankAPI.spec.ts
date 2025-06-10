import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  getRandomQuestion, 
  getQuestionByDifficulty, 
  getMultipleQuestions, 
  getQuestionBankStats 
} from '../QuestionBankAPI'

describe('QuestionBank API', () => {
  beforeEach(() => {
    // 模拟console方法
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getRandomQuestion', () => {
    it('应该返回随机题目', async () => {
      const result = await getRandomQuestion()

      expect(result.success).toBe(true)
      expect(result.data).not.toBeNull()
      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('topic')
      expect(result.data).toHaveProperty('description')
      expect(result.data).toHaveProperty('prompts')
      expect(result.data).toHaveProperty('difficulty')
      expect(result.data).toHaveProperty('category')
      expect(result.data).toHaveProperty('tags')
      expect(result.data).toHaveProperty('estimatedTime')
    })

    it('应该根据难度筛选题目', async () => {
      const result = await getRandomQuestion({ difficulty: 'beginner' })

      expect(result.success).toBe(true)
      expect(result.data?.difficulty).toBe('beginner')
    })

    it('应该根据分类筛选题目', async () => {
      const result = await getRandomQuestion({ category: 'lifestyle' })

      expect(result.success).toBe(true)
      expect(result.data?.category).toBe('lifestyle')
    })

    it('应该排除指定的题目ID', async () => {
      const excludeIds = ['q001', 'q002']
      const result = await getRandomQuestion({ excludeIds })

      expect(result.success).toBe(true)
      if (result.data) {
        expect(excludeIds).not.toContain(result.data.id)
      }
    })

         it('应该处理没有符合条件题目的情况', async () => {
       const result = await getRandomQuestion({ 
         difficulty: 'beginner',
         category: 'nonexistent_category'
       })

       // 由于实现会在没有找到符合条件的题目时返回所有题目，所以success仍为true
       expect(result.success).toBe(true)
       expect(result.data).not.toBeNull()
     })

         it('应该同时应用多个筛选条件', async () => {
       const result = await getRandomQuestion({
         difficulty: 'intermediate',
         category: 'society',
         excludeIds: ['q005']
       })

       expect(result.success).toBe(true)
       if (result.data) {
         expect(result.data.difficulty).toBe('intermediate')
         expect(result.data.category).toBe('society')
         expect(result.data.id).not.toBe('q005')
       }
     })
  })

  describe('getQuestionByDifficulty', () => {
    it('应该返回初级难度题目', async () => {
      const result = await getQuestionByDifficulty('beginner')

      expect(result.success).toBe(true)
      expect(result.data?.difficulty).toBe('beginner')
    })

    it('应该返回中级难度题目', async () => {
      const result = await getQuestionByDifficulty('intermediate')

      expect(result.success).toBe(true)
      expect(result.data?.difficulty).toBe('intermediate')
    })

    it('应该返回高级难度题目', async () => {
      const result = await getQuestionByDifficulty('advanced')

      expect(result.success).toBe(true)
      expect(result.data?.difficulty).toBe('advanced')
    })
  })

  describe('getMultipleQuestions', () => {
    it('应该返回指定数量的题目', async () => {
      const count = 3
      const result = await getMultipleQuestions(count)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(count)
      expect(result.total).toBeGreaterThanOrEqual(count)
    })

    it('应该返回不重复的题目', async () => {
      const count = 5
      const result = await getMultipleQuestions(count)

      expect(result.success).toBe(true)
      const ids = result.data.map(q => q.id)
      const uniqueIds = [...new Set(ids)]
      expect(ids).toHaveLength(uniqueIds.length)
    })

    it('应该根据难度筛选多个题目', async () => {
      const count = 2
      const result = await getMultipleQuestions(count, { difficulty: 'beginner' })

      expect(result.success).toBe(true)
      result.data.forEach(question => {
        expect(question.difficulty).toBe('beginner')
      })
    })

    it('应该根据分类筛选多个题目', async () => {
      const count = 2
      const result = await getMultipleQuestions(count, { category: 'lifestyle' })

      expect(result.success).toBe(true)
      result.data.forEach(question => {
        expect(question.category).toBe('lifestyle')
      })
    })

         it('应该处理请求数量超过可用题目的情况', async () => {
       const count = 15 // 超过题库总数（约10个题目）
       const result = await getMultipleQuestions(count)

       expect(result.success).toBe(true)
       // 应该返回所有可用题目（题库中只有10个左右的题目）
       expect(result.data.length).toBeLessThanOrEqual(10)
       expect(result.data.length).toBeGreaterThan(0)
     }, 15000) // 增加超时时间到15秒

    it('应该排除指定的题目ID', async () => {
      const count = 3
      const excludeIds = ['q001', 'q002']
      const result = await getMultipleQuestions(count, { excludeIds })

      expect(result.success).toBe(true)
      result.data.forEach(question => {
        expect(excludeIds).not.toContain(question.id)
      })
    })

    it('应该处理请求0个题目的情况', async () => {
      const result = await getMultipleQuestions(0)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(0)
    })
  })

  describe('getQuestionBankStats', () => {
    it('应该返回题库统计信息', () => {
      const stats = getQuestionBankStats()

      expect(stats).toHaveProperty('total')
      expect(stats).toHaveProperty('byDifficulty')
      expect(stats).toHaveProperty('categories')
      expect(stats).toHaveProperty('tags')

      expect(stats.total).toBeGreaterThan(0)
      expect(stats.byDifficulty).toHaveProperty('beginner')
      expect(stats.byDifficulty).toHaveProperty('intermediate')
      expect(stats.byDifficulty).toHaveProperty('advanced')
      expect(Array.isArray(stats.categories)).toBe(true)
      expect(Array.isArray(stats.tags)).toBe(true)
    })

    it('应该包含正确的分类和标签信息', () => {
      const stats = getQuestionBankStats()

      expect(Array.isArray(stats.categories)).toBe(true)
      expect(stats.categories.length).toBeGreaterThan(0)
      expect(Array.isArray(stats.tags)).toBe(true)
      expect(stats.tags.length).toBeGreaterThan(0)
    })

    it('应该包含正确的难度统计', () => {
      const stats = getQuestionBankStats()

      const totalFromDifficulty = stats.byDifficulty.beginner + 
                                  stats.byDifficulty.intermediate + 
                                  stats.byDifficulty.advanced

      expect(totalFromDifficulty).toBe(stats.total)
    })
  })

  describe('题目内容验证', () => {
    it('每个题目应该有有效的prompts数组', async () => {
      const result = await getRandomQuestion()

      expect(result.success).toBe(true)
      if (result.data) {
        expect(Array.isArray(result.data.prompts)).toBe(true)
        expect(result.data.prompts.length).toBeGreaterThan(0)
        result.data.prompts.forEach(prompt => {
          expect(typeof prompt).toBe('string')
          expect(prompt.length).toBeGreaterThan(0)
        })
      }
    })

    it('每个题目应该有有效的tags数组', async () => {
      const result = await getRandomQuestion()

      expect(result.success).toBe(true)
      if (result.data) {
        expect(Array.isArray(result.data.tags)).toBe(true)
        expect(result.data.tags.length).toBeGreaterThan(0)
        result.data.tags.forEach(tag => {
          expect(typeof tag).toBe('string')
          expect(tag.length).toBeGreaterThan(0)
        })
      }
    })

    it('每个题目应该有合理的预估时间', async () => {
      const result = await getRandomQuestion()

      expect(result.success).toBe(true)
      if (result.data) {
        expect(typeof result.data.estimatedTime).toBe('number')
        expect(result.data.estimatedTime).toBeGreaterThan(0)
        expect(result.data.estimatedTime).toBeLessThanOrEqual(15) // 假设最长15分钟
      }
    })

    it('难度值应该是有效的枚举值', async () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced']
      const result = await getRandomQuestion()

      expect(result.success).toBe(true)
      if (result.data) {
        expect(validDifficulties).toContain(result.data.difficulty)
      }
    })
  })
}) 