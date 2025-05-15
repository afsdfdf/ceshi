"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, ThumbsUp, Trash2, Pin } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Post, Comment, User } from '@/lib/types'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      
      if (data.user) {
        // 检查是否为管理员
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, username')
          .eq('id', data.user.id)
          .single()
          
        if (profile) {
          setIsAdmin(profile.is_admin || false)
          setUser((prev: any) => ({ ...prev, username: profile.username }))
        }
      }
    }
    
    checkUser()
  }, [])
  
  // 获取帖子详情和评论
  useEffect(() => {
    async function fetchPostAndComments() {
      try {
        setLoading(true)
        
        // 获取帖子详情
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (postError) {
          throw postError
        }
        
        setPost(postData as Post)
        
        // 获取评论
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', params.id)
          .order('created_at', { ascending: true })
        
        if (commentsError) {
          throw commentsError
        }
        
        setComments(commentsData as Comment[])
        
      } catch (error) {
        console.error('获取数据失败:', error)
        router.push('/chat')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchPostAndComments()
    }
  }, [params.id, router])
  
  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      setError('评论内容不能为空')
      return
    }
    
    if (!user) {
      setError('请先登录后再评论')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      const comment = {
        post_id: params.id,
        content: newComment.trim(),
        author_name: isAnonymous ? '匿名用户' : (user.username || user.email?.split('@')[0] || '用户'),
        author_id: isAnonymous ? null : user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 添加评论
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert(comment)
        .select()
      
      if (insertError) {
        throw insertError
      }
      
      // 更新帖子评论计数
      await supabase
        .from('posts')
        .update({ comment_count: (post?.comment_count || 0) + 1 })
        .eq('id', params.id)
      
      // 更新本地状态
      setComments([...comments, data[0] as Comment])
      setNewComment('')
      setPost((prev: Post | null) => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : null)
      
    } catch (error: any) {
      console.error('提交评论失败:', error)
      setError(error.message || '评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }
  
  // 删除帖子
  const handleDeletePost = async () => {
    if (!confirm('确定要删除这个帖子吗？')) {
      return
    }
    
    try {
      // 先删除所有评论
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', params.id)
      
      // 再删除帖子
      await supabase
        .from('posts')
        .delete()
        .eq('id', params.id)
      
      router.push('/chat')
    } catch (error) {
      console.error('删除帖子失败:', error)
      alert('删除失败，请重试')
    }
  }
  
  // 切换置顶状态
  const handleTogglePin = async () => {
    if (!post) return
    
    try {
      const newPinnedStatus = !post.is_pinned
      
      await supabase
        .from('posts')
        .update({ is_pinned: newPinnedStatus })
        .eq('id', params.id)
      
      setPost({ ...post, is_pinned: newPinnedStatus })
    } catch (error) {
      console.error('更新置顶状态失败:', error)
      alert('操作失败，请重试')
    }
  }
  
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex justify-center items-center",
        isDark ? "bg-background" : "bg-gray-50"
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!post) {
    return (
      <div className={cn(
        "min-h-screen flex justify-center items-center",
        isDark ? "bg-background" : "bg-gray-50"
      )}>
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">帖子不存在</h2>
          <Button onClick={() => router.push('/chat')}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "min-h-screen pb-8",
      isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
    )}>
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-3 text-white"
            aria-label="返回"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white truncate">帖子详情</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto">
        {/* 帖子详情 */}
        <div className={cn(
          "p-4 mt-4 mx-4 rounded-xl",
          isDark ? "bg-card" : "bg-white border border-gray-200"
        )}>
          <div className="flex justify-between items-start">
            <div className="font-medium">{post.author_name}</div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(post.created_at), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-2 break-words">{post.title}</h2>
          
          <div className="mt-4 whitespace-pre-wrap break-words">
            {post.content}
          </div>
          
          {/* 管理员操作按钮 */}
          {isAdmin && (
            <div className="flex mt-4 pt-4 border-t border-border/60">
              <Button 
                variant="outline"
                size="sm"
                className="mr-2 text-amber-500"
                onClick={handleTogglePin}
              >
                <Pin className="w-4 h-4 mr-1" />
                {post.is_pinned ? '取消置顶' : '置顶'}
              </Button>
              
              <Button 
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={handleDeletePost}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          )}
        </div>
        
        {/* 评论区 */}
        <div className="px-4 mt-4">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            评论 ({comments.length})
          </h2>
          
          {/* 评论列表 */}
          <div className="space-y-4 mb-6">
            {comments.length === 0 ? (
              <div className={cn(
                "p-4 text-center rounded-xl",
                isDark ? "bg-card/80" : "bg-white border border-gray-200"
              )}>
                <p className="text-muted-foreground">暂无评论，来发表第一条评论吧</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "p-4 rounded-xl",
                    isDark ? "bg-card/80" : "bg-white border border-gray-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">{comment.author_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap break-words">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* 评论表单 */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mt-4">
              <Textarea
                placeholder="写下你的评论..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className={cn(
                  "resize-none",
                  isDark ? "bg-card border-border" : "bg-white border-gray-300"
                )}
              />
              
              <div className="mt-2 flex items-center">
                <input
                  id="anonymous-comment"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
                />
                <label htmlFor="anonymous-comment" className="ml-2 block text-sm">
                  匿名评论
                </label>
              </div>
              
              {error && (
                <div className="p-3 my-3 text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                  {error}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="mt-3 w-full"
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? '提交中...' : '发表评论'}
              </Button>
            </form>
          ) : (
            <div className={cn(
              "p-4 mt-4 text-center rounded-xl",
              isDark ? "bg-card" : "bg-white border border-gray-200"
            )}>
              <a 
                href="/login" 
                className="text-primary hover:underline"
              >
                登录后发表评论
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 