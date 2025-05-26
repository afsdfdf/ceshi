"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { useTopics } from "@/app/hooks/use-topics"
import { useTokensByTopic } from "@/app/hooks/use-tokens"
import { AlertCircle } from "lucide-react"
import TopicSelector from "./tokens/topic-selector"
import TokensTable from "./tokens/tokens-table"
import LoadingState from "./tokens/loading-state"
import { MainstreamTokens } from "./MainstreamTokens"

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

  // 计算基本样式
  const cardStyle = {
    padding: "12px",
    border: "1px solid " + (darkMode ? "#333" : "#eee"),
    borderRadius: "8px",
    overflow: "hidden",
    background: darkMode ? "#111" : "#fff"
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
        padding: "24px",
        textAlign: "center",
        border: "1px solid " + (darkMode ? "#333" : "#eee"),
        borderRadius: "8px",
        background: darkMode ? "#111" : "#fff"
      }}>
        <div style={{color: "#ef4444", marginBottom: "8px"}}>加载失败</div>
        <div style={{fontSize: "14px", color: darkMode ? "#aaa" : "#777", marginBottom: "16px"}}>
          {error}
        </div>
        <button 
          style={{
            background: "none",
            border: "1px solid " + (darkMode ? "#333" : "#ddd"),
            borderRadius: "16px",
            padding: "4px 12px",
            fontSize: "14px",
            cursor: "pointer"
          }}
          onClick={() => refresh()}
        >
          重试
        </button>
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

      {/* 主流币展示区域 */}
      {mode === 'homepage' && (
        <div style={{marginBottom: "2px"}}>
          <MainstreamTokens 
            darkMode={darkMode} 
          />
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