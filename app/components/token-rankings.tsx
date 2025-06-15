"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { useTopics } from "@/app/hooks/use-topics"
import { useTokensByTopic } from "@/app/hooks/use-tokens"
import { AlertCircle } from "lucide-react"
import TopicSelector from "./tokens/topic-selector"
import TokensTable from "./tokens/tokens-table"
import LoadingState from "./tokens/loading-state"
import ErrorDisplay from "./ErrorDisplay"

interface TokenRankingsProps {
  darkMode: boolean;
  mode?: 'homepage' | 'market';
  itemsPerPage?: number;
}

/**
 * 代币排行组件 - 超简化版
 */
export default function TokenRankings({ 
  darkMode, 
  mode = 'homepage',
  itemsPerPage = 50
}: TokenRankingsProps) {
  // 状态管理
  const [activeTopicId, setActiveTopicId] = useState<string>("hot")
  
  // 使用自定义Hook获取数据
  const { topics, isLoading: isTopicsLoading, error: topicsError } = useTopics()
  const { 
    tokens, 
    isLoading: isTokensLoading, 
    error: tokensError,
    refresh,
    lastUpdated,
    usingFallback
  } = useTokensByTopic(activeTopicId)

  // 组合加载状态
  const isLoading = isTopicsLoading || isTokensLoading
  const error = topicsError || tokensError;

  // 处理主题切换
  const handleTopicChange = (topicId: string) => {
    if (topicId === activeTopicId) return;
    setActiveTopicId(topicId);
  }
  
  // 根据模式过滤主题
  const filteredTopics = mode === 'homepage' 
    ? topics.filter(topic => ['hot', 'meme', 'new', 'bsc', 'solana'].includes(topic.id))
    : topics;

  // 计算基本样式 - 响应式设计，透明背景
  const cardStyle = {
    padding: "12px 0", // 移除左右padding，让内容贴边
    border: "none", // 移除边框
    borderRadius: "0", // 移除圆角
    overflow: "hidden",
    background: "transparent" // 设置为透明背景
  };
  
  const warningStyle = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#f59e0b",
    background: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    marginBottom: "8px"
  };

  // 加载状态
  if (isLoading && tokens.length === 0) {
    return <LoadingState />
  }

  // 错误状态
  if (error && tokens.length === 0) {
    return (
      <div style={{
        padding: "12px",
        border: "1px solid " + (darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
        borderRadius: "8px",
        background: "transparent",
        backdropFilter: "blur(10px)"
      }}>
        <ErrorDisplay 
          error={error}
          onRetry={refresh}
          isRetrying={isLoading}
          variant="card"
        />
      </div>
    )
  }

  // 正常渲染
  return (
    <div style={cardStyle}>
      {usingFallback && (
        <div style={warningStyle}>
          <AlertCircle size={12} /> 
          <span>使用备用数据</span>
        </div>
      )}
        
      {/* 主题选择器组件 */}
      <div style={{marginBottom: "4px"}}>
        <TopicSelector 
          topics={filteredTopics} 
          activeTopic={activeTopicId}
          onChange={handleTopicChange}
          darkMode={darkMode}
          isTransitioning={false}
        />
      </div>
      
      {/* 代币表格 - 显示所有代币 */}
      <div>
        <TokensTable 
          tokens={tokens}
          currentPage={1}
          darkMode={darkMode} 
          onRefresh={refresh}
          lastUpdated={lastUpdated}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  )
}