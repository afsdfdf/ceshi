export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string | null
          author_name: string
          created_at: string
          updated_at: string | null
          is_pinned: boolean
          likes: number
          comment_count: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id?: string | null
          author_name: string
          created_at?: string
          updated_at?: string | null
          is_pinned?: boolean
          likes?: number
          comment_count?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string | null
          author_name?: string
          created_at?: string
          updated_at?: string | null
          is_pinned?: boolean
          likes?: number
          comment_count?: number
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          content: string
          author_id: string | null
          author_name: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          content: string
          author_id?: string | null
          author_name: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          content?: string
          author_id?: string | null
          author_name?: string
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
} 