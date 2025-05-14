"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Sparkles } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewPostPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError('请填写标题和内容')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          author_name: authorName.trim() || '匿名用户' 
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '提交失败')
      }
      
      router.push(`/forum/post/${data.id}`)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('发布帖子时出错')
      }
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          aria-label="返回"
          className="hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="ml-2 text-xl font-medium flex items-center gap-2">
          发布新帖子
          <Sparkles className="w-4 h-4 text-primary" />
        </h1>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        <Card className={cn(
          "overflow-hidden transition-all border",
          "shadow-sm",
          isDark
            ? "bg-card/95 border-border/80"
            : "bg-card/95 border-border/50",
          "backdrop-blur-md"
        )}>
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">标题</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入标题"
                  required
                  className={cn(
                    "transition-all duration-200 focus:border-primary/50",
                    "focus-visible:ring-primary/20"
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorName" className="text-sm font-medium">您的昵称 (可选)</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="匿名用户"
                  className={cn(
                    "transition-all duration-200 focus:border-primary/50",
                    "focus-visible:ring-primary/20"
                  )}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">内容</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="请输入内容"
                  rows={8}
                  required
                  className={cn(
                    "transition-all duration-200 focus:border-primary/50 resize-none",
                    "focus-visible:ring-primary/20"
                  )}
                />
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-4 animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className={cn(
                  "w-full gap-2 shadow-sm transition-all duration-300",
                  "hover:shadow-md hover:scale-[1.01]",
                  "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-primary/10 before:to-transparent",
                  "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
                  "relative overflow-hidden"
                )}
                disabled={submitting}
              >
                {submitting ? '提交中...' : '发布帖子'}
                {!submitting && <Send className="w-4 h-4" />}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
} 