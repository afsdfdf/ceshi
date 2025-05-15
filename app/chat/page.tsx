"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, MessageCircle, PlusCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import BottomNav from "../components/BottomNav"
import { supabase } from '@/lib/supabase/client'
import { Post } from '@/lib/types'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    
    checkUser()
  }, [])
  
  // 获取帖子列表
  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        if (data) {
          setPosts(data as Post[])
        }
      } catch (error) {
        console.error('获取帖子失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [])
  
  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
    )}>
      {/* 论坛头部 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">社区聊天</h1>
          <p className="text-sm text-white/70">分享见解，探索加密世界</p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-3">
        {/* 发帖按钮 */}
        {user ? (
          <Link href="/chat/new">
            <Button className="w-full py-6 mb-4 rounded-xl font-medium flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <PlusCircle className="w-5 h-5 mr-2" />
              发布新帖子
            </Button>
          </Link>
        ) : (
          <div className={cn(
            "w-full py-3 px-4 mb-4 rounded-xl text-center",
            isDark ? "bg-card" : "bg-white border border-gray-200"
          )}>
            <Link href="/login" className="text-primary font-medium">
              登录后发帖
            </Link>
          </div>
        )}
        
        {/* 帖子列表 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className={cn(
                "p-8 text-center rounded-xl",
                isDark ? "bg-card" : "bg-white border border-gray-200"
              )}>
                <p className="text-muted-foreground">暂无帖子，来发布第一个帖子吧！</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link href={`/chat/post/${post.id}`} key={post.id}>
                  <div className={cn(
                    "p-4 rounded-xl transition-all hover:shadow-md",
                    post.is_pinned && "border-l-4 border-l-amber-500",
                    isDark 
                      ? "bg-card/80 hover:bg-card" 
                      : "bg-white border border-gray-200/80 hover:border-gray-300"
                  )}>
                    {post.is_pinned && (
                      <div className="flex items-center text-amber-500 text-xs mb-2">
                        <Zap className="w-3 h-3 mr-1" />
                        置顶帖子
                      </div>
                    )}
                    <h3 className="font-bold text-lg">{post.title}</h3>
                    <p className={cn(
                      "text-sm mt-1 line-clamp-2",
                      isDark ? "text-muted-foreground" : "text-muted-foreground"
                    )}>
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center mt-3 text-xs">
                      <div className="text-muted-foreground">
                        {post.author_name} · {format(new Date(post.created_at), 'yyyy-MM-dd')}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comment_count}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav currentTab="chat" isDark={isDark} />
    </div>
  )
} 