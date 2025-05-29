"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Image, X, Smile } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

// 随机用户名和头像生成
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

// 使用Cloudinary上传图片
async function uploadImageToCloudinary(file: File): Promise<string> {
  try {
    // 将文件转换为base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // 调用上传API
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    
    if (!response.ok) {
      throw new Error('图片上传失败');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
}

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [category, setCategory] = useState(CATEGORIES.PLAZA)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 从URL参数初始化类别
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && Object.values(CATEGORIES).includes(categoryParam as any)) {
      setCategory(categoryParam as any)
    }
  }, [searchParams])
  
  // 添加表情符号的处理函数 - 简单版本，提示用户可以直接输入表情
  const handleEmojiClick = () => {
    alert('你可以直接在内容中输入表情符号 😊 👍 🎉')
  }

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // 文件类型检查
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    
    // 文件大小限制检查 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }
    
    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    // 保存文件对象用于上传
    setImageFile(file)
  }
  
  // 移除选择的图片
  const handleRemoveImage = () => {
    setPreviewImage(null)
    setImageFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim()) {
      alert('内容不能为空')
      return
    }
    
    setLoading(true)
    try {
      // 生成随机用户名和头像
      const username = nickname.trim() || getRandomName()
      const avatar = getRandomAvatar(username)
      
      // 构建帖子数据
      const postData: any = {
        title,
        content,
        username,
        avatar,
        category,
        createdAt: serverTimestamp(),
        likes: 0,
        replyCount: 0
      }
      
      // 如果有图片，上传到Cloudinary
      if (imageFile) {
        try {
          setUploadProgress(10)
          // 上传到Cloudinary
          const imageUrl = await uploadImageToCloudinary(imageFile)
          setUploadProgress(100)
          
          // 添加图片URL到帖子数据
          postData.imageUrl = imageUrl
        } catch (error) {
          console.error('图片上传失败:', error)
          // 即使图片上传失败，仍继续发布帖子（没有图片）
          setUploadProgress(0)
        }
      }
      
      // 存储帖子到 Firestore
      await addDoc(collection(db, 'posts'), postData)
      
      // 返回帖子列表页
      router.push('/chat')
    } catch (err) {
      console.error('发帖失败:', err)
      alert('发帖失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 预览头像
  const previewName = nickname.trim() || getRandomName()
  const previewAvatar = getRandomAvatar(previewName)

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户头像昵称 */}
          <div className="flex items-center space-x-3">
            <img src={previewAvatar} alt="头像" className="w-10 h-10 rounded-full border" />
            <input
              className={cn(
                "border p-2 rounded flex-1",
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              )}
              placeholder="昵称（可选，默认随机）"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={12}
            />
          </div>
          
          {/* 分类选择 */}
          <div className={cn(
            "p-3 rounded",
            isDark ? "bg-card/80 border border-border" : "bg-white border border-gray-200"
          )}>
            <label className="text-sm font-medium mb-2 block">选择分类</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(categoryTitles).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full transition-all",
                    category === value
                      ? isDark 
                        ? "bg-blue-600 text-white" 
                        : "bg-blue-500 text-white"
                      : isDark
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* 标题 */}
          <input
            className={cn(
              "w-full border p-2 rounded",
              isDark ? "bg-card border-border" : "bg-white border-gray-200"
            )}
            placeholder="标题（可选）"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          
          {/* 内容 */}
          <div className="relative">
            <textarea
              className={cn(
                "w-full border p-2 rounded min-h-[150px]",
                isDark ? "bg-card border-border" : "bg-white border-gray-200"
              )}
              placeholder={`发布${categoryTitles[category]}内容...`}
              value={content}
              onChange={e => setContent(e.target.value)}
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
          
          {/* 图片上传预览区域 */}
          <div className={cn(
            "border-2 border-dashed rounded-lg p-4 text-center",
            isDark ? "border-gray-700" : "border-gray-300"
          )}>
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="图片预览" 
                  className="max-h-60 mx-auto rounded-lg" 
                />
                <button 
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-gray-800 rounded-full p-1 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute left-0 right-0 bottom-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer py-6 flex flex-col items-center"
              >
                <Image className={cn(
                  "w-8 h-8 mb-2",
                  isDark ? "text-gray-500" : "text-gray-400"
                )} />
                <span className={cn(
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>
                  点击添加图片
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  支持 JPG、PNG 格式，最大5MB
                </span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          {/* 发布按钮 */}
          <button
            type="submit"
            className={cn(
              "w-full py-3 rounded-lg text-white font-medium", 
              loading 
                ? "bg-blue-400" 
                : isDark 
                  ? "bg-blue-600 hover:bg-blue-500" 
                  : "bg-blue-500 hover:bg-blue-600"
            )}
            disabled={loading}
          >
            {loading ? '发布中...' : '发布'}
          </button>
        </form>
      </div>
    </div>
  )
} 