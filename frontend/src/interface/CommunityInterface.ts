//帖子
export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  likes: number;
  time: string;
}
//作者
export interface Author {
  id: string;
  username: string;
  avatar: string;
  likes: number;
  posts: number;
}

//查看作者
export interface CheckAuthorRequest {
  authorId: string;
}
//查看作者响应
export interface CheckAuthorResponse {
  author: Author;
}

//搜索请求
export interface SearchRequest {
  query: string;
  type: 'posts' | 'authors';
}
//搜索结果
export interface SearchResult {
  posts?: Post[];
}

//点赞
export interface LikeRequest {
  postId: string;
  userId: string;
}
//点赞响应
export interface LikeResponse {
  success: boolean;
  message: string;
  postId: string;
  likes: number; // 更新后的点赞数
}

//发帖
export interface AddPostRequest {
  authorId: string;
  post: Post;
}
//发帖响应
export interface AddPostResponse {
  success: boolean;
  message: string;
  post: Post | null;
}
