"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { ThumbsUp, MessageCircle, PlusCircle, Image } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import BottomNav from "../components/BottomNav"

// 定义帖子类别
const CATEGORIES = {
  PLAZA: 'plaza',
  NEW_TOKENS: 'new_tokens',
  MARKET: 'market',
  NEWS: 'news'
}

export default function ForumPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.PLAZA)

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true)
      let q;
      
      if (activeCategory === CATEGORIES.PLAZA) {
        // 聊天广场 - 所有帖子或未指定类别的帖子
        q = query(
          collection(db, 'posts'), 
          orderBy('createdAt', 'desc'), 
          limit(30)
        )
      } else {
        // 特定类别的帖子 - 不使用排序以避免需要复合索引
        q = query(
          collection(db, 'posts'), 
          where('category', '==', activeCategory),
          // 移除 orderBy 以避免需要复合索引
          limit(30)
        )
      }
      
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data() as Record<string, any>;
        return { id: doc.id, ...docData };
      }) as any[]
      
      // 如果是分类视图，在客户端进行排序
      if (activeCategory !== CATEGORIES.PLAZA) {
        // 按创建时间降序排序
        data.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
      }
      
      setPosts(data)
      setLoading(false)
    }
    
    fetchPosts()
  }, [activeCategory])

  // Tab 标题映射
  const categoryTitles = {
    [CATEGORIES.PLAZA]: '聊天广场',
    [CATEGORIES.NEW_TOKENS]: '新币推荐',
    [CATEGORIES.MARKET]: '二级市场',
    [CATEGORIES.NEWS]: '新闻'
  }

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
    )}>
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="max-w-md mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-white">XAI聊天</h1>
          <p className="text-sm text-white/70">分享见解，探索加密世界</p>
        </div>
        
        {/* 分类标签栏 */}
        <div className="max-w-md mx-auto px-2 pb-2">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            {Object.entries(categoryTitles).map(([category, title]) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors",
                  category === activeCategory
                    ? "bg-white text-blue-600 font-medium"
                    : "bg-blue-700/30 text-white/90 hover:bg-blue-700/50"
                )}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-2">
        {/* 发帖按钮 */}
        <Link href={{
          pathname: "/chat/new",
          query: activeCategory !== CATEGORIES.PLAZA ? { category: activeCategory } : {}
        }}>
          <div className={cn(
            "w-full py-2 px-4 mb-3 rounded-lg font-medium flex items-center justify-center shadow-sm",
            isDark 
              ? "bg-blue-600 hover:bg-blue-500 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}>
            <PlusCircle className="w-5 h-5 mr-2" />
            发布新{categoryTitles[activeCategory]}帖子
          </div>
        </Link>

        {/* 帖子列表 */}
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.length === 0 ? (
              <div className={cn(
                "p-4 text-center rounded-lg",
                isDark ? "bg-card" : "bg-white border border-gray-200"
              )}>
                <p className="text-muted-foreground">暂无{categoryTitles[activeCategory]}帖子，来发布第一个吧！</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link href={`/chat/post/${post.id}`} key={post.id}>
                  <div className={cn(
                    "p-3 rounded-lg transition-all hover:shadow-md",
                    isDark 
                      ? "bg-card/80 hover:bg-card" 
                      : "bg-white border border-gray-200/80 hover:border-gray-300"
                  )}>
                    <div className="flex items-center mb-1.5">
                      <img src={post.avatar || '/api/avatar-proxy?seed=default'} alt="头像" className="w-6 h-6 rounded-full border mr-2" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs">{post.username || '匿名用户'}</div>
                      </div>
                      <div className="text-gray-400 text-xs whitespace-nowrap">
                        {post.createdAt?.toDate ? 
                          formatDate(post.createdAt.toDate()) : 
                          ''
                        }
                      </div>
                    </div>

                    {post.title && (
                      <h3 className="font-bold text-sm mb-0.5 line-clamp-1">{post.title}</h3>
                    )}
                    
                    <p className={cn(
                      "text-xs line-clamp-2",
                      isDark ? "text-muted-foreground" : "text-gray-700"
                    )}>
                      {post.content}
                    </p>

                    {/* 显示图片预览（如果有） */}
                    {post.imageUrl && (
                      <div className="mt-1.5 relative">
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center rounded-md">
                          <Image className="w-5 h-5 text-white/70" />
                        </div>
                        <img 
                          src={post.imageUrl} 
                          alt="图片附件" 
                          className="w-full h-24 object-cover rounded-md opacity-90"
                        />
                      </div>
                    )}

                    <div className="flex items-center space-x-3 mt-1.5 text-gray-500 text-xs">
                      <div className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        <span>{post.replyCount || 0}</span>
                      </div>
                      {post.category && post.category !== CATEGORIES.PLAZA && (
                        <div className="ml-auto">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                            {categoryTitles[post.category] || post.category}
                          </span>
                        </div>
                      )}
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

// 格式化日期，更简洁地显示
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // 今天内的帖子显示小时和分钟
  if (diffDays === 0) {
    if (diffHours === 0) {
      if (diffMins === 0) {
        return '刚刚';
      }
      return `${diffMins}分钟前`;
    }
    return `${diffHours}小时前`;
  }
  
  // 7天内的帖子显示天数
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  
  // 超过7天的显示具体日期
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
} 