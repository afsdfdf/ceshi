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
    <div className="min-h-screen transition-all duration-300">
      <EthereumProtection />
      
      {/* 背景装饰元素 */}
      <div className="bg-decoration bg-decoration-1"></div>
      <div className="bg-decoration bg-decoration-2"></div>
      <div className="bg-decoration bg-decoration-3"></div>

      {/* 主容器 */}
      <div className="relative z-10 w-full">
        {/* 顶部区域 */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="px-4 py-1.5 md:max-w-7xl md:mx-auto">
            {/* Logo和标题区域 */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {/* XAI LOGO */}
                <div className="relative">
                  <div className="w-7 h-7 rounded-lg overflow-hidden shadow-lg">
                    <LogoBase64 width={28} height={28} className="w-full h-full" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-xai-green rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-base font-bold gradient-text">XAI Finance</h1>
                  <p className="text-xs text-muted-foreground leading-none">智能加密货币追踪</p>
                </div>
              </div>
              
              {/* 主题切换按钮 */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-7 h-7 btn-glow"
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="w-3.5 h-3.5 text-xai-orange" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-xai-purple" />
                )}
              </Button>
            </div>
            
            {/* 搜索栏区域 */}
            <div className="relative">
              <div className="relative">
                {/* 搜索框背景装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-xai-purple/10 via-xai-cyan/10 to-xai-green/10 rounded-xl blur-sm"></div>
                
                {/* 美化的搜索框 */}
                <div className={cn(
                  "relative backdrop-blur-sm border rounded-xl transition-all duration-300 h-9",
                  "hover:border-xai-purple/50 focus-within:border-xai-purple/50 focus-within:shadow-lg focus-within:shadow-xai-purple/25",
                  isDark ? "bg-card/60 border-border/40" : "bg-white/60 border-border/30"
                )}>
                  <SearchBar 
                    isDark={isDark} 
                    showLogo={false}
                    logoSize={40}
                    simplified={true}
                    onResultSelect={handleTokenSelect}
                    placeholder="搜索代币名称或合约地址..."
                  />
                </div>
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