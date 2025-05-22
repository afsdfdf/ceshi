"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MainstreamToken {
  symbol: string
  price: number
  priceChange24h: number
  logo_url?: string
  link?: string
}

interface MainstreamTokensProps {
  darkMode: boolean
  itemsPerPage?: number
}

export function MainstreamTokens({ darkMode, itemsPerPage = 50 }: MainstreamTokensProps) {
  const router = useRouter()
  
  // 添加链接映射
  const tokenLinks: Record<string, string> = {
    'BTC': '/token/eth/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    'ETH': '/token/eth/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    'SOL': '/token/solana/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    'XAI': '/token/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487'
  }
  
  const [tokens, setTokens] = useState<MainstreamToken[]>([
    { 
      symbol: 'BTC', 
      price: 68000, 
      priceChange24h: -0.91,
      logo_url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      link: tokenLinks['BTC']
    },
    { 
      symbol: 'ETH', 
      price: 3500, 
      priceChange24h: -1.2,
      logo_url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      link: tokenLinks['ETH']
    },
    { 
      symbol: 'BNB', 
      price: 652, 
      priceChange24h: -1.6,
      logo_url: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
    },
    { 
      symbol: 'SOL', 
      price: 175, 
      priceChange24h: -1.44,
      logo_url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      link: tokenLinks['SOL']
    },
    { 
      symbol: 'XAI', 
      price: 0.00005238, 
      priceChange24h: 21.38,
      logo_url: 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png',
      link: tokenLinks['XAI']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 处理代币点击
  const handleTokenClick = (token: MainstreamToken) => {
    if (token.link) {
      router.push(token.link);
    }
  };
  
  // 极简实现 - 直接使用默认代币
  useEffect(() => {
    const fetchTokens = () => {
      try {
        fetch('/api/mainstream-prices')
          .then(res => res.json())
          .then(data => {
            if (data && data.mainstream && Array.isArray(data.mainstream)) {
              const formatted = data.mainstream.map((token: any) => {
                const symbol = token.symbol.toUpperCase();
                return {
                  symbol,
                  price: token.current_price,
                  priceChange24h: token.price_change_percentage_24h,
                  logo_url: token.image,
                  link: tokenLinks[symbol]
                };
              });
              
              // 添加XAI
              if (data.xai) {
                formatted.push({
                  symbol: 'XAI',
                  price: data.xai.current_price || 0.00005238,
                  priceChange24h: data.xai.price_change_percentage_24h || 21.38,
                  logo_url: data.xai.image || 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png',
                  link: tokenLinks['XAI']
                });
              }
              
              setTokens(formatted);
            }
          })
          .catch(() => {
            // 使用默认数据，已经在state初始化了
          });
      } catch (e) {
        // 异常处理 - 使用默认数据
      }
    };
    
    fetchTokens();
  }, []);
  
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
  
  // 极简格式化 - 改进版以避免溢出
  function formatPrice(price: number): string {
    if (price >= 10000) return "$" + (price / 1000).toFixed(1) + "K";
    if (price >= 1000) return "$" + price.toFixed(0);
    if (price >= 1) return "$" + price.toFixed(2);
    if (price >= 0.01) return "$" + price.toFixed(4);
    return "$" + price.toFixed(8).substring(0, 9); // 截断超长价格
  }
  
  function formatChange(change: number): string {
    return (change >= 0 ? "+" : "") + change.toFixed(1) + "%";
  }

  // 计算宽度
  const itemWidth = "calc(20% - 6px)";
  
  // 笑脸表情 - 用作LOGO加载失败或缺失时的默认显示
  const smileyFace = "☺️";
  
  // 分页按钮样式
  const buttonStyle = {
    background: "none",
    border: "1px solid " + (darkMode ? "#444" : "#ddd"),
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    color: darkMode ? "#fff" : "#333",
    marginLeft: "8px"
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.5,
    cursor: "default"
  };

  const paginationStyle = {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    margin: "8px 0",
    fontSize: "12px",
    color: darkMode ? "#aaa" : "#666"
  };

  // 超级简化版UI - 紧凑型布局
  return (
    <div>
      <div style={{display: 'flex', gap: '4px', padding: '2px 0', flexWrap: 'wrap'}}>
        {paginatedTokens.map((token) => (
          <div 
            key={token.symbol}
            style={{
              width: itemWidth,
              height: '46px', // 增加10%高度
              padding: '3px',
              border: '1px solid #eee',
              borderRadius: '4px',
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: darkMode ? '#111' : '#fff',
              marginBottom: '4px',
              cursor: token.link ? 'pointer' : 'default', // 有链接时显示指针样式
              opacity: token.link ? 1 : 0.8 // 无链接时降低透明度
            }}
            onClick={() => handleTokenClick(token)}
          >
            {/* 第一行：符号和变化百分比 */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px'}}>
              <div style={{display: 'flex', alignItems: 'center', maxWidth: '70%', overflow: 'hidden'}}>
                {token.logo_url ? (
                  <img 
                    src={token.logo_url} 
                    alt={token.symbol}
                    style={{
                      width: '16px', // 增加29%
                      height: '16px', // 增加29%
                      borderRadius: '50%',
                      marginRight: '3px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                    onError={(e) => {
                      // 图片加载失败时显示笑脸表情
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = smileyFace;
                    }}
                  />
                ) : (
                  <span style={{
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '3px',
                    fontSize: '14px'
                  }}>
                    {smileyFace}
                  </span>
                )}
                <span style={{
                  fontSize: '8px', // 减少10%
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>{token.symbol}</span>
              </div>
              <span style={{
                fontSize: '8px', 
                color: token.priceChange24h >= 0 ? '#10b981' : '#ef4444',
                flexShrink: 0
              }}>
                {formatChange(token.priceChange24h)}
              </span>
            </div>
            
            {/* 第二行：价格 */}
            <div style={{
              fontSize: '10px', 
              textAlign: 'center',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: '0 1px'
            }}>
              {formatPrice(token.price)}
            </div>
          </div>
        ))}
      </div>

      {/* 分页控制 */}
      {tokens.length > itemsPerPage && (
        <div style={paginationStyle}>
          <button 
            style={currentPage > 1 ? buttonStyle : disabledButtonStyle}
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            上一页
          </button>
          <span style={{padding: "0 8px"}}>
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
      )}
    </div>
  )
}