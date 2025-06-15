"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Compass, MessageSquare, Pickaxe } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface BottomNavProps {
  darkMode?: boolean;
  currentTab?: string;
  isDark?: boolean;
}

export default function BottomNav({ darkMode, currentTab, isDark: propIsDark }: BottomNavProps) {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // 确保组件已挂载，避免hydration错误
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 优先使用传入的isDark，其次是darkMode，最后从主题中获取
  const isDark = propIsDark !== undefined 
    ? propIsDark 
    : (darkMode !== undefined 
      ? darkMode 
      : resolvedTheme === "dark");

  const navItems = [
    {
      name: "首页",
      icon: Home,
      href: "/",
      id: "home"
    },
    {
      name: "市场",
      icon: BarChart2,
      href: "/market",
      id: "market"
    },
    {
      name: "发现",
      icon: Compass,
      href: "/discover",
      id: "discover"
    },
    {
      name: "挖矿",
      icon: Pickaxe,
      href: "/mining",
      id: "mining"
    },
    {
      name: "聊天",
      icon: MessageSquare,
      href: "/chat",
      id: "chat"
    }
  ]

  // 防止hydration错误
  if (!mounted) {
    return null
  }

  return (
    <nav 
      className={cn(
        "mobile-bottom-nav",
        "fixed bottom-0 left-0 right-0 z-50",
        "h-16 md:h-20",
        "bg-background/95 backdrop-blur-lg",
        "border-t border-border/50",
        "flex items-center justify-around",
        "px-2 py-2",
        "transition-all duration-300",
        isDark ? "shadow-lg shadow-black/20" : "shadow-lg shadow-gray-200/50"
      )}
      role="navigation"
      aria-label="主导航"
    >
      {navItems.map((item) => {
        // 从当前路径或指定的currentTab确定活动标签
        const isActive = currentTab 
          ? item.id === currentTab
          : pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          
        const Icon = item.icon
        
        return (
          <Link 
            key={item.id}
            href={item.href}
            className={cn(
              "mobile-nav-item",
              "flex flex-col items-center justify-center",
              "min-w-12 min-h-12",
              "rounded-lg transition-all duration-200",
              "hover:bg-accent/50 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "-webkit-tap-highlight-color: transparent",
              isActive 
                ? "text-primary bg-primary/10" 
                : isDark 
                  ? "text-muted-foreground hover:text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`导航到${item.name}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon 
              className={cn(
                "mobile-nav-icon",
                "w-5 h-5 mb-1",
                "transition-all duration-200",
                isActive && "scale-110"
              )} 
              aria-hidden="true"
            />
            <span 
              className={cn(
                "mobile-nav-text",
                "text-xs font-medium",
                "transition-all duration-200",
                isActive && "font-semibold"
              )}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}