"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase/client'
import { User } from '@/lib/types'

export default function NewPostPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | any>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      
      if (!data.user) {
        // 未登录，重定向到首页
        router.push('/chat')
        return
      }
      
      setUser(data.user)
      
      // 获取用户资料
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()
        
      if (profile) {
        setUser((prev: any) => ({ ...prev, username: profile.username }))
      }
    }
    
    checkUser()
  }, [router])
  
  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      setError('标题不能为空')
      return
    }
    
    if (!content.trim()) {
      setError('内容不能为空')
      return
    }
    
    try {
      setSubmitting(true)
      setError(null)
      
      const post = {
        title: title.trim(),
        content: content.trim(),
        author_name: isAnonymous ? '匿名用户' : (user.username || user.email?.split('@')[0] || '用户'),
        author_id: isAnonymous ? null : user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_pinned: false,
        likes: 0,
        comment_count: 0
      }
      
      const { data, error: apiError } = await supabase
        .from('posts')
        .insert(post)
        .select()
      
      if (apiError) {
        throw apiError
      }
      
      // 发布成功，跳转到帖子详情页
      router.push(`/chat/post/${data[0].id}`)
      
    } catch (error: any) {
      console.error('发布帖子失败:', error)
      setError(error.message || '发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className={cn(
      "min-h-screen",
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
          <h1 className="text-xl font-bold text-white">发布新帖子</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              标题
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入标题"
              className={cn(
                "w-full p-3",
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              )}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              内容
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入帖子内容..."
              rows={10}
              className={cn(
                "resize-none w-full p-3",
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              )}
            />
          </div>
          
          <div className="mb-4 flex items-center">
            <input
              id="anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded"
            />
            <label htmlFor="anonymous" className="ml-2 block text-sm">
              匿名发布
            </label>
          </div>
          
          {error && (
            <div className="p-3 mb-4 text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full py-6 rounded-xl"
            disabled={submitting || !title.trim() || !content.trim()}
          >
            {submitting ? '发布中...' : '发布帖子'}
          </Button>
        </form>
      </div>
    </div>
  )
} 