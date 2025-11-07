import { describe, it, expect } from 'vitest'
import type {
  Post,
  Author,
  CheckAuthorRequest,
  CheckAuthorResponse,
  SearchRequest,
  SearchResult,
  LikeRequest,
  LikeResponse,
  AddPostRequest,
  AddPostResponse
} from '../CommunityInterface'

describe('Community Interfaces', () => {
  describe('Author', () => {
    it('应该包含作者的所有必需字段', () => {
      const author: Author = {
        id: 'author-123',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        authorLikes: 100,
        authorPosts: 25
      }
      
      expect(typeof author.id).toBe('string')
      expect(typeof author.username).toBe('string')
      expect(typeof author.avatar).toBe('string')
      expect(typeof author.authorLikes).toBe('number')
      expect(typeof author.authorPosts).toBe('number')
    })

    it('应该支持不同的数值', () => {
      const author: Author = {
        id: 'author-456',
        username: 'poweruser',
        avatar: 'https://cdn.example.com/avatars/user456.png',
        authorLikes: 0,
        authorPosts: 1000
      }
      
      expect(author.authorLikes).toBeGreaterThanOrEqual(0)
      expect(author.authorPosts).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Post', () => {
    it('应该包含帖子的所有必需字段', () => {
      const author: Author = {
        id: 'author-123',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        authorLikes: 100,
        authorPosts: 25
      }
      
      const post: Post = {
        id: 'post-123',
        title: '测试帖子标题',
        content: '这是一个测试帖子的内容',
        author: author,
        likesCount: 15,
        createdAt: '2024-01-15T10:30:00Z'
      }
      
      expect(typeof post.id).toBe('string')
      expect(typeof post.title).toBe('string')
      expect(typeof post.content).toBe('string')
      expect(typeof post.author).toBe('object')
      expect(typeof post.likesCount).toBe('number')
      expect(typeof post.createdAt).toBe('string')
    })

    it('应该包含有效的作者对象', () => {
      const author: Author = {
        id: 'author-789',
        username: 'contentcreator',
        avatar: 'https://example.com/avatar2.jpg',
        authorLikes: 500,
        authorPosts: 50
      }
      
      const post: Post = {
        id: 'post-789',
        title: '有趣的内容',
        content: '这里是帖子的详细内容...',
        author: author,
        likesCount: 42,
        createdAt: '2024-01-16T15:45:00Z'
      }
      
      expect(post.author.id).toBe(author.id)
      expect(post.author.username).toBe(author.username)
    })
  })

  describe('CheckAuthorRequest & Response', () => {
    it('应该正确处理查看作者请求', () => {
      const request: CheckAuthorRequest = {
        authorId: 'author-123'
      }
      
      expect(typeof request.authorId).toBe('string')
      expect(request.authorId.length).toBeGreaterThan(0)
    })

    it('应该正确处理查看作者响应', () => {
      const author: Author = {
        id: 'author-123',
        username: 'queryuser',
        avatar: 'https://example.com/avatar.jpg',
        authorLikes: 75,
        authorPosts: 12
      }
      
      const response: CheckAuthorResponse = {
        author: author
      }
      
      expect(typeof response.author).toBe('object')
      expect(response.author.id).toBe('author-123')
    })
  })

  describe('SearchRequest & SearchResult', () => {
    it('应该支持帖子搜索请求', () => {
      const request: SearchRequest = {
        query: '编程技巧',
        type: 'posts'
      }
      
      expect(typeof request.query).toBe('string')
      expect(request.type).toBe('posts')
    })

    it('应该支持作者搜索请求', () => {
      const request: SearchRequest = {
        query: 'developer',
        type: 'authors'
      }
      
      expect(typeof request.query).toBe('string')
      expect(request.type).toBe('authors')
    })

    it('应该正确处理搜索结果', () => {
      const author: Author = {
        id: 'author-1',
        username: 'dev1',
        avatar: 'https://example.com/dev1.jpg',
        authorLikes: 200,
        authorPosts: 30
      }
      
      const post: Post = {
        id: 'post-1',
        title: '编程最佳实践',
        content: '这里是编程技巧的详细内容...',
        author: author,
        likesCount: 88,
        createdAt: '2024-01-10T09:00:00Z'
      }
      
      const result: SearchResult = {
        posts: [post]
      }
      
      expect(Array.isArray(result.posts)).toBe(true)
      expect(result.posts!.length).toBe(1)
      expect(result.posts![0].title).toContain('编程')
    })

    it('搜索结果可以为空', () => {
      const result: SearchResult = {
        posts: []
      }
      
      expect(Array.isArray(result.posts)).toBe(true)
      expect(result.posts!.length).toBe(0)
    })
  })

  describe('LikeRequest & LikeResponse', () => {
    it('应该正确处理点赞请求', () => {
      const request: LikeRequest = {
        postId: 'post-456',
        userId: 'user-789'
      }
      
      expect(typeof request.postId).toBe('string')
      expect(typeof request.userId).toBe('string')
    })

    it('应该正确处理点赞响应', () => {
      const response: LikeResponse = {
        success: true,
        message: '点赞成功',
        postId: 'post-456',
        likes: 16
      }
      
      expect(typeof response.success).toBe('boolean')
      expect(typeof response.message).toBe('string')
      expect(typeof response.postId).toBe('string')
      expect(typeof response.likes).toBe('number')
      expect(response.likes).toBeGreaterThanOrEqual(0)
    })

    it('应该处理点赞失败的情况', () => {
      const response: LikeResponse = {
        success: false,
        message: '您已经点赞过这个帖子',
        postId: 'post-456',
        likes: 15
      }
      
      expect(response.success).toBe(false)
      expect(response.message.length).toBeGreaterThan(0)
    })
  })

  describe('AddPostRequest & AddPostResponse', () => {
    it('应该正确处理发帖请求', () => {
      const author: Author = {
        id: 'author-999',
        username: 'newposter',
        avatar: 'https://example.com/newposter.jpg',
        authorLikes: 0,
        authorPosts: 0
      }
      
      const post: Post = {
        id: 'post-new',
        title: '我的第一个帖子',
        content: '这是我在社区发布的第一个帖子！',
        author: author,
        likesCount: 0,
        createdAt: '2024-01-17T12:00:00Z'
      }
      
      const request: AddPostRequest = {
        authorId: 'author-999',
        post: post
      }
      
      expect(typeof request.authorId).toBe('string')
      expect(typeof request.post).toBe('object')
      expect(request.post.author.id).toBe(request.authorId)
    })

    it('应该正确处理发帖成功响应', () => {
      const author: Author = {
        id: 'author-999',
        username: 'newposter',
        avatar: 'https://example.com/newposter.jpg',
        authorLikes: 0,
        authorPosts: 1
      }
      
      const post: Post = {
        id: 'post-new-123',
        title: '我的第一个帖子',
        content: '这是我在社区发布的第一个帖子！',
        author: author,
        likesCount: 0,
        createdAt: '2024-01-17T12:00:00Z'
      }
      
      const response: AddPostResponse = {
        success: true,
        message: '帖子发布成功',
        post: post
      }
      
      expect(response.success).toBe(true)
      expect(response.post).not.toBe(null)
      expect(response.post!.id).toBe('post-new-123')
    })

    it('应该正确处理发帖失败响应', () => {
      const response: AddPostResponse = {
        success: false,
        message: '发帖失败：内容不能为空',
        post: null
      }
      
      expect(response.success).toBe(false)
      expect(response.post).toBe(null)
      expect(response.message).toContain('失败')
    })
  })

  describe('接口完整性测试', () => {
    it('应该支持完整的社区交互流程', () => {
      // 1. 创建作者
      const author: Author = {
        id: 'author-flow',
        username: 'flowuser',
        avatar: 'https://example.com/flow.jpg',
        authorLikes: 10,
        authorPosts: 2
      }
      
      // 2. 发布帖子
      const post: Post = {
        id: 'post-flow',
        title: '流程测试帖子',
        content: '测试完整的社区交互流程',
        author: author,
        likesCount: 0,
        createdAt: '2024-01-17T14:30:00Z'
      }
      
      // 3. 搜索帖子
      const searchReq: SearchRequest = {
        query: '流程测试',
        type: 'posts'
      }
      
      // 4. 点赞帖子
      const likeReq: LikeRequest = {
        postId: post.id,
        userId: 'user-other'
      }
      
      // 验证数据一致性
      expect(post.author.id).toBe(author.id)
      expect(searchReq.query).toContain('流程')
      expect(likeReq.postId).toBe(post.id)
    })
  })
}) 