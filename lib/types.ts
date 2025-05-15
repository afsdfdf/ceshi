// 论坛用户类型
export type User = {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
}

// 帖子类型
export type Post = {
  id: string;
  title: string;
  content: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  likes: number;
  comment_count: number;
}

// 评论类型
export type Comment = {
  id: string;
  post_id: string;
  content: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at?: string;
}

// 数据库表名
export enum Table {
  USERS = 'users',
  POSTS = 'posts',
  COMMENTS = 'comments',
} 