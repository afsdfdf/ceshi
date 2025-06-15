"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Zap, TrendingUp, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import SplashScreen from './components/splash-screen'
import BottomNav from './components/BottomNav'
import TokenRankings from './components/token-rankings'
import SearchBar from './components/SearchBar/index'
import Banner from './components/Banner'
import EthereumProtection from './components/EthereumProtection'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useThemedBanners } from "./components/DefaultBanners"
import { shouldShowSplash } from "./lib/splash-state"

export default function CryptoTracker() {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [showSplash, setShowSplash] = useState<boolean | null>(null)
  const banners = useThemedBanners()

  // 初始化时根据条件显示开屏
  useEffect(() => {
    // 只在组件第一次挂载时执行
    if (showSplash === null) {
      const shouldShow = shouldShowSplash()
      setShowSplash(shouldShow)
      
      // 如果需要显示开屏，2秒后关闭
      if (shouldShow) {
        const timer = setTimeout(() => {
          setShowSplash(false)
        }, 2000)
        
        return () => clearTimeout(timer)
      }
    }
    
    // 如果条件不满足，返回undefined
    return undefined;
  }, [showSplash])
  
  // 监听路由变化，用于判断是否是通过路由导航到首页
  useEffect(() => {
    // 路径是 / 表示在首页
    if (pathname === '/') {
      // 首页访问逻辑
    }
  }, [pathname])
  
  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" 
        : "bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50"
    )}>
      <EthereumProtection />
      
      {/* 背景装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-xai-purple/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-xai-cyan/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-xai-green/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* 主容器 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* 顶部区域 */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="px-4 py-3">
            {/* Logo和标题区域 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-xai-purple to-xai-cyan rounded-xl flex items-center justify-center neon-glow">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-xai-green rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold gradient-text">XAI Finance</h1>
                  <p className="text-xs text-muted-foreground">智能加密货币追踪</p>
                </div>
              </div>
              
              {/* 主题切换按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 btn-glow"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-xai-orange" />
                ) : (
                  <Moon className="w-5 h-5 text-xai-purple" />
                )}
              </Button>
            </div>
            
            {/* 搜索栏区域 */}
            <div className="relative">
              <SearchBar 
                isDark={isDark} 
                showLogo={false}
                logoSize={40}
                simplified={true}
              />
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="px-4 space-y-6">
          {/* 横幅轮播区域 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-xai-purple/20 via-xai-cyan/20 to-xai-green/20 rounded-2xl blur-xl"></div>
            <div className="relative">
              <Banner 
                banners={banners}
                interval={5000}
                showArrows={true}
                showIndicators={true}
                className={cn(
                  "overflow-hidden rounded-2xl shadow-2xl card-hover",
                  isDark ? "shadow-black/20" : "shadow-gray-200/50"
                )}
              />
            </div>
          </div>
          
          {/* 快速统计卡片 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cn(
              "p-4 rounded-xl card-hover backdrop-blur-sm",
              isDark ? "bg-card/50 border border-border/50" : "bg-white/70 border border-gray-200/50"
            )}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-xai-green to-xai-cyan rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">热门代币</p>
                  <p className="text-lg font-bold text-xai-green">+24.5%</p>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-xl card-hover backdrop-blur-sm",
              isDark ? "bg-card/50 border border-border/50" : "bg-white/70 border border-gray-200/50"
            )}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-xai-purple to-xai-pink rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">市值排名</p>
                  <p className="text-lg font-bold text-xai-purple">#1,247</p>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-xl card-hover backdrop-blur-sm",
              isDark ? "bg-card/50 border border-border/50" : "bg-white/70 border border-gray-200/50"
            )}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-xai-cyan to-xai-green rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">新币上线</p>
                  <p className="text-lg font-bold text-xai-cyan">156</p>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "p-4 rounded-xl card-hover backdrop-blur-sm",
              isDark ? "bg-card/50 border border-border/50" : "bg-white/70 border border-gray-200/50"
            )}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-xai-orange to-xai-pink rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">活跃度</p>
                  <p className="text-lg font-bold text-xai-orange">98.7%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 代币排行榜区域 */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-xai-purple/5 via-transparent to-xai-cyan/5 rounded-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold gradient-text">实时代币排行</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-xai-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">实时更新</span>
                </div>
              </div>
              <TokenRankings darkMode={isDark} mode="homepage" itemsPerPage={50} />
            </div>
          </div>
        </div>
        
        {/* 底部间距 */}
        <div className="h-20"></div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav currentTab="home" isDark={isDark} />
      
      {/* 开屏页 - 只在首次访问或刷新时显示 */}
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      
      {/* Toast通知组件 */}
      <Toaster />
    </div>
  )
}
