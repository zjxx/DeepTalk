/**
 * 头像工具类 - 前端版本
 * 为不同用户生成不同的头像URL，与后端保持一致
 */

// 多个不同风格的头像集合
const AVATAR_SETS = [
  // 小红书真实头像样式（不同用户）
  'https://sns-avatar-qc.xhscdn.com/avatar/645e4e6f000000001203d14a.jpg',
  'https://sns-avatar-qc.xhscdn.com/avatar/6426a7ab000000002703ab59.jpg',
  'https://sns-avatar-qc.xhscdn.com/avatar/63f5b0b6000000002303a0cd.jpg',
  'https://sns-avatar-qc.xhscdn.com/avatar/645b3c99000000001203d0e9.jpg',
  'https://sns-avatar-qc.xhscdn.com/avatar/63e8f8b7000000002303a092.jpg',

  // UI Avatars - 根据名字生成的彩色头像
  'https://ui-avatars.com/api/?name=User&background=FF6B6B&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Member&background=4ECDC4&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Learner&background=45B7D1&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Student&background=FFA07A&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Teacher&background=98D8C8&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Expert&background=F7DC6F&color=333&size=200',
  'https://ui-avatars.com/api/?name=Master&background=BB8FCE&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Scholar&background=85C1E2&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Buddy&background=F8B500&color=fff&size=200',
  'https://ui-avatars.com/api/?name=Friend&background=52B788&color=fff&size=200'
]

// 默认头像
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=DeepTalk&background=4A90E2&color=fff&size=200'

/**
 * 简单的字符串哈希函数（与Java的hashCode保持一致）
 */
function hashCode(str: string): number {
  let hash = 0
  if (str.length === 0) return hash
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return hash
}

/**
 * 根据用户ID生成头像URL
 */
export function getAvatarByUserId(userId: string): string {
  if (!userId || userId.trim() === '') {
    return DEFAULT_AVATAR
  }

  // 使用用户ID的hashCode来选择头像
  const index = Math.abs(hashCode(userId)) % AVATAR_SETS.length
  return AVATAR_SETS[index]
}

/**
 * 根据用户名生成头像URL
 */
export function getAvatarByUsername(username: string): string {
  if (!username || username.trim() === '') {
    return DEFAULT_AVATAR
  }

  // 使用用户名的 hashCode 从头像集合中选择一个
  // 这样不同用户会有不同的头像，但同一用户始终是同一个头像
  const index = Math.abs(hashCode(username)) % AVATAR_SETS.length
  return AVATAR_SETS[index]
}

/**
 * 根据用户ID和用户名生成头像（优先使用ID确保一致性）
 */
export function getAvatar(userId?: string, username?: string): string {
  if (userId && userId.trim() !== '') {
    return getAvatarByUserId(userId)
  } else if (username && username.trim() !== '') {
    return getAvatarByUsername(username)
  } else {
    return DEFAULT_AVATAR
  }
}

/**
 * 获取AI助手的头像
 */
export function getAIAvatar(): string {
  return 'https://ui-avatars.com/api/?name=AI&background=4A90E2&color=fff&size=200&bold=true'
}
