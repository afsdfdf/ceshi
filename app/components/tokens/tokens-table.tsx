"use client";

import React, { useState, CSSProperties, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenRanking } from "@/app/types/token";
import TokenRow from "./token-row";
import { formatUpdatedTime } from "@/app/lib/formatters";

interface TokensTableProps {
  tokens: TokenRanking[];
  currentPage: number;
  darkMode: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
}

/**
 * 代币表格组件 - 超简化版，无分页
 */
function TokensTable({
  tokens,
  currentPage,
  darkMode,
  onRefresh,
  lastUpdated
}: TokensTableProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 处理代币点击
  const handleTokenClick = (token: TokenRanking) => {
    router.push(`/token/${token.chain}/${token.token}`);
  };
  
  // 处理刷新点击
  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        onRefresh();
      } finally {
        // 使用setTimeout确保异步完成后再设置状态
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  };

  // 基础样式
  const tableStyle: CSSProperties = {
    width: "100%",
    border: "1px solid " + (darkMode ? "#333" : "#eee"),
    borderRadius: "8px",
    overflow: "hidden",
    background: darkMode ? "#111" : "#fff"
  };
  
  const headerStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "4px",
    padding: "6px 12px",
    fontSize: "10px",
    fontWeight: "bold",
    borderBottom: "1px solid " + (darkMode ? "#333" : "#eee"),
    background: darkMode ? "#222" : "#f5f5f5"
  };
  
  const tokenListStyle: CSSProperties = {
    padding: "4px",
    maxHeight: "70vh", // 限制最大高度，避免页面过长
    overflowY: "auto" // 添加垂直滚动条
  };
  
  const refreshAreaStyle: CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    padding: "8px 12px",
    fontSize: "12px",
    color: darkMode ? "#aaa" : "#666"
  };
  
  const buttonStyle: CSSProperties = {
    background: "none",
    border: "1px solid " + (darkMode ? "#444" : "#ddd"),
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    color: darkMode ? "#fff" : "#333",
    marginLeft: "8px"
  };
  
  const emptyStyle: CSSProperties = {
    textAlign: "center",
    padding: "24px",
    color: darkMode ? "#aaa" : "#666"
  };

  const columnStyle: CSSProperties = {
    gridColumn: "span 6"
  };
  
  const rightColumnStyle: CSSProperties = {
    gridColumn: "span 3",
    textAlign: "right"
  };

  return (
    <div style={tableStyle}>
      {/* 表头 */}
      <div style={headerStyle}>
        <div style={columnStyle}>代币/链池</div>
        <div style={rightColumnStyle}>价格</div>
        <div style={rightColumnStyle}>24h涨幅</div>
      </div>

      {/* 代币行 */}
      <div style={tokenListStyle}>
        {tokens.length > 0 ? (
          tokens.map((token, index) => (
            <TokenRow
              key={`${token.chain}-${token.token}`}
              token={token}
              index={index}
              darkMode={darkMode}
              onClick={handleTokenClick}
            />
          ))
        ) : (
          <div style={emptyStyle}>
            <div>没有找到代币数据</div>
            <div style={{fontSize: "12px", marginTop: "4px"}}>
              请尝试其他筛选条件或刷新页面
            </div>
          </div>
        )}
      </div>
      
      {/* 刷新按钮 */}
      {onRefresh && (
        <div style={refreshAreaStyle}>
          {lastUpdated && (
            <span>最后更新: {formatUpdatedTime(lastUpdated)}</span>
          )}
          <button 
            style={buttonStyle}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "刷新中..." : "刷新"}
          </button>
        </div>
      )}
    </div>
  );
}

export default TokensTable; 