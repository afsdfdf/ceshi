"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Compass, Book, User, MessageSquare } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  darkMode?: boolean;
  currentTab?: string;
  isDark?: boolean;
}

export default function BottomNav({ darkMode, currentTab, isDark: propIsDark }: BottomNavProps) {
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  
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
      name: "聊天",
      icon: MessageSquare,
      href: "/chat",
      id: "chat"
    },
    {
      name: "我的",
      icon: User,
      href: "/profile",
      id: "profile"
    }
  ]

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => {
        // 从当前路径或指定的currentTab确定活动标签
        const isActive = currentTab 
          ? item.id === currentTab
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
          
        const Icon = item.icon
        
        return (
          <Link 
            key={item.name}
            href={item.href}
            className={cn(
              "mobile-nav-item mobile-touch-feedback",
              isActive 
                ? "text-primary" 
                : isDark 
                  ? "text-muted-foreground hover:text-foreground/80" 
                  : "text-muted-foreground hover:text-foreground/80"
            )}
          >
            <Icon className={cn(
              "mobile-nav-icon",
              isActive ? "text-primary" : "text-inherit"
            )} />
            <span className="mobile-nav-text mobile-text-xs">{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}