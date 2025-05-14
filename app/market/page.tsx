"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import BottomNav from "@/app/components/BottomNav"
import TokenRankings from "@/app/components/token-rankings"
import EthereumProtection from "../components/EthereumProtection"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import SearchBar from "@/app/components/SearchBar"

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
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      <div className="max-w-md mx-auto">
        {/* 搜索部分 */}
        <div className="p-4 pb-2 pt-6">
          <SearchBar 
            isDark={isDark} 
            showLogo={true}
            logoSize={40}
            simplified={true}
            onResultSelect={handleTokenSelect}
            placeholder="搜索代币名称或合约地址 (例如: eth:0x123...)"
          />
        </div>

        {/* 代币主题模块 */}
        <div className="p-4 pt-0 relative">
          {/* 主题内容与排行榜 */}
          <TokenRankings darkMode={isDark} mode="market" />
        </div>

        {/* 主题开关 */}
        <div className="absolute top-6 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 底部导航 */}
        <BottomNav darkMode={isDark} />
      </div>
      <Toaster />
    </div>
  )
} 