"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Trash2, Pin, Send, Clock, User } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"

// 帖子类型
interface Post {
  id: string
  title: string
  content: string
  author_name: string
  created_at: string
  updated_at: string
  is_pinned: boolean
  likes: number
  comment_count: number
}

// 评论类型
interface Comment {
  id: string
  post_id: string
  author_name: string
  content: string
  created_at: string
  updated_at?: string
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  
  const postId = params.id as string
  
  // 检查管理员权限
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    const envAdminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN
    if (adminToken && envAdminToken && adminToken === envAdminToken) {
      setIsAdmin(true)
    }
  }, [])
  
  // 获取帖子详情
  useEffect(() => {
    async function fetchPostAndComments() {
      setLoading(true)
      try {
        // 获取帖子详情
        const postResponse = await fetch(`/api/posts/${postId}`)
        
        if (!postResponse.ok) {
          if (postResponse.status === 404) {
            router.push('/forum')
            return
          }
          throw new Error('获取帖子详情失败')
        }
        
        const postData = await postResponse.json()
        setPost(postData)
        
        // 获取评论
        const commentsResponse = await fetch(`/api/posts/${postId}/comments`)
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()
          setComments(commentsData)
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        setError('获取帖子详情失败')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPostAndComments()
  }, [postId, router])
  
  // 发表评论
  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newComment.trim()) {
      return
    }
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          content: newComment.trim(),
          author_name: commentAuthor.trim() || '匿名用户'
        })
      })
      
      if (!response.ok) {
        throw new Error('发表评论失败')
      }
      
      const comment = await response.json()
      setComments([...comments, comment])
      setNewComment('')
      
      // 更新帖子评论数
      if (post) {
        setPost({
          ...post,
          comment_count: post.comment_count + 1
        })
      }
    } catch (error) {
      console.error('发表评论失败:', error)
      setError('发表评论失败')
    } finally {
      setSubmitting(false)
    }
  }
  
  // 删除帖子 (仅管理员)
  async function handleDeletePost() {
    if (!confirm('确定删除此帖子？此操作不可撤销。')) {
      return
    }
    
    try {
      const adminToken = localStorage.getItem('admin_token')
      const response = await fetch(`/api/posts/${postId}?token=${adminToken}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('删除帖子失败')
      }
      
      router.push('/forum')
    } catch (error) {
      console.error('删除帖子失败:', error)
      setError('删除帖子失败')
    }
  }
  
  // 置顶/取消置顶帖子 (仅管理员)
  async function handleTogglePin() {
    if (!post) return
    
    try {
      const adminToken = localStorage.getItem('admin_token')
      const response = await fetch(`/api/posts/${postId}?token=${adminToken}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPinned: !post.is_pinned
        })
      })
      
      if (!response.ok) {
        throw new Error('更新帖子状态失败')
      }
      
      const updatedPost = await response.json()
      setPost(updatedPost)
    } catch (error) {
      console.error('更新帖子状态失败:', error)
      setError('更新帖子状态失败')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold">帖子不存在</h2>
          <Button 
            onClick={() => router.push('/forum')}
            className="mt-4 gap-2"
            variant="outline"
          >
            <ArrowLeft className="w-4 h-4" />
            返回论坛
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      {/* 帖子头部 */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm shadow-sm flex items-center p-4">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => router.push('/forum')} 
          className="hover:bg-primary/5 transition-colors"
          aria-label="返回论坛"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="ml-2 text-xl font-medium">帖子详情</h1>
        
        {/* 管理员操作 */}
        {isAdmin && (
          <div className="ml-auto flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTogglePin}
              className={cn(
                "hover:bg-primary/5 transition-colors",
                post.is_pinned && "text-amber-500"
              )}
              aria-label={post.is_pinned ? "取消置顶" : "置顶帖子"}
              title={post.is_pinned ? "取消置顶" : "置顶帖子"}
            >
              <Pin className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeletePost}
              className="text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="删除帖子"
              title="删除帖子"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-w-md mx-auto pb-16">
        {/* 帖子内容 */}
        <div className={cn(
          "p-4 m-3 rounded-xl",
          "transition-all duration-300",
          "shadow-sm hover:shadow-md",
          "border border-border/50",
          "bg-card/95 backdrop-blur-md",
          "relative overflow-hidden",
          "before:absolute before:inset-0 before:w-full before:h-full",
          "before:bg-gradient-to-tr before:from-primary/5 before:to-transparent before:opacity-30",
          "before:pointer-events-none"
        )}>
          {post.is_pinned && (
            <Badge variant="outline" className="gap-1 mb-2 text-xs border-primary/70 text-primary w-fit flex items-center">
              <Pin className="w-3 h-3" />
              置顶帖子
            </Badge>
          )}
          
          <h1 className="text-xl font-bold mb-2">{post.title}</h1>
          
          <div className="flex items-center text-sm mb-4 gap-1 text-muted-foreground">
            <User className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium">{post.author_name}</span>
            <span className="mx-1">·</span>
            <Clock className="w-3.5 h-3.5 mr-1" />
            <span>{format(new Date(post.created_at), 'yyyy-MM-dd HH:mm')}</span>
          </div>
          
          <div className="py-2 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
        
        {/* 评论区 */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            评论 ({comments.length})
          </h2>
          
          {/* 评论列表 */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className={cn(
                "p-6 text-center rounded-xl",
                "border border-border/50",
                "bg-card/30 backdrop-blur-sm"
              )}>
                <p className="text-muted-foreground">暂无评论，来发表第一条评论吧</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "p-4 rounded-xl",
                    "border border-border/50",
                    "bg-card/50 backdrop-blur-sm",
                    "transition-all duration-300",
                    "hover:bg-card/70 hover:shadow-sm",
                    "animate-fade-in-up",
                    {
                      "animation-delay-100": index % 3 === 0,
                      "animation-delay-200": index % 3 === 1,
                      "animation-delay-300": index % 3 === 2,
                    }
                  )}
                  style={{
                    animationDelay: `${(index % 3) * 100}ms`
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                      {comment.author_name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 评论表单 */}
          <form onSubmit={handleSubmitComment} className="mt-6 p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-1.5 text-primary/70" />
              发表评论
            </h3>
            <div className="mb-3">
              <div className="flex items-center mb-2">
                <User className="w-3.5 h-3.5 mr-1.5 text-primary/70" />
                <label htmlFor="commentAuthor" className="block text-sm">
                  您的昵称 (可选)
                </label>
              </div>
              <Input
                id="commentAuthor"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="匿名用户"
                className={cn(
                  "transition-all duration-200 focus:border-primary/50",
                  "focus-visible:ring-primary/20"
                )}
              />
            </div>
            
            <Textarea
              placeholder="写下你的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className={cn(
                "resize-none transition-all duration-200",
                "focus:border-primary/50 focus-visible:ring-primary/20"
              )}
            />
            
            {error && (
              <div className="p-3 my-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md animate-fade-in">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className={cn(
                "mt-3 w-full gap-2 shadow-sm transition-all duration-300",
                "hover:shadow-md hover:scale-[1.01]",
                "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/10 before:to-transparent",
                "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
                "relative overflow-hidden"
              )}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? '提交中...' : '发表评论'}
              {!submitting && <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 