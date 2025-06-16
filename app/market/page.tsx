"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import BottomNav from "@/app/components/BottomNav"
import TokenRankings from "@/app/components/token-rankings"
import EthereumProtection from "../components/EthereumProtection"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import SearchBar from "@/app/components/SearchBar"
import LogoBase64 from "@/app/components/LogoBase64"

export default function MarketPage() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // 处理选择代币
  const handleTokenSelect = (token: any) => {
    // 导航到代币详情页面
    if (token && token.chain && token.token) {
      router.push(`/token/${token.chain}/${token.token}`);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="min-h-screen pb-20 transition-all duration-300">
      <EthereumProtection />
      
      {/* 背景装饰元素 */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>

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
              
              {/* 右侧：搜索框和主题切换 */}
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
                      placeholder="搜索代币..."
                  />
                  </div>
                </div>
                
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
        <div className="space-y-6">
          {/* 代币排行榜区域 - 手机模式下无边距 */}
          <div className="relative">
            <div className="md:px-4">
              <div className="md:max-w-7xl md:mx-auto">
                <TokenRankings darkMode={isDark} mode="market" itemsPerPage={50} />
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部间距 */}
        <div className="h-20"></div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav currentTab="market" isDark={isDark} />
      
      {/* Toast通知组件 */}
      <Toaster />
    </div>
  )
} 