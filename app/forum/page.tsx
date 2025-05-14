"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, MessageCircle, PlusCircle, Sparkles, ChevronRight } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import BottomNav from "../components/BottomNav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// 定义帖子类型
interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  likes: number;
  comment_count: number;
}

export default function ForumPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('获取帖子失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [])
  
  return (
    <div className="min-h-screen pb-16 bg-background">
      {/* 论坛头部 */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold flex items-center text-foreground">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Web3论坛
          </h1>
          <p className="text-sm text-muted-foreground">分享你的见解，探索加密世界</p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-3">
        {/* 发帖按钮 */}
        <Link href="/forum/new">
          <Button 
            className={cn(
              "w-full mb-4 gap-2 shadow-sm transition-all duration-300",
              "hover:shadow-md hover:scale-[1.01]",
              "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/10 before:to-transparent",
              "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
              "relative overflow-hidden"
            )}
            size="lg"
          >
            <PlusCircle className="w-5 h-5" />
            发布新帖子
          </Button>
        </Link>
        
        {/* 帖子列表 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="p-4 pt-2 pb-2">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter className="p-4 pt-2 flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">暂无帖子，来发布第一个帖子吧！</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Link href={`/forum/post/${post.id}`} key={post.id}>
                  <Card className={cn(
                    "overflow-hidden transition-all border hover:border-primary/20",
                    "group relative hover:shadow-md",
                    "hover:scale-[1.01] duration-300",
                    "before:absolute before:inset-0 before:w-full before:h-full",
                    isDark
                      ? "before:bg-gradient-to-tr before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
                      : "before:bg-gradient-to-tr before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300 before:pointer-events-none",
                    post.is_pinned && "border-l-4 border-l-primary"
                  )}>
                    <CardHeader className="p-4 pb-2 relative z-10">
                      {post.is_pinned && (
                        <Badge variant="outline" className="gap-1 mb-1 text-xs border-primary/70 text-primary w-fit flex items-center">
                          <Zap className="w-3 h-3" />
                          置顶
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{post.title}</h3>
                    </CardHeader>
                    <CardContent className="p-4 pt-1 pb-2 relative z-10">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground relative z-10">
                      <div>
                        {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comment_count}
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav currentTab="forum" />
    </div>
  )
} 