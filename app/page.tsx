"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Zap, TrendingUp, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import SplashScreen from './components/splash-screen'
import BottomNav from './components/BottomNav'
import TokenRankings from './components/token-rankings'
import SearchBar from './components/SearchBar'
import Banner from './components/Banner'
import EthereumProtection from './components/EthereumProtection'
import LogoBase64 from './components/LogoBase64'
import { XaiPriceBar } from './components/XaiPriceBar'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useThemedBanners } from "./components/DefaultBanners"
import { shouldShowSplash } from "./lib/splash-state"
import LanguageSwitcher from "./components/LanguageSwitcher"
import { useTranslation } from "./hooks/useTranslation"

export default function CryptoTracker() {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useTranslation()
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
  
  // 处理选择代币
  const handleTokenSelect = (token: any) => {
    // 导航到代币详情页面
    if (token && token.chain && token.token) {
      router.push(`/token/${token.chain}/${token.token}`);
    }
  };
  
  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <div className="min-h-screen transition-all duration-300">
      <EthereumProtection />
      
      {/* 背景装饰元素 */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>
      <div className="bg-decoration bg-decoration-4"></div>
      <div className="bg-decoration bg-decoration-5"></div>

      {/* 主容器 */}
      <div className="relative z-10 w-full">
        {/* 顶部区域 */}
        <div className="xai-compact-header">
          <div className="px-4 py-2 md:max-w-7xl md:mx-auto">
            {/* 页头：左边LOGO，右边搜索框 */}
            <div className="flex items-center justify-between gap-3">
              {/* 左侧：XAI LOGO */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="xai-header-logo">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
                    <LogoBase64 width={32} height={32} className="w-full h-full" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold gradient-text">XAI Finance</h1>
                </div>
              </div>
              
                              {/* 右侧：搜索框、语言切换和主题切换 */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  {/* 搜索框 */}
                  <div className="xai-search-container">
                    <div className={cn(
                      "relative backdrop-blur-sm border rounded-lg transition-all duration-300 h-9",
                      "hover:border-xai-purple/50 focus-within:border-xai-purple/50 focus-within:shadow-lg focus-within:shadow-xai-purple/25",
                      isDark ? "bg-card/60 border-border/40" : "bg-white/60 border-border/30"
                    )}>
            <SearchBar 
              isDark={isDark} 
                        showLogo={false}
              logoSize={40}
              simplified={true}
                        onResultSelect={handleTokenSelect}
                        placeholder={t.home.searchPlaceholder}
                      />
                    </div>
                  </div>
                  
                  {/* 语言切换按钮 */}
                  <LanguageSwitcher 
                    variant="icon-only"
                    className="w-9 h-9 btn-glow flex-shrink-0"
                  />
                  
                  {/* 主题切换按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xai-theme-toggle w-9 h-9 btn-glow flex-shrink-0"
                    onClick={toggleTheme}
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4 text-xai-orange" />
                    ) : (
                      <Moon className="w-4 h-4 text-xai-purple" />
                    )}
                  </Button>
                </div>
            </div>
          </div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="space-y-0">
          {/* 横幅轮播区域 */}
          <div className="relative">
            <div className="md:px-4">
              <div className="md:max-w-7xl md:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-xai-purple/20 via-xai-cyan/20 to-xai-green/20 blur-xl"></div>
                <div className="relative">
          <Banner 
            banners={banners}
            interval={5000}
            showArrows={true}
            showIndicators={true}
            borderRadius={0}
            className={cn(
                      "overflow-hidden shadow-2xl card-hover",
                      isDark ? "shadow-black/20" : "shadow-gray-200/50"
            )}
          />
                </div>
              </div>
            </div>
          </div>
          
          {/* XAI价格组件 - 紧贴横幅和代币主题 */}
          <div className="relative">
            <XaiPriceBar darkMode={isDark} />
          </div>


        
          {/* 代币排行榜区域 - 手机模式下无边距 */}
          <div className="relative">
            <div className="md:px-4">
              <div className="md:max-w-7xl md:mx-auto">
                <TokenRankings darkMode={isDark} mode="homepage" itemsPerPage={50} />
              </div>
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
