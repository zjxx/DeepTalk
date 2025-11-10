export interface FollowActionRequest {
  targetAuthorId: string;
  userId: string;
  follow: boolean;
}

export interface FollowStatusResponse {
  followed: boolean;
  followerCount: number;
  followingCount: number;
}

export interface FavoriteRequest {
  postId: string;
  userId: string;
  favorite: boolean;
}

export interface FavoriteStatusResponse {
  favorited: boolean;
  favoritesCount: number;
}

export interface ReactionRequest {
  postId: string;
  userId: string;
  type: 'like' | 'love' | 'laugh' | 'sad' | 'angry';
  add: boolean;
}

export interface ReactionSummaryResponse {
  postId: string;
  counters: Record<string, number>;
  myReaction?: string | null;
}

export interface AuthorView {
  id: string;
  username: string;
  avatar: string;
  authorPosts: number;
  authorLikes: number;
  followerCount: number;
  followed: boolean;
}

export interface AuthorListResponse {
  success: boolean;
  authors: AuthorView[];
}
