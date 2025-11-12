//import axios from 'axios'
import type { Post, CheckAuthorRequest, CheckAuthorResponse, SearchRequest, SearchResult, LikeRequest, LikeResponse, AddPostRequest, GetRepliesResponse, AddPostWithImagesResponse, AddReplyRequest, AddReplyResponse, GetUserPostsRequest, GetUserPostsResponse } from '../interface/CommunityInterface'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'
import type { FollowActionRequest, FollowStatusResponse, FavoriteRequest, FavoriteStatusResponse, ReactionRequest, ReactionSummaryResponse, AuthorListResponse } from '../interface/SocialInterface.ts'

// 确认 SocialInterface 路径：frontend/src/interface/SocialInterface.ts
// 如果后续仍报找不到模块，请检查 tsconfig.include 是否覆盖 src/interface

//const BASE_URL = '/api/community'
// 其他 API 函数可以在这里添加
// export function registerApi(request: RegisterRequest): Promise<RegisterResponse> {
//   return http.post<RegisterResponse, RegisterRequest>(API_ENDPOINTS.AUTH.REGISTER, request)
// }

//搜索
export function CommunitySearchAPI(request: SearchRequest): Promise<SearchResult> {
    console.log('发送的搜索请求:', JSON.stringify(request))
    return http.post<SearchResult, SearchRequest>(API_ENDPOINTS.COMMUNITY.SEARCH, request)
}
//点赞
export function CommunityLikeAPI(request: LikeRequest): Promise<LikeResponse> {
    console.log('发送的点赞请求:', JSON.stringify(request))
    return http.post<LikeResponse, LikeRequest>(API_ENDPOINTS.COMMUNITY.POSTS.LIKE, request)
}
//查看帖子作者
export function CommunityCheckAuthorAPI(request: CheckAuthorRequest): Promise<CheckAuthorResponse> {
    console.log('发送的查看作者请求:', JSON.stringify(request))
    return http.post<CheckAuthorResponse, CheckAuthorRequest>(API_ENDPOINTS.COMMUNITY.POSTS.CHECK_AUTHOR, request)
}
//发帖
export function CommunityAddPostAPI(request: AddPostRequest): Promise<Post> {
    console.log('发送的发帖请求:', JSON.stringify(request))
    return http.post<Post, AddPostRequest>(API_ENDPOINTS.COMMUNITY.POSTS.ADD, request)
}

//发帖带图片
export function CommunityAddPostWithImagesAPI(formData: FormData): Promise<AddPostWithImagesResponse> {
  // 让浏览器自动设置 multipart/form-data 边界
  return http.post<AddPostWithImagesResponse, FormData>(API_ENDPOINTS.COMMUNITY.POSTS.ADD_WITH_IMAGES, formData)
}

//获取帖子回复
export function CommunityGetRepliesAPI(postId: string): Promise<GetRepliesResponse> {
    console.log('获取回复，帖子ID:', postId)
    return http.get<GetRepliesResponse>(`${API_ENDPOINTS.COMMUNITY.POSTS.REPLIES}/${postId}/replies`) as Promise<GetRepliesResponse>
}

//添加用户回复
export function CommunityAddReplyAPI(postId: string, request: AddReplyRequest): Promise<AddReplyResponse> {
    console.log('发送回复请求，帖子ID:', postId, '内容:', request.content)
    return http.post<AddReplyResponse, AddReplyRequest>(`${API_ENDPOINTS.COMMUNITY.POSTS.REPLIES}/${postId}/replies`, request)
}

// 关注/取关
export function SocialFollowAPI(request: FollowActionRequest): Promise<FollowStatusResponse> {
  return http.post<FollowStatusResponse, FollowActionRequest>(API_ENDPOINTS.SOCIAL.FOLLOW.ACTION, request)
}
export function SocialFollowStatusAPI(currentUserId: string, targetAuthorId: string): Promise<FollowStatusResponse> {
  const url = `${API_ENDPOINTS.SOCIAL.FOLLOW.STATUS}?currentUserId=${encodeURIComponent(currentUserId)}&targetAuthorId=${encodeURIComponent(targetAuthorId)}`
  return http.get<FollowStatusResponse>(url)
}

// 收藏
export function SocialFavoriteAPI(request: FavoriteRequest): Promise<FavoriteStatusResponse> {
  return http.post<FavoriteStatusResponse, FavoriteRequest>(API_ENDPOINTS.SOCIAL.FAVORITE.ACTION, request)
}
export function SocialFavoriteStatusAPI(postId: string, userId: string): Promise<FavoriteStatusResponse> {
  const url = `${API_ENDPOINTS.SOCIAL.FAVORITE.STATUS}?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(userId)}`
  return http.get<FavoriteStatusResponse>(url)
}

// 表情反应
export function SocialReactAPI(request: ReactionRequest): Promise<ReactionSummaryResponse> {
  return http.post<ReactionSummaryResponse, ReactionRequest>(API_ENDPOINTS.SOCIAL.REACTION.ACTION, request)
}
export function SocialReactionSummaryAPI(postId: string, userId: string): Promise<ReactionSummaryResponse> {
  const url = `${API_ENDPOINTS.SOCIAL.REACTION.SUMMARY}?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(userId)}`
  return http.get<ReactionSummaryResponse>(url)
}

// 获取推荐作者
export function SocialRecommendAuthorsAPI(currentUserId?: string, limit = 10): Promise<AuthorListResponse> {
  const url = `${API_ENDPOINTS.SOCIAL.AUTHORS.RECOMMEND}?limit=${limit}${currentUserId ? `&currentUserId=${encodeURIComponent(currentUserId)}` : ''}`
  return http.get<AuthorListResponse>(url)
}

// 获取用户帖子
export function CommunityGetUserPostsAPI(request: GetUserPostsRequest): Promise<GetUserPostsResponse> {
    console.log('获取用户帖子请求:', JSON.stringify(request))
    return http.post<GetUserPostsResponse, GetUserPostsRequest>(API_ENDPOINTS.COMMUNITY.POSTS.USER_POSTS, request)
}
