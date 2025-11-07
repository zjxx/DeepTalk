import { describe, it, expect } from 'vitest'
import userModel from '../user'

describe('userModel', () => {
  it('应该有正确的默认值', () => {
    expect(userModel.username).toBe('')
    expect(userModel.email).toBe('')
    expect(userModel.avatar).toBe('')
    expect(userModel.isLoggedIn).toBe(false)
    expect(userModel.token).toBe('')
    expect(userModel.expiration).toBe('')
    expect(userModel.userId).toBe('')
  })

  it('应该包含所有必需的属性', () => {
    expect(userModel).toHaveProperty('username')
    expect(userModel).toHaveProperty('email')
    expect(userModel).toHaveProperty('avatar')
    expect(userModel).toHaveProperty('isLoggedIn')
    expect(userModel).toHaveProperty('token')
    expect(userModel).toHaveProperty('expiration')
    expect(userModel).toHaveProperty('userId')
  })

  it('应该允许修改属性值', () => {
    const originalUsername = userModel.username
    userModel.username = 'testuser'
    expect(userModel.username).toBe('testuser')
    
    // 恢复原始值
    userModel.username = originalUsername
  })

  it('应该有正确的属性类型', () => {
    expect(typeof userModel.username).toBe('string')
    expect(typeof userModel.email).toBe('string')
    expect(typeof userModel.avatar).toBe('string')
    expect(typeof userModel.isLoggedIn).toBe('boolean')
    expect(typeof userModel.token).toBe('string')
    expect(typeof userModel.expiration).toBe('string')
    expect(typeof userModel.userId).toBe('string')
  })

  it('应该支持登录状态的切换', () => {
    const originalState = userModel.isLoggedIn
    userModel.isLoggedIn = true
    expect(userModel.isLoggedIn).toBe(true)
    
    userModel.isLoggedIn = false
    expect(userModel.isLoggedIn).toBe(false)
    
    // 恢复原始值
    userModel.isLoggedIn = originalState
  })
}) 