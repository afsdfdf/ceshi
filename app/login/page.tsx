"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // 登录表单
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  
  // 注册表单
  const [regEmail, setRegEmail] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  
  // 检查用户是否已登录
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/chat')
      }
    }
    
    checkUser()
  }, [router])
  
  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLoginError('请填写邮箱和密码')
      return
    }
    
    try {
      setLoginLoading(true)
      setLoginError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      // 登录成功，跳转到首页
      router.push('/chat')
      
    } catch (error: any) {
      // 登录失败: ${error}
      setLoginError('登录失败，邮箱或密码错误')
    } finally {
      setLoginLoading(false)
    }
  }
  
  // 注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!regEmail || !regUsername || !regPassword) {
      setRegError('请填写所有必填字段')
      return
    }
    
    if (regPassword !== regPasswordConfirm) {
      setRegError('两次密码输入不一致')
      return
    }
    
    if (regPassword.length < 6) {
      setRegError('密码至少需要6个字符')
      return
    }
    
    try {
      setRegLoading(true)
      setRegError(null)
      
      // 1. 先注册用户
      const { data, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            username: regUsername
          }
        }
      })
      
      if (authError) {
        // 身份验证错误: ${authError}
        throw new Error(authError.message)
      }
      
      // 用户注册成功: ${data}
      
      // 2. 如果认证成功，创建用户资料
      if (data && data.user) {
        try {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            username: regUsername,
            email: regEmail,
            is_admin: false,
            created_at: new Date().toISOString()
          })
          
          if (profileError) {
            // 创建用户资料失败: ${profileError}
            // 不抛出错误，用户已创建成功，可以登录
          } else {
            // 用户资料创建成功
          }
        } catch (profileException) {
          // 创建资料异常: ${profileException}
          // 继续执行，不中断流程
        }
        
        // 3. 用户信息更新
        try {
          // 尝试更新用户元数据，确保用户名被保存
          await supabase.auth.updateUser({
            data: { username: regUsername }
          })
        } catch (updateError) {
          // 更新用户数据失败: ${updateError}
        }
        
        // 4. 完成后跳转
        router.push('/chat')
      } else {
        // 如果没有用户数据但也没有错误，可能是Supabase的确认邮件功能
        // 注册成功，但可能需要邮箱验证
        setRegError('注册邮件已发送，请检查邮箱并确认注册')
      }
      
    } catch (error: any) {
      // 注册失败详细信息: ${error}
      if (error.message.includes('User already registered')) {
        setRegError('该邮箱已注册，请直接登录或使用其他邮箱')
      } else if (error.message.includes('Password')) {
        setRegError('密码格式错误: ' + error.message)
      } else {
        setRegError(error.message || '注册失败，请稍后重试')
      }
    } finally {
      setRegLoading(false)
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
          <h1 className="text-xl font-bold text-white">登录 / 注册</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto p-4">
        <div className={cn(
          "p-6 rounded-xl mt-4",
          isDark ? "bg-card" : "bg-white border border-gray-200"
        )}>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            {/* 登录面板 */}
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                {loginError && (
                  <div className="p-3 mb-4 text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                    {loginError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full py-6 rounded-xl"
                  disabled={loginLoading}
                >
                  {loginLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            {/* 注册面板 */}
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <div className="mb-4">
                  <label htmlFor="reg-email" className="block text-sm font-medium mb-1">
                    邮箱
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    用户名
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <UserIcon className="h-5 w-5" />
                    </span>
                    <Input
                      id="username"
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="请输入用户名"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-1">
                    密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="reg-password"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                    确认密码
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      placeholder="请再次输入密码"
                      className="pl-10 py-5"
                    />
                  </div>
                </div>
                
                {regError && (
                  <div className="p-3 mb-4 text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
                    {regError}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full py-6 rounded-xl"
                  disabled={regLoading}
                >
                  {regLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 