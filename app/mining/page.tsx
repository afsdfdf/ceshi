"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import BottomNav from "../components/BottomNav"
import EthereumProtection from "../components/EthereumProtection"

export default function MiningPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      
      {/* 挖矿内容 - 嵌入外部网站 */}
      <div className="w-full h-screen">
        <iframe
          src="https://m.xaiswp.app"
          className="w-full h-full border-0"
          style={{ 
            width: "100vw", 
            height: "calc(100vh - 64px)", // 减去底部导航栏高度
            border: "none",
            overflow: "hidden"
          }}
          allowFullScreen
          loading="lazy"
          title="XAI 挖矿"
        />
      </div>
      
      {/* 底部导航 */}
      <BottomNav currentTab="mining" isDark={isDark} />
    </div>
  )
} 