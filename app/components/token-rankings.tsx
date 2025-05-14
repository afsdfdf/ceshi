"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import { Card } from "@/components/ui/card"
import { useTopics } from "@/app/hooks/use-topics"
import { useTokensByTopic } from "@/app/hooks/use-tokens"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// 导入子组件
import TopicSelector from "./tokens/topic-selector"
import TokensTable from "./tokens/tokens-table"
import LoadingState from "./tokens/loading-state"
import { MainstreamTokens } from "./MainstreamTokens"

interface TokenRankingsProps {
  darkMode: boolean;
  mode?: 'homepage' | 'market';
}

// 使用React.memo优化子组件渲染
const MemoizedTokensTable = memo(TokensTable);
const MemoizedTopicSelector = memo(TopicSelector);
const MemoizedMainstreamTokens = memo(MainstreamTokens);

/**
 * 代币排行组件
 */
export default function TokenRankings({ 
  darkMode, 
  mode = 'homepage'
}: TokenRankingsProps) {
  // 使用next-themes获取当前主题
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark" || darkMode
  
  // 状态管理
  const [activeTopicId, setActiveTopicId] = useState<string>("hot")
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // 使用自定义Hook获取数据
  const { 
    topics, 
    isLoading: isTopicsLoading, 
    error: topicsError 
  } = useTopics()
  
  const { 
    tokens, 
    isLoading: isTokensLoading, 
    error: tokensError,
    refresh,
    lastUpdated,
    usingFallback
  } = useTokensByTopic(activeTopicId)

  // 组合加载状态和错误
  const isLoading = isTopicsLoading || isTokensLoading
  const error = topicsError || tokensError

  // 处理主题切换
  const handleTopicChange = (topicId: string) => {
    if (topicId === activeTopicId) return;
    
    setIsTransitioning(true);
    setActiveTopicId(topicId);
    
    // 优化的过渡效果
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }
  
  // 根据模式过滤主题
  const filteredTopics = mode === 'homepage' 
    ? topics.filter(topic => ['hot', 'meme', 'new', 'bsc', 'solana'].includes(topic.id))
    : topics;

  // 加载状态
  if (isLoading && tokens.length === 0) {
    return <LoadingState />
  }

  // 错误状态
  if (error && tokens.length === 0) {
    return (
      <Card className={cn(
        "p-6 border border-border animate-fade-in",
        "backdrop-blur-md",
        isDark ? "bg-card/95 shadow-lg" : "bg-card/95 shadow-md"
      )}>
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive animate-pulse" />
          <div className="text-destructive font-medium">加载失败</div>
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <Button 
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full px-4 hover:scale-105 transition-transform",
              isDark ? "border-destructive/30 hover:bg-destructive/10" : "border-destructive/30 hover:bg-destructive/5"
            )}
            onClick={() => refresh()}
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </Card>
    )
  }

  // 正常渲染
  return (
    <Card className={cn(
      "p-3 border overflow-hidden animate-fade-in",
      "transition-all duration-300",
      "backdrop-blur-md",
      isDark 
        ? "bg-card/90 border-border/80 shadow-lg" 
        : "bg-card/95 border-border/50 shadow-md",
      "hover:shadow-xl hover:border-border transition-all duration-300"
    )}>
      <div className="flex items-center justify-between mb-1">
      {usingFallback && (
          <div className={cn(
            "text-xs px-2 py-1 rounded-full",
            "flex items-center gap-1",
            "animate-pulse-subtle",
            "transition-all duration-300",
          isDark 
              ? "bg-warning/15 text-warning/90 border border-warning/30" 
              : "bg-warning/15 text-warning/90 border border-warning/30"
        )}>
            <AlertCircle className="h-3 w-3" />
            <span>使用备用数据</span>
          </div>
      )}
      </div>

      {/* 主流币展示区域 */}
      <div className="mb-1">
        <MemoizedMainstreamTokens darkMode={isDark} />
        </div>
        
      {/* 主题选择器组件 */}
      <div className="mb-1">
        <MemoizedTopicSelector 
          topics={filteredTopics} 
          activeTopic={activeTopicId}
          onChange={handleTopicChange}
          darkMode={isDark}
          isTransitioning={isTransitioning}
        />
      </div>
      
      <div className={cn(
        "transition-all duration-300 transform-gpu",
        isTransitioning 
          ? "opacity-0 translate-x-4 blur-sm" 
          : "opacity-100 translate-x-0 blur-0"
      )}>
        <MemoizedTokensTable 
          tokens={tokens}
          currentPage={1}
          darkMode={isDark} 
          onRefresh={refresh}
          lastUpdated={lastUpdated}
        />
      </div>
    </Card>
  )
}