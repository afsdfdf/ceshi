"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, ThumbsUp, Smile, X } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { db } from '../../../firebase'
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import BottomNav from "../../../components/BottomNav" // 导入底部导航

// 帖子类别
const CATEGORIES = {
  PLAZA: 'plaza',
  NEW_TOKENS: 'new_tokens',
  MARKET: 'market',
  NEWS: 'news'
}

// 类别标题映射
const categoryTitles = {
  [CATEGORIES.PLAZA]: '聊天广场',
  [CATEGORIES.NEW_TOKENS]: '新币推荐',
  [CATEGORIES.MARKET]: '二级市场',
  [CATEGORIES.NEWS]: '新闻'
}

// 随机用户名和头像生成 (与发帖页一致)
const randomNames = [
  '匿名猫头鹰', '路人甲', '小透明', '神秘人', '热心网友', '匿名松鼠', '无名氏', '访客', '小可爱', '匿名海豚'
]
function getRandomName() {
  const idx = Math.floor(Math.random() * randomNames.length)
  return randomNames[idx] + Math.floor(100 + Math.random() * 900)
}
function getRandomAvatar(seed: string) {
  return `/api/avatar-proxy?seed=${seed}`
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newCommentContent, setNewCommentContent] = useState('')
  const [commentNickname, setCommentNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  // 添加状态用于图片浏览
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  
  // 获取帖子详情和评论
  useEffect(() => {
    async function fetchPostAndComments() {
      try {
        setLoading(true)
        
        // 获取帖子详情
        const postRef = doc(db, 'posts', params.id as string)
        const postSnap = await getDoc(postRef)
        
        if (!postSnap.exists()) {
          alert('帖子不存在或已删除')
          router.push('/chat')
          return
        }
        setPost({ id: postSnap.id, ...postSnap.data() })
        
        // 获取评论
        const commentsQuery = query(collection(db, 'posts', params.id as string, 'replies'), orderBy('createdAt', 'asc'))
        const commentsSnapshot = await getDocs(commentsQuery)
        const commentsData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setComments(commentsData)
        
      } catch (error) {
        console.error('获取数据失败:', error)
        alert('加载帖子失败')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchPostAndComments()
    }
  }, [params.id, router])
  
  // 表情提示
  const handleEmojiClick = () => {
    alert('你可以直接在评论中输入表情符号 😊 👍 🎉')
  }
  
  // 提交评论 (匿名)
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCommentContent.trim()) {
      alert('评论内容不能为空')
      return
    }
    
    try {
      setSubmittingComment(true)
      
      // 生成随机用户名和头像
      const username = commentNickname.trim() || getRandomName()
      const avatar = getRandomAvatar(username)
      
      // 添加评论到子集合
      const newReplyRef = await addDoc(collection(db, 'posts', params.id as string, 'replies'), {
        content: newCommentContent.trim(),
        username,
        avatar,
        createdAt: serverTimestamp(),
      })
      
      // 更新帖子的回复计数
      const postRef = doc(db, 'posts', params.id as string)
      const newReplyCount = (post.replyCount || 0) + 1
      await updateDoc(postRef, {
        replyCount: newReplyCount
      })
      
      // 更新本地状态
      const newReply = {
         id: newReplyRef.id,
         content: newCommentContent.trim(),
         username,
         avatar,
         createdAt: { toDate: () => new Date() } // Mock timestamp for immediate display
      }
      setComments([...comments, newReply])
      setPost({...post, replyCount: newReplyCount})
      setNewCommentContent('')
      setCommentNickname('')
      
    } catch (error: any) {
      console.error('提交评论失败:', error)
      alert('评论失败，请重试')
    } finally {
      setSubmittingComment(false)
    }
  }
  
  // 处理点赞
  const handleLikePost = async () => {
    if (!post) return
    
    try {
      setLikeLoading(true)
      const postRef = doc(db, 'posts', post.id);
      // 简单地增加 likes 字段，适用于匿名场景
      const newLikes = (post.likes || 0) + 1
      await updateDoc(postRef, {
        likes: newLikes
      });
      
      // 更新本地状态
      setPost({ ...post, likes: newLikes });
      
    } catch (error) {
      console.error('点赞失败:', error)
      alert('点赞失败，请重试')
    } finally {
      setLikeLoading(false)
    }
  }
  
  // 图片点击放大处理
  const handleImageClick = (imageUrl: string) => {
    setEnlargedImage(imageUrl);
  }

  // 关闭放大图片
  const handleCloseEnlargedImage = () => {
    setEnlargedImage(null);
  }
  
  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!post) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
      )}>
        <p className="text-muted-foreground">帖子不存在或已删除。</p>
      </div>
    )
  }
  
  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-background text-foreground" : "bg-gray-50 text-foreground"
    )}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 text-white"
            aria-label="返回"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white truncate">{post.title || 'XAI聊天广场'}</h1>
          
          {/* 显示帖子分类标签 */}
          {post.category && post.category !== CATEGORIES.PLAZA && (
            <div className="ml-auto">
              <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                {categoryTitles[post.category] || post.category}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        {/* Post Content */}
        <div className={cn(
          "p-4 rounded-xl shadow mb-6",
          isDark ? "bg-card" : "bg-white border border-gray-200"
        )}>
          <div className="flex items-center mb-3">
            <img src={post.avatar || '/api/avatar-proxy?seed=default'} alt="头像" className="w-8 h-8 rounded-full border mr-2" />
            <div className="flex-1">
              <div className="font-medium">{post.username || '匿名用户'}</div>
              <div className="text-xs text-muted-foreground">
                {post.createdAt?.toDate ? formatDate(post.createdAt.toDate()) : ''}
                
                {/* 展示帖子分类 */}
                {post.category && post.category !== CATEGORIES.PLAZA && (
                  <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]">
                    {categoryTitles[post.category] || post.category}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {post.title && <h2 className="text-xl font-bold mb-2">{post.title}</h2>}
          
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          
          {/* 显示图片（如果有） */}
          {post.imageUrl && (
            <div className="mt-4">
              <img 
                src={post.imageUrl} 
                alt="帖子图片" 
                className="max-w-full rounded-lg shadow-sm cursor-zoom-in"
                onClick={() => handleImageClick(post.imageUrl)} 
              />
            </div>
          )}
          
          {/* Like Button */}
          <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLikePost}
              disabled={likeLoading}
              className={cn(
                "flex items-center space-x-1 px-3 py-1 rounded-full",
                likeLoading ? "opacity-50" : "hover:bg-gray-100",
                isDark ? "text-blue-400 hover:bg-blue-900/20" : "text-blue-500"
              )}
            >
              <ThumbsUp className="w-5 h-5" />
              <span>{post.likes || 0} 赞</span>
            </button>
            
            <div className="flex items-center space-x-1 ml-4 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length} 评论</span>
            </div>
          </div>
        </div>
        
        {/* Comment Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">评论 ({comments.length})</h3>
          
          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className={cn(
            "p-4 rounded-xl shadow mb-6 space-y-3",
            isDark ? "bg-card" : "bg-white border border-gray-200"
          )}>
             <div className="flex items-center space-x-3">
              {/* Preview Avatar */}
              <img
                src={getRandomAvatar(commentNickname.trim() || getRandomName())}
                alt="头像预览"
                className="w-8 h-8 rounded-full border"
              />
              <input
                className={cn(
                  "border p-2 rounded flex-1 text-sm",
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                )}
                placeholder="你的昵称（可选）"
                value={commentNickname}
                onChange={e => setCommentNickname(e.target.value)}
                maxLength={12}
              />
            </div>
            
            <div className="relative">
              <Textarea
                className={cn(
                  "w-full border p-2 rounded min-h-[80px] text-sm",
                  isDark ? "bg-card border-border" : "bg-white border-gray-200"
                )}
                placeholder="发表你的评论... (可以使用表情符号😊)"
                value={newCommentContent}
                onChange={e => setNewCommentContent(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={handleEmojiClick}
                className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            <button
              type="submit"
              className={cn(
                "w-full py-2 rounded text-white",
                submittingComment 
                  ? "bg-blue-400" 
                  : isDark 
                    ? "bg-blue-600 hover:bg-blue-500" 
                    : "bg-blue-500 hover:bg-blue-600"
              )}
              disabled={submittingComment || !newCommentContent.trim()}
            >
              {submittingComment ? '发布中...' : '发布评论'}
            </button>
          </form>
          
          {/* Comment List */}
          {comments.length === 0 ? (
            <div className={cn(
              "p-4 text-center rounded-lg",
              isDark ? "bg-card/50" : "bg-gray-50"
            )}>
              <p className="text-gray-500">暂无评论，来发表第一条评论吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className={cn(
                  "p-3 rounded-xl shadow-sm",
                  isDark ? "bg-card/80" : "bg-white border border-gray-100"
                )}>
                  <div className="flex items-center space-x-3 mb-1">
                    <img src={comment.avatar || '/api/avatar-proxy?seed=default'} alt="头像" className="w-8 h-8 rounded-full border" />
                    <div>
                      <div className="font-semibold text-sm">{comment.username || '匿名用户'}</div>
                      <div className="text-gray-500 text-xs">{comment.createdAt?.toDate?.().toLocaleString?.() || ''}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav currentTab="chat" isDark={isDark} />
      
      {/* 图片放大层 */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleCloseEnlargedImage}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full"
            onClick={handleCloseEnlargedImage}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img 
            src={enlargedImage} 
            alt="放大查看"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
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