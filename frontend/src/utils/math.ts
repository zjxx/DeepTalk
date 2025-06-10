/**
 * 数学工具函数
 */

/**
 * 加法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两数之和
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * 减法运算
 * @param a 被减数
 * @param b 减数
 * @returns 差值
 */
export function subtract(a: number, b: number): number {
  return a - b
}

/**
 * 乘法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 乘积
 */
export function multiply(a: number, b: number): number {
  return a * b
}

/**
 * 除法运算
 * @param a 被除数
 * @param b 除数
 * @returns 商值
 * @throws 当除数为0时抛出错误
 */
export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为0')
  }
  return a / b
}

/**
 * 计算数组平均值
 * @param numbers 数字数组
 * @returns 平均值
 * @throws 当数组为空时抛出错误
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return sum / numbers.length
}

/**
 * 查找数组中的最大值
 * @param numbers 数字数组
 * @returns 最大值
 * @throws 当数组为空时抛出错误
 */
export function max(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('数组不能为空')
  }
  return Math.max(...numbers)
}

/**
 * 判断是否为偶数
 * @param num 数字
 * @returns 是否为偶数
 */
export function isEven(num: number): boolean {
  return num % 2 === 0
} 