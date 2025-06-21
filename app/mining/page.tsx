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
      "min-h-screen pb-16 flex flex-col items-center justify-center",
      isDark ? "bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 text-gray-800" : "bg-gradient-to-br from-pink-100 via-yellow-100 to-blue-100 text-gray-800"
    )}>
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 flex flex-col items-center animate-fade-in">
        <h2 className="text-3xl font-bold mb-4">演示挖矿页面</h2>
        <p className="mb-6 text-lg text-gray-600">这里是一个精美的演示页面，展示卡片、按钮和动画效果。</p>
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-blue-400 via-pink-400 to-yellow-300 animate-bounce flex items-center justify-center">
          <span className="text-4xl">⛏️</span>
        </div>
        <button className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200">立即体验</button>
      </div>
      <BottomNav currentTab="mining" isDark={isDark} />
    </div>
  )
} 