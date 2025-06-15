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
  itemsPerPage?: number;
}

/**
 * 代币表格组件 - 增加分页功能
 */
function TokensTable({
  tokens,
  currentPage: initialPage = 1,
  darkMode,
  onRefresh,
  lastUpdated,
  itemsPerPage = 50
}: TokensTableProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
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

  // 计算分页数据
  const totalPages = Math.ceil(tokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, tokens.length);
  const paginatedTokens = tokens.slice(startIndex, endIndex);

  // 分页导航处理
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 基础样式 - 响应式设计，手机模式下无边框
  const tableStyle: CSSProperties = {
    width: "100%",
    border: "none", // 移除边框
    borderRadius: "0", // 移除圆角
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

  const disabledButtonStyle: CSSProperties = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "default"
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

  const paginationStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderTop: "1px solid " + (darkMode ? "#333" : "#eee"),
    fontSize: "12px",
    color: darkMode ? "#aaa" : "#666"
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
          paginatedTokens.map((token, index) => (
            <TokenRow
              key={`${token.chain}-${token.token}`}
              token={token}
              index={startIndex + index}
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
      
      {/* 分页控制 */}
      {tokens.length > itemsPerPage && (
        <div style={paginationStyle}>
          <div>
            显示 {startIndex + 1}-{endIndex} / {tokens.length} 项
          </div>
          <div style={{display: "flex", gap: "8px"}}>
            <button 
              style={currentPage > 1 ? buttonStyle : disabledButtonStyle}
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              上一页
            </button>
            <span style={{padding: "4px 0"}}>
              {currentPage} / {totalPages}
            </span>
            <button 
              style={currentPage < totalPages ? buttonStyle : disabledButtonStyle}
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              下一页
            </button>
          </div>
        </div>
      )}
      
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