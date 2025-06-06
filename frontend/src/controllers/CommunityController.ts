import { ref } from 'vue'
import { CommunitySearchAPI, CommunityLikeAPI, CommunityCheckAuthorAPI, CommunityAddPostAPI } from '../api/CommunityAPI'
import type { Post, SearchRequest, SearchResult, LikeRequest, LikeResponse, CheckAuthorRequest, CheckAuthorResponse, AddPostRequest, AddPostResponse } from '../interface/CommunityInterface'

export const useCommunityController = () => {
    const posts = ref<Post[]>([]) 
    //const authors = ref<Author[]>([])
    const loading = ref(false) 
    const error = ref<string | null>(null)

    // 样品数据
  const samplePosts: Post[] = [
    {
      id: '1',
      title: '欢迎来到 DeepTalkz 社区！',
      content: '这是一个测试帖子，用于展示社区功能。在这里你可以分享你的想法、经验和见解。我们希望这个社区能够成为一个知识分享和交流的平台，让每个人都能从中受益。',
      author: {
        id: 'user1',
        username: '张三',
        avatar: '',
        posts: 5,
        likes: 120
      },
      time: '2024-01-15T10:30:00Z',
      likes: 25
    },
    {
      id: '2',
      title: '关于前端开发的一些思考',
      content: '前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。',
      author: {
        id: 'user2',
        username: '李四',
        avatar: '',
        posts: 12,
        likes: 89
      },
      time: '2024-01-14T15:45:00Z',
      likes: 18
    },
  ]

    // 加载社区启动数据：发送空搜索分别拉取帖子和作者列表
    const loadCommunityData = async () => {
        loading.value = true
        error.value = null
        try {
            // 空搜索拉取帖子
            // const postReq: SearchRequest = { query: '', type: 'posts' }
            // const postRes: SearchResult = await CommunitySearchAPI(postReq)
            // posts.value = postRes.posts ?? []
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 1000))
            posts.value = samplePosts

        } catch (e) {
            error.value = '加载失败，请稍后重试'
            console.error('加载社区数据失败:', e)
        } finally {
            loading.value = false
        }
    }

    // 通过帖子搜索
    const searchPosts = async (keyword: string) => {
        loading.value = true
        error.value = null
        try {
            // 搜索帖子
            const postReq: SearchRequest = { query: keyword, type: 'posts' }
            const postRes: SearchResult = await CommunitySearchAPI(postReq)
            posts.value = postRes.posts ?? []

        } catch (e) {
            error.value = '搜索失败，请稍后重试'
            console.error('搜索失败:', e)
        } finally {
            loading.value = false
        }
    }

    //通过作者搜索
    const searchAuthors = async (keyword: string) => {
        loading.value = true
        error.value = null
        try {
            // 搜索作者
            const authorReq: SearchRequest = { query: keyword, type: 'authors' }
            const authorRes: SearchResult = await CommunitySearchAPI(authorReq)
            posts.value = authorRes.posts ?? []

        } catch (e) {
            error.value = '搜索失败，请稍后重试'
            console.error('搜索失败:', e)
        } finally {
            loading.value = false
        }
    }

    // 点赞帖子
    const likePost = async (postId: string, userId: string): Promise<LikeResponse> => {
        loading.value = true
        error.value = null
        try {
            const likeReq: LikeRequest = { postId, userId }
            const likeRes: LikeResponse = await CommunityLikeAPI(likeReq)
            return likeRes
        } catch (e) {
            error.value = '点赞失败，请稍后重试'
            console.error('点赞失败:', e)
            return { success: false, message: '点赞失败', postId, likes: 0 }
        } finally {
            loading.value = false
        }
    }

    //查看作者信息
    const checkAuthor = async (authorId: string): Promise<CheckAuthorResponse> => {
        loading.value = true
        error.value = null
        try {
            const authorReq: CheckAuthorRequest = { authorId }
            const authorRes: CheckAuthorResponse = await CommunityCheckAuthorAPI(authorReq)
            return authorRes
        } catch (e) {
            error.value = '获取作者信息失败，请稍后重试'
            console.error('获取作者信息失败:', e)
            return { author: { id: '', username: '', avatar: '', likes: 0, posts: 0 } }
        } finally {
            loading.value = false
        }
    }

    //发帖
const addPost = async (crrpost: AddPostRequest): Promise<AddPostResponse | null> => {
    loading.value = true
    error.value = null
    try {
        // 验证必填字段
        if (!crrpost.post.title || !crrpost.post.content || !crrpost.authorId) {
            error.value = '标题、内容和作者ID不能为空'
            return null
        }
        
        // 发送到后端，API 返回的是 Post 类型
        const newPost: Post = await CommunityAddPostAPI(crrpost)
        console.log('发帖成功:', newPost)
        
        // 构造 AddPostResponse 响应
        const response: AddPostResponse = {
            success: true,
            message: '发帖成功',
            post: newPost
        }
        
        return response
        
    } catch (e) {
        error.value = '发帖失败，请稍后重试'
        console.error('发帖失败:', e)
        
        // 返回失败的 AddPostResponse
        return {
            success: false,
            message: '发帖失败',
            post: null
        }
    } finally {
        loading.value = false
    }
}

    return {
        posts,
        loading,
        error,
        loadCommunityData,
        searchPosts,
        searchAuthors,
        likePost,
        addPost,
        checkAuthor,
    }
}