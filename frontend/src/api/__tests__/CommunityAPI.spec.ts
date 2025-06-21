import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  CommunitySearchAPI,
  CommunityLikeAPI,
  CommunityCheckAuthorAPI,
  CommunityAddPostAPI
} from '../CommunityAPI'
import { http } from '../../utils/http'

// Mock http module
vi.mock('../../utils/http', () => ({
  http: {
    post: vi.fn()
  }
}))

// Mock API_ENDPOINTS
vi.mock('../../config/api', () => ({
  API_ENDPOINTS: {
    COMMUNITY: {
      SEARCH: '/api/community/search',
      POSTS: {
        LIKE: '/api/community/posts/like',
        CHECK_AUTHOR: '/api/community/posts/check-author',
        ADD: '/api/community/posts/add'
      }
    }
  }
}))

describe('Community API', () => {
  const mockHttp = vi.mocked(http)

  beforeEach(() => {
    // 模拟console方法
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('CommunitySearchAPI', () => {
    it('应该发送搜索请求', async () => {
      const searchRequest = {
        keyword: '测试关键词',
        page: 1,
        limit: 10
      }
      const mockResponse = {
        posts: [
          { id: '1', title: '测试帖子1', content: '内容1' },
          { id: '2', title: '测试帖子2', content: '内容2' }
        ],
        total: 2,
        page: 1,
        limit: 10
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunitySearchAPI(searchRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/community/search', searchRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的搜索请求:', JSON.stringify(searchRequest))
    })

    it('应该处理空搜索结果', async () => {
      const searchRequest = {
        keyword: '不存在的关键词',
        page: 1,
        limit: 10
      }
      const mockResponse = {
        posts: [],
        total: 0,
        page: 1,
        limit: 10
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunitySearchAPI(searchRequest)

      expect(result.posts).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('应该处理搜索错误', async () => {
      const searchRequest = {
        keyword: '测试',
        page: 1,
        limit: 10
      }
      const mockError = new Error('搜索失败')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(CommunitySearchAPI(searchRequest)).rejects.toThrow('搜索失败')
    })
  })

  describe('CommunityLikeAPI', () => {
    it('应该发送点赞请求', async () => {
      const likeRequest = {
        postId: 'post123',
        userId: 'user456'
      }
      const mockResponse = {
        success: true,
        liked: true,
        likeCount: 15
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunityLikeAPI(likeRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/community/posts/like', likeRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的点赞请求:', JSON.stringify(likeRequest))
    })

    it('应该处理取消点赞', async () => {
      const likeRequest = {
        postId: 'post123',
        userId: 'user456'
      }
      const mockResponse = {
        success: true,
        liked: false,
        likeCount: 14
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunityLikeAPI(likeRequest)

      expect(result.liked).toBe(false)
      expect(result.likeCount).toBe(14)
    })

    it('应该处理点赞错误', async () => {
      const likeRequest = {
        postId: 'invalidpost',
        userId: 'user456'
      }
      const mockError = new Error('帖子不存在')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(CommunityLikeAPI(likeRequest)).rejects.toThrow('帖子不存在')
    })
  })

  describe('CommunityCheckAuthorAPI', () => {
    it('应该查看帖子作者信息', async () => {
      const authorRequest = {
        postId: 'post123'
      }
      const mockResponse = {
        author: {
          id: 'user456',
          username: 'testuser',
          avatar: 'https://example.com/avatar.jpg',
          postCount: 25
        }
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunityCheckAuthorAPI(authorRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/community/posts/check-author', authorRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的查看作者请求:', JSON.stringify(authorRequest))
    })

    it('应该处理作者不存在的情况', async () => {
      const authorRequest = {
        postId: 'invalidpost'
      }
      const mockError = new Error('帖子或作者不存在')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(CommunityCheckAuthorAPI(authorRequest)).rejects.toThrow('帖子或作者不存在')
    })
  })

  describe('CommunityAddPostAPI', () => {
    it('应该发送发帖请求', async () => {
      const addPostRequest = {
        title: '测试帖子标题',
        content: '这是一个测试帖子的内容',
        tags: ['测试', '开发'],
        userId: 'user456'
      }
      const mockResponse = {
        id: 'newpost123',
        title: '测试帖子标题',
        content: '这是一个测试帖子的内容',
        tags: ['测试', '开发'],
        author: 'user456',
        createdAt: '2024-01-01T00:00:00Z',
        likeCount: 0
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunityAddPostAPI(addPostRequest)

      expect(mockHttp.post).toHaveBeenCalledWith('/api/community/posts/add', addPostRequest)
      expect(result).toEqual(mockResponse)
      expect(console.log).toHaveBeenCalledWith('发送的发帖请求:', JSON.stringify(addPostRequest))
    })

    it('应该处理发帖失败', async () => {
      const addPostRequest = {
        title: '',
        content: '',
        tags: [],
        userId: 'user456'
      }
      const mockError = new Error('帖子内容不能为空')

      mockHttp.post.mockRejectedValue(mockError)

      await expect(CommunityAddPostAPI(addPostRequest)).rejects.toThrow('帖子内容不能为空')
    })

    it('应该处理长标题和内容', async () => {
      const addPostRequest = {
        title: '这是一个很长的标题'.repeat(10),
        content: '这是一个很长的内容'.repeat(100),
        tags: ['长内容', '测试'],
        userId: 'user456'
      }
      const mockResponse = {
        id: 'longpost123',
        ...addPostRequest,
        author: 'user456',
        createdAt: '2024-01-01T00:00:00Z',
        likeCount: 0
      }

      mockHttp.post.mockResolvedValue(mockResponse)

      const result = await CommunityAddPostAPI(addPostRequest)

      expect(result.id).toBe('longpost123')
      expect(result.title).toBe(addPostRequest.title)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理网络错误', async () => {
      const searchRequest = { keyword: '测试', page: 1, limit: 10 }
      const networkError = new Error('网络连接失败')

      mockHttp.post.mockRejectedValue(networkError)

      await expect(CommunitySearchAPI(searchRequest)).rejects.toThrow('网络连接失败')
    })

    it('应该正确处理服务器错误', async () => {
      const likeRequest = { postId: 'post123', userId: 'user456' }
      const serverError = new Error('服务器内部错误')

      mockHttp.post.mockRejectedValue(serverError)

      await expect(CommunityLikeAPI(likeRequest)).rejects.toThrow('服务器内部错误')
    })
  })
}) 