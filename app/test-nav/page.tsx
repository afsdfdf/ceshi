"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import BottomNav from "../components/BottomNav"

export default function TestNavPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <div className={cn(
      "min-h-screen pb-20",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">底部导航测试页面</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">测试信息</h2>
            <p>当前主题: {isDark ? "深色" : "浅色"}</p>
            <p>屏幕宽度: <span id="screen-width">检测中...</span></p>
            <p>底部导航状态: <span id="nav-status">检测中...</span></p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">导航测试</h2>
            <p>请检查页面底部是否显示了导航栏</p>
            <p>导航栏应该包含：首页、市场、发现、挖矿、聊天</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">填充内容</h2>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} className="mb-2">
                这是第 {i + 1} 行测试内容，用于测试页面滚动和底部导航的固定位置效果。
              </p>
            ))}
          </div>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav currentTab="test" isDark={isDark} />
      
      <script dangerouslySetInnerHTML={{
        __html: `
          function updateInfo() {
            const screenWidth = document.getElementById('screen-width');
            const navStatus = document.getElementById('nav-status');
            const nav = document.querySelector('.mobile-bottom-nav');
            
            if (screenWidth) {
              screenWidth.textContent = window.innerWidth + 'px';
            }
            
            if (navStatus && nav) {
              const styles = window.getComputedStyle(nav);
              navStatus.textContent = styles.display === 'none' ? '隐藏' : '显示';
            }
          }
          
          updateInfo();
          window.addEventListener('resize', updateInfo);
        `
      }} />
    </div>
  )
} 