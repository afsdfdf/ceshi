"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Compass, MessageSquare, Pickaxe } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useTranslation } from "@/app/hooks/useTranslation"

interface BottomNavProps {
  darkMode?: boolean;
  currentTab?: string;
  isDark?: boolean;
}

export default function BottomNav({ darkMode, currentTab, isDark: propIsDark }: BottomNavProps) {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation()
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
      name: t.navigation.home,
      icon: Home,
      href: "/",
      id: "home"
    },
    {
      name: t.navigation.market,
      icon: BarChart2,
      href: "/market",
      id: "market"
    },
    {
      name: t.navigation.discover,
      icon: Compass,
      href: "/discover",
      id: "discover"
    },
    {
      name: t.navigation.mining,
      icon: Pickaxe,
      href: "/mining",
      id: "mining"
    },
    {
      name: t.navigation.chat,
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
        "md:hidden" // 在桌面端隐藏底部导航栏
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
              isActive && "active"
            )}
            aria-label={`导航到${item.name}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon 
              className="mobile-nav-icon"
              aria-hidden="true"
            />
            <span className="mobile-nav-text">
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}