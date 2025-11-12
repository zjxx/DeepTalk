import { ref } from 'vue'
import { CommunitySearchAPI, CommunityLikeAPI, CommunityCheckAuthorAPI, CommunityAddPostAPI, CommunityGetRepliesAPI, CommunityAddPostWithImagesAPI, CommunityAddReplyAPI, CommunityGetUserPostsAPI } from '../api/CommunityAPI'
import type { Post, SearchRequest, SearchResult, LikeRequest, LikeResponse, CheckAuthorRequest, CheckAuthorResponse, AddPostRequest, AddPostResponse, GetRepliesResponse, AddPostWithImagesResponse, AddReplyRequest, AddReplyResponse, GetUserPostsRequest, GetUserPostsResponse } from '../interface/CommunityInterface'

export const useCommunityController = () => {
    const posts = ref<Post[]>([]) 
    //const authors = ref<Author[]>([])
    const loading = ref(false) 
    const error = ref<string | null>(null)

    // 样品数据
//   const samplePosts: Post[] = [
//     {
//       id: '1',
//       title: '欢迎来到 DeepTalkz 社区！',
//       content: '这是一个测试帖子，用于展示社区功能。在这里你可以分享你的想法、经验和见解。我们希望这个社区能够成为一个知识分享和交流的平台，让每个人都能从中受益。',
//       author: {
//         id: 'user1',
//         username: '张三',
//         avatar: '',
//         posts: 5,
//         likes: 120
//       },
//       time: '2024-01-15T10:30:00Z',
//       likes: 25
//     },
//     {
//       id: '2',
//       title: '关于前端开发的一些思考',
//       content: '前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。前端开发正在快速发展，新的框架和工具层出不穷。作为开发者，我们需要保持学习的态度，同时也要选择适合项目的技术栈。Vue3 和 TypeScript 的组合为我们提供了很好的开发体验。',
//       author: {
//         id: 'user2',
//         username: '李四',
//         avatar: '',
//         posts: 12,
//         likes: 89
//       },
//       time: '2024-01-14T15:45:00Z',
//       likes: 18
//     },
//   ]

    // 加载社区启动数据：发送空搜索分别拉取帖子和作者列表
    const loadCommunityData = async (queryStr: string, typeStr: string) => {
        loading.value = true
        error.value = null
        try {
            //空搜索拉取帖子
            const postReq: SearchRequest = { query: queryStr, type: typeStr as 'posts' | 'authors' }
            const postRes: SearchResult = await CommunitySearchAPI(postReq)
            posts.value = postRes.posts ?? []
            normalizePosts(posts.value)
            // // 模拟API调用延迟
            // await new Promise(resolve => setTimeout(resolve, 1000))
            // posts.value = samplePosts

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
            normalizePosts(posts.value)

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
            normalizePosts(posts.value)

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
            return { author: { id: '', username: '', avatar: '', authorLikes: 0, authorPosts: 0 } }
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
        normalizePosts([newPost])
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

const addPostWithImages = async (title: string, content: string, files: File[]): Promise<AddPostWithImagesResponse> => {
  loading.value = true
  error.value = null
  try {
    const fd = new FormData()
    fd.append('title', title)
    fd.append('content', content)
    files.slice(0, 9).forEach(f => fd.append('images', f))
    const res = await CommunityAddPostWithImagesAPI(fd)
    if (res.post) normalizePosts([res.post])
    return res
  } catch (e) {
    console.error('带图发帖失败', e)
    return { success: false, message: '发布失败', post: null, imageUrls: [] }
  } finally {
    loading.value = false
  }
}

    // 获取帖子回复
    const getReplies = async (postId: string): Promise<GetRepliesResponse> => {
        try {
            console.log('Controller: 获取帖子回复，postId:', postId)
            const response = await CommunityGetRepliesAPI(postId)
            console.log('Controller: 回复获取成功，数量:', response.count)
            return response
        } catch (e) {
            console.error('Controller: 获取回复失败:', e)
            throw e
        }
    }

    // 添加用户回复
    const addReply = async (postId: string, content: string, authorId: string, authorName: string, authorAvatar: string): Promise<AddReplyResponse> => {
        try {
            console.log('Controller: 添加回复，postId:', postId, 'content:', content)
            const request: AddReplyRequest = {
                postId,
                content,
                authorId,
                authorName,
                authorAvatar
            }
            const response = await CommunityAddReplyAPI(postId, request)
            console.log('Controller: 回复添加成功')
            return response
        } catch (e) {
            console.error('Controller: 添加回复失败:', e)
            throw e
        }
    }

    const normalizePosts = (arr: Post[]) => {
        arr.forEach(p => {
            if (!p.author) {
                p.author = { id: p.authorId || '', username: p.authorName || '', avatar: p.authorAvatar || '', authorLikes: 0, authorPosts: 0 }
            } else {
                // 覆盖为最新扁平字段
                if (p.authorName) p.author.username = p.authorName
                if (p.authorAvatar) p.author.avatar = p.authorAvatar
                if (p.authorId) p.author.id = p.authorId
            }
        })
    }

    // 获取用户自己的帖子
    const getUserPosts = async (userId: string): Promise<GetUserPostsResponse> => {
        loading.value = true
        error.value = null
        try {
            console.log('Controller: 获取用户帖子，userId:', userId)
            const request: GetUserPostsRequest = { userId }
            const response = await CommunityGetUserPostsAPI(request)
            console.log('Controller: 用户帖子获取成功，数量:', response.count)
            normalizePosts(response.posts)
            return response
        } catch (e) {
            console.error('Controller: 获取用户帖子失败:', e)
            error.value = '获取用户帖子失败，请稍后重试'
            throw e
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
        addPostWithImages, // 新增导出
        checkAuthor,
        getReplies,
        addReply, // 新增：导出用户回复功能
        getUserPosts, // 新增：导出获取用户帖子功能
    }
}