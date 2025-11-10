import { ref } from 'vue'
import { SocialFollowAPI, SocialFollowStatusAPI, SocialFavoriteAPI, SocialFavoriteStatusAPI, SocialReactAPI, SocialReactionSummaryAPI, SocialRecommendAuthorsAPI } from '../api/CommunityAPI'
import type { FollowActionRequest, FollowStatusResponse, FavoriteRequest, FavoriteStatusResponse, ReactionRequest, ReactionSummaryResponse, AuthorListResponse } from '../interface/SocialInterface'

export const useSocialController = () => {
  const followLoading = ref(false)
  const favoriteLoading = ref(false)
  const reactionLoading = ref(false)
  const error = ref<string | null>(null)

  // 关注/取关
  const toggleFollow = async (currentUserId: string, targetAuthorId: string, follow: boolean): Promise<FollowStatusResponse | null> => {
    followLoading.value = true
    error.value = null
    try {
      const req: FollowActionRequest = { userId: currentUserId, targetAuthorId, follow }
      return await SocialFollowAPI(req)
    } catch (e) {
      error.value = '关注操作失败'
      console.error(e)
      return null
    } finally {
      followLoading.value = false
    }
  }

  const getFollowStatus = async (currentUserId: string, targetAuthorId: string): Promise<FollowStatusResponse | null> => {
    try {
      return await SocialFollowStatusAPI(currentUserId, targetAuthorId)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  // 收藏
  const toggleFavorite = async (postId: string, userId: string, favorite: boolean): Promise<FavoriteStatusResponse | null> => {
    favoriteLoading.value = true
    error.value = null
    try {
      const req: FavoriteRequest = { postId, userId, favorite }
      return await SocialFavoriteAPI(req)
    } catch (e) {
      error.value = '收藏操作失败'
      console.error(e)
      return null
    } finally {
      favoriteLoading.value = false
    }
  }

  const getFavoriteStatus = async (postId: string, userId: string): Promise<FavoriteStatusResponse | null> => {
    try {
      return await SocialFavoriteStatusAPI(postId, userId)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  // 表情反应
  const react = async (postId: string, userId: string, type: ReactionRequest['type'], add: boolean): Promise<ReactionSummaryResponse | null> => {
    reactionLoading.value = true
    error.value = null
    try {
      const req: ReactionRequest = { postId, userId, type, add }
      return await SocialReactAPI(req)
    } catch (e) {
      error.value = '表情反应失败'
      console.error(e)
      return null
    } finally {
      reactionLoading.value = false
    }
  }

  const getReactionSummary = async (postId: string, userId: string): Promise<ReactionSummaryResponse | null> => {
    try {
      return await SocialReactionSummaryAPI(postId, userId)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  const getRecommendedAuthors = async (currentUserId?: string, limit = 10): Promise<AuthorListResponse | null> => {
    try {
      return await SocialRecommendAuthorsAPI(currentUserId, limit)
    } catch (e) {
      console.error(e)
      return null
    }
  }

  return {
    followLoading,
    favoriteLoading,
    reactionLoading,
    error,
    toggleFollow,
    getFollowStatus,
    toggleFavorite,
    getFavoriteStatus,
    react,
    getReactionSummary,
    getRecommendedAuthors
  }
}
