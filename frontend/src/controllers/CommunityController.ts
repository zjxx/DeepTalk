import { ref } from 'vue'
import { CommunitySearchAPI, CommunityLikeAPI, CommunityCheckAuthorAPI, CommunityAddPostAPI } from '../api/CommunityAPI'
import type { Post, SearchRequest, SearchResult, LikeRequest, LikeResponse, CheckAuthorRequest, CheckAuthorResponse, AddPostRequest, AddPostResponse } from '../interface/CommunityInterface'

export const useCommunityController = () => {
    const posts = ref<Post[]>([]) 
    //const authors = ref<Author[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // 加载社区启动数据：发送空搜索分别拉取帖子和作者列表
    const loadCommunityData = async () => {
        loading.value = true
        error.value = null
        try {
            // 空搜索拉取帖子
            const postReq: SearchRequest = { query: '', type: 'posts' }
            const postRes: SearchResult = await CommunitySearchAPI(postReq)
            posts.value = postRes.posts ?? []

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