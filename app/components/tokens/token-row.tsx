"use client";

import React, { memo, CSSProperties, useEffect, useState } from "react";
import { TokenRanking } from "@/app/types/token";
import { formatPercentChange } from "@/app/lib/formatters";

interface TokenRowProps {
  token: TokenRanking;
  index: number;
  darkMode: boolean;
  onClick: (token: TokenRanking) => void;
}

/**
 * 代币行组件 - 超简化版，使用内联样式
 */
function TokenRow({ 
  token, 
  index, 
  darkMode,
  onClick 
}: TokenRowProps) {
  // 使用状态存储需要客户端计算的值
  const [chainText, setChainText] = useState<string>("");
  const [formattedPrice, setFormattedPrice] = useState<string>("");
  const [formattedChange, setFormattedChange] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [priceChangeColor, setPriceChangeColor] = useState<string>("inherit");
  
  // 简化的价格格式化 - 移至函数外避免重复创建
  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return "$" + price.toFixed(2);
    } else if (price >= 0.001) {
      return "$" + price.toFixed(6);
    } else {
      return "$" + price.toFixed(8);
    }
  };

  // 在客户端执行的副作用
  useEffect(() => {
    // 标记现在在客户端
    setIsClient(true);
    
    // 计算链名称
    const chainMap: Record<string, string> = {
      'ethereum': 'ETH',
      'bsc': 'BSC',
      'arbitrum': 'ARB',
      'polygon': 'POLY',
      'base': 'BASE',
      'avalanche': 'AVAX',
      'optimism': 'OP',
      'solana': 'SOL'
    };
    
    const calculatedChainText = chainMap[token.chain.toLowerCase()] || 
      token.chain.toUpperCase().substring(0, 4);
    
    // 格式化价格和变化百分比
    const price = formatPrice(token.current_price_usd);
    const change = (token.price_change_24h > 0 ? "+" : "") + 
      token.price_change_24h.toFixed(2) + "%";
    
    // Set the price change color in client side only
    const color = token.price_change_24h >= 0 ? 
      "rgb(16, 185, 129)" :  // #10b981 in RGB format
      "rgb(239, 68, 68)";    // #ef4444 in RGB format
    
    setChainText(calculatedChainText);
    setFormattedPrice(price);
    setFormattedChange(change);
    setPriceChangeColor(color);
  }, [token.chain, token.current_price_usd, token.price_change_24h]);
  
  // 内联样式，避免使用Tailwind类
  const rowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "4px",
    padding: "6px 12px",
    fontSize: "14px",
    alignItems: "center",
    cursor: "pointer",
    borderBottom: "1px solid " + (darkMode ? "#222" : "#eee"),
    background: darkMode ? "#111" : "#fff"
  };
  
  const tokenInfoStyle: CSSProperties = {
    gridColumn: "span 6",
    display: "flex",
    alignItems: "center"
  };
  
  const tokenIconStyle: CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: darkMode ? "#333" : "#f0f0f0",
    fontSize: "24px", // 增加笑脸表情大小以填满容器
    fontWeight: "bold",
    overflow: "hidden",
    flexShrink: 0
  };
  
  const tokenNameStyle: CSSProperties = {
    marginLeft: "8px",
    display: "flex",
    flexDirection: "column"
  };
  
  const symbolStyle: CSSProperties = {
    fontWeight: "500"
  };
  
  const chainStyle: CSSProperties = {
    fontSize: "10px",
    padding: "1px 4px",
    background: darkMode ? "#222" : "#f5f5f5",
    borderRadius: "2px",
    marginLeft: "4px"
  };
  
  const nameStyle: CSSProperties = {
    fontSize: "12px",
    color: darkMode ? "#aaa" : "#888"
  };
  
  const priceStyle: CSSProperties = {
    gridColumn: "span 3",
    textAlign: "right",
    fontWeight: "500"
  };
  
  const changeStyle: CSSProperties = {
    gridColumn: "span 3",
    textAlign: "right",
    color: priceChangeColor,
    fontWeight: "500",
    fontSize: "12px"
  };

  // 判断是否有有效的logo URL
  const hasLogo = token.logo_url && token.logo_url.trim() !== '';

  // 笑脸表情 - 用作LOGO加载失败或缺失时的默认显示
  const smileyFace = "☺️";
  
  // Placeholder for consistent hydration
  const placeholder = "...";

  // Placeholder color - use a neutral color for server rendering
  const placeholderColor = "inherit";

  // 渲染占位符或者完整内容
  return (
    <div 
      style={rowStyle}
      onClick={() => onClick(token)}
    >
      {/* 代币信息 */}
      <div style={tokenInfoStyle}>
        <div style={tokenIconStyle}>
          {hasLogo ? (
            <img 
              src={token.logo_url} 
              alt={token.symbol}
              style={{
                width: "100%", 
                height: "100%", 
                objectFit: "cover"
              }}
              onError={(e) => {
                // 图片加载失败时显示笑脸表情
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:24px; line-height:28px;">' + smileyFace + '</span>';
              }}
            />
          ) : (
            <span>{smileyFace}</span>
          )}
        </div>
        
        <div style={tokenNameStyle}>
          <div>
            <span style={symbolStyle}>{token.symbol.toUpperCase()}</span>
            {/* Always render the chain span for hydration consistency */}
            <span style={chainStyle}>{isClient ? chainText : placeholder}</span>
          </div>
          
          <div style={nameStyle}>
            {token.name || ""}
          </div>
        </div>
      </div>
      
      {/* 价格 - 使用一致的结构以保证服务端和客户端渲染一致 */}
      <div style={priceStyle}>
        {isClient ? formattedPrice : placeholder}
      </div>
      
      {/* 24h 价格变化 - 使用一致的结构以保证服务端和客户端渲染一致 */}
      <div style={{
        gridColumn: "span 3",
        textAlign: "right",
        color: isClient ? priceChangeColor : placeholderColor,
        fontWeight: "500",
        fontSize: "12px"
      }}>
        {isClient ? formattedChange : placeholder}
      </div>
    </div>
  );
}

// 简化的比较函数
function arePropsEqual(prevProps: TokenRowProps, nextProps: TokenRowProps) {
  return (
    prevProps.token.token === nextProps.token.token &&
    prevProps.token.current_price_usd === nextProps.token.current_price_usd &&
    prevProps.token.price_change_24h === nextProps.token.price_change_24h &&
    prevProps.darkMode === nextProps.darkMode
  );
}

// 使用memo包装组件以提高性能
export default memo(TokenRow, arePropsEqual); 