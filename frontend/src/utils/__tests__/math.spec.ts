import { describe, it, expect } from 'vitest'
import { add, subtract, multiply, divide, average, max, isEven } from '../math'

describe('Math Utils', () => {
  describe('add', () => {
    it('应该正确进行加法运算', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
      expect(add(0, 0)).toBe(0)
      expect(add(10.5, 2.3)).toBeCloseTo(12.8)
    })
  })

  describe('subtract', () => {
    it('应该正确进行减法运算', () => {
      expect(subtract(5, 3)).toBe(2)
      expect(subtract(1, 1)).toBe(0)
      expect(subtract(-1, -1)).toBe(0)
      expect(subtract(10.5, 2.3)).toBeCloseTo(8.2)
    })
  })

  describe('multiply', () => {
    it('应该正确进行乘法运算', () => {
      expect(multiply(2, 3)).toBe(6)
      expect(multiply(-2, 3)).toBe(-6)
      expect(multiply(0, 5)).toBe(0)
      expect(multiply(2.5, 4)).toBe(10)
    })
  })

  describe('divide', () => {
    it('应该正确进行除法运算', () => {
      expect(divide(6, 2)).toBe(3)
      expect(divide(10, 4)).toBe(2.5)
      expect(divide(-6, 2)).toBe(-3)
    })

    it('当除数为0时应该抛出错误', () => {
      expect(() => divide(5, 0)).toThrow('除数不能为0')
    })
  })

  describe('average', () => {
    it('应该正确计算数组平均值', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3)
      expect(average([10, 20])).toBe(15)
      expect(average([5])).toBe(5)
      expect(average([1.5, 2.5, 3.5])).toBeCloseTo(2.5)
    })

    it('当数组为空时应该抛出错误', () => {
      expect(() => average([])).toThrow('数组不能为空')
    })
  })

  describe('max', () => {
    it('应该正确找到数组中的最大值', () => {
      expect(max([1, 2, 3, 4, 5])).toBe(5)
      expect(max([10, 5, 8, 3])).toBe(10)
      expect(max([1])).toBe(1)
      expect(max([-1, -2, -3])).toBe(-1)
    })

    it('当数组为空时应该抛出错误', () => {
      expect(() => max([])).toThrow('数组不能为空')
    })
  })

  describe('isEven', () => {
    it('应该正确判断偶数', () => {
      expect(isEven(2)).toBe(true)
      expect(isEven(4)).toBe(true)
      expect(isEven(0)).toBe(true)
      expect(isEven(-2)).toBe(true)
    })

    it('应该正确判断奇数', () => {
      expect(isEven(1)).toBe(false)
      expect(isEven(3)).toBe(false)
      expect(isEven(-1)).toBe(false)
      expect(isEven(7)).toBe(false)
    })
  })
}) 