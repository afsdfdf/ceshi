"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Compass, MessageSquare, Pickaxe } from "lucide-react"
import { useTheme } from "next-themes"
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
  const [isMobile, setIsMobile] = useState(false)
  
  // 确保组件已挂载，避免hydration错误
  useEffect(() => {
    setMounted(true)
    
    // 检测是否为移动端
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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

  // 只在移动端显示
  if (!isMobile) {
    return null
  }

  // 完全独立的样式对象 - 确保始终显示
  const navStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100vw',
    zIndex: 99999,
    background: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    padding: '8px 0',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: isDark ? '0 -4px 20px rgba(0, 0, 0, 0.3)' : '0 -4px 20px rgba(0, 0, 0, 0.1)',
    minHeight: '64px',
    visibility: 'visible',
    opacity: 1,
    pointerEvents: 'auto',
    transform: 'translateY(0)',
    transition: 'none', // 移除过渡效果，防止动画隐藏
    overflow: 'visible'
  }

  const getItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    minWidth: '60px',
    textDecoration: 'none',
    color: isActive ? '#6366f1' : (isDark ? '#999' : '#666'),
    background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.2))' : 'transparent',
    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
  })

  const getIconStyle = (): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    marginBottom: '4px',
    transition: 'all 0.2s ease'
  })

  const getTextStyle = (): React.CSSProperties => ({
    fontSize: '10px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    lineHeight: 1
  })

  return (
    <nav 
      className="mobile-bottom-nav"
      style={navStyle}
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
            className="mobile-nav-item"
            style={getItemStyle(isActive)}
            aria-label={`导航到${item.name}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon 
              className="mobile-nav-icon"
              style={getIconStyle()}
              aria-hidden="true"
            />
            <span 
              className="mobile-nav-text"
              style={getTextStyle()}
            >
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}