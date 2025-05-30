"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
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
      console.log('Home page visited via navigation')
    }
  }, [pathname])
  
  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className={cn(
      "mobile-container mobile-fade-in",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      
      {/* 主容器 - 全屏显示，完全无边距 */}
      <div className="w-full">
        {/* 顶部搜索栏区域 - 完全贴边 */}
        <div className="mobile-card mobile-p-2 mb-1">
          <SearchBar 
            isDark={isDark} 
            showLogo={true}
            logoSize={40}
            simplified={true}
          />
        </div>
        
        {/* 横幅轮播区域 - 完全贴边 */}
        <div className="mb-1">
          <Banner 
            banners={banners}
            interval={5000}
            showArrows={true}
            showIndicators={true}
            className={cn(
              "overflow-hidden mobile-fade-in",
              isDark ? "shadow-md shadow-black/20" : "shadow-md shadow-gray-200"
            )}
          />
        </div>
        
        {/* 主题切换按钮 - 固定位置 */}
        <div className="fixed top-4 right-4 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-btn-small mobile-touch-feedback rounded-full w-10 h-10"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="mobile-icon" />
            ) : (
              <Moon className="mobile-icon" />
            )}
          </Button>
        </div>
        
        {/* 代币排行榜区域 - 完全贴边 */}
        <div>
          <TokenRankings darkMode={isDark} mode="homepage" itemsPerPage={50} />
        </div>
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
