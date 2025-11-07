//import axios from 'axios'
import type { Post, CheckAuthorRequest, CheckAuthorResponse, SearchRequest, SearchResult, LikeRequest, LikeResponse, AddPostRequest } from '../interface/CommunityInterface'
import { API_ENDPOINTS } from '../config/api'
import { http } from '../utils/http'

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
