"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useState } from "react"
import { Heart, Share, Star, TrendingUp, MessageSquare } from "lucide-react"

interface MobileOptimizedDemoProps {
  className?: string;
}

export default function MobileOptimizedDemo({ className }: MobileOptimizedDemoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [isLiked, setIsLiked] = useState(false)
  const [selectedTab, setSelectedTab] = useState("trending")

  const tabs = [
    { id: "trending", label: "热门", icon: TrendingUp },
    { id: "favorites", label: "收藏", icon: Star },
    { id: "recent", label: "最新", icon: MessageSquare }
  ]

  const demoItems = [
    {
      id: 1,
      title: "Bitcoin (BTC)",
      subtitle: "加密货币之王",
      price: "$43,256.78",
      change: "+2.45%",
      isPositive: true,
      avatar: "₿"
    },
    {
      id: 2,
      title: "Ethereum (ETH)",
      subtitle: "智能合约平台",
      price: "$2,654.32",
      change: "-1.23%",
      isPositive: false,
      avatar: "Ξ"
    },
    {
      id: 3,
      title: "XAI Token",
      subtitle: "AI驱动的加密项目",
      price: "$0.000045",
      change: "+15.67%",
      isPositive: true,
      avatar: "🤖"
    }
  ]

  return (
    <div className={cn("mobile-container", className)}>
      {/* 顶部标题区域 */}
      <div className="mobile-card mobile-fade-in">
        <div className="mobile-flex-between">
          <div>
            <h1 className="mobile-title-lg mobile-text-safe">移动端适配演示</h1>
            <p className="mobile-text-sm mobile-text-safe" style={{ color: 'var(--muted-foreground)' }}>
              展示统一的移动端UI组件
            </p>
          </div>
          <button 
            className={cn(
              "mobile-btn-small mobile-touch-feedback",
              isLiked ? "mobile-btn-primary" : "mobile-btn-secondary"
            )}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("mobile-icon", isLiked && "fill-current")} />
          </button>
        </div>
      </div>

      {/* 标签切换区域 */}
      <div className="mobile-card mobile-slide-up">
        <div className="mobile-scroll-x">
          <div className="mobile-scroll-content">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "mobile-tab-btn mobile-touch-feedback",
                    selectedTab === tab.id && "active"
                  )}
                >
                  <Icon className="mobile-icon" />
                  <span className="mobile-text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 输入框演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">输入框演示</h3>
        <input 
          type="text" 
          placeholder="搜索代币..."
          className="mobile-input mobile-w-full"
        />
        <textarea 
          placeholder="写下你的想法..."
          className="mobile-textarea mobile-w-full mt-3"
          rows={3}
        />
      </div>

      {/* 列表演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">列表演示</h3>
        <div className="space-y-2">
          {demoItems.map((item, index) => (
            <div key={item.id} className="mobile-list-item mobile-touch-feedback mobile-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* 头像 */}
              <div className="mobile-avatar mobile-flex-center mobile-font-bold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                {item.avatar}
              </div>

              {/* 主要内容 */}
              <div className="flex-1 ml-3">
                <h4 className="mobile-text-md mobile-font-semibold mobile-truncate">{item.title}</h4>
                <p className="mobile-text-sm mobile-truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {item.subtitle}
                </p>
              </div>

              {/* 价格信息 */}
              <div className="mobile-text-right">
                <div className="mobile-text-md mobile-font-semibold">{item.price}</div>
                <div className={cn(
                  "mobile-text-sm mobile-font-medium",
                  item.isPositive ? "text-green-500" : "text-red-500"
                )}>
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 栅格布局演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">栅格布局演示</h3>
        
        {/* 两列布局 */}
        <div className="mobile-grid-2 mb-4">
          <div className="mobile-p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="mobile-text-center">
              <div className="mobile-text-lg mobile-font-bold">1,234</div>
              <div className="mobile-text-xs" style={{ color: 'var(--muted-foreground)' }}>用户数</div>
            </div>
          </div>
          <div className="mobile-p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="mobile-text-center">
              <div className="mobile-text-lg mobile-font-bold">5,678</div>
              <div className="mobile-text-xs" style={{ color: 'var(--muted-foreground)' }}>交易量</div>
            </div>
          </div>
        </div>

        {/* 三列布局 */}
        <div className="mobile-grid-3">
          <button className="mobile-btn-small mobile-btn-primary mobile-touch-feedback">
            <Share className="mobile-icon" />
          </button>
          <button className="mobile-btn-small mobile-btn-secondary mobile-touch-feedback">
            <Star className="mobile-icon" />
          </button>
          <button className="mobile-btn-small mobile-btn-secondary mobile-touch-feedback">
            <Heart className="mobile-icon" />
          </button>
        </div>
      </div>

      {/* 按钮演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">按钮演示</h3>
        <div className="space-y-3">
          <button className="mobile-btn mobile-btn-primary mobile-w-full mobile-touch-feedback">
            主要按钮
          </button>
          <button className="mobile-btn mobile-btn-secondary mobile-w-full mobile-touch-feedback">
            次要按钮
          </button>
          <div className="mobile-flex gap-2">
            <button className="mobile-btn-small mobile-btn-primary mobile-touch-feedback flex-1">
              小按钮 1
            </button>
            <button className="mobile-btn-small mobile-btn-secondary mobile-touch-feedback flex-1">
              小按钮 2
            </button>
          </div>
        </div>
      </div>

      {/* 加载状态演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">加载状态演示</h3>
        <div className="space-y-3">
          <div className="mobile-skeleton h-4 rounded"></div>
          <div className="mobile-skeleton h-4 w-3/4 rounded"></div>
          <div className="mobile-skeleton h-4 w-1/2 rounded"></div>
        </div>
        <div className="mobile-loading mt-4">
          <div className="mobile-text-sm">加载中...</div>
        </div>
      </div>

      {/* 字体大小演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">字体大小演示</h3>
        <div className="space-y-2">
          <div className="mobile-title-xl">超大标题 24px</div>
          <div className="mobile-title-lg">大标题 20px</div>
          <div className="mobile-title-md">中标题 18px</div>
          <div className="mobile-title-sm">小标题 16px</div>
          <div className="mobile-text-lg">大正文 16px</div>
          <div className="mobile-text-md">中正文 14px</div>
          <div className="mobile-text-sm">小正文 12px</div>
          <div className="mobile-text-xs">超小正文 11px</div>
        </div>
      </div>

      {/* 文字处理演示 */}
      <div className="mobile-card">
        <h3 className="mobile-title-sm mb-3">文字处理演示</h3>
        <div className="space-y-3">
          <div className="mobile-truncate mobile-text-md">
            这是一个很长的文本，会被截断并显示省略号，这是一个很长的文本，会被截断并显示省略号
          </div>
          <div className="mobile-truncate-2 mobile-text-sm">
            这是一个多行文本的示例，最多显示两行，超出部分会被截断。这是一个多行文本的示例，最多显示两行，超出部分会被截断。这是一个多行文本的示例，最多显示两行，超出部分会被截断。
          </div>
          <div className="mobile-text-safe mobile-text-sm">
            这段文字会自动换行，不会溢出容器，确保在所有设备上都能正确显示。
          </div>
        </div>
      </div>
    </div>
  )
} 