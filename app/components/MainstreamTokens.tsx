"use client"

import { useState, useEffect } from "react"

interface MainstreamToken {
  symbol: string
  price: number
  priceChange24h: number
  logo_url?: string
}

interface MainstreamTokensProps {
  darkMode: boolean
}

export function MainstreamTokens({ darkMode }: MainstreamTokensProps) {
  const [tokens, setTokens] = useState<MainstreamToken[]>([
    { 
      symbol: 'BTC', 
      price: 68000, 
      priceChange24h: -0.91,
      logo_url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
    },
    { 
      symbol: 'ETH', 
      price: 3500, 
      priceChange24h: -1.2,
      logo_url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
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
      logo_url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
    },
    { 
      symbol: 'XAI', 
      price: 0.00005238, 
      priceChange24h: 21.38,
      logo_url: 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png'
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  // 极简实现 - 直接使用默认代币
  useEffect(() => {
    const fetchTokens = () => {
      try {
        fetch('/api/mainstream-prices')
          .then(res => res.json())
          .then(data => {
            if (data && data.mainstream && Array.isArray(data.mainstream)) {
              const formatted = data.mainstream.map((token: any) => ({
                symbol: token.symbol.toUpperCase(),
                price: token.current_price,
                priceChange24h: token.price_change_percentage_24h,
                logo_url: token.image
              }));
              
              // 添加XAI
              if (data.xai) {
                formatted.push({
                  symbol: 'XAI',
                  price: data.xai.current_price || 0.00005238,
                  priceChange24h: data.xai.price_change_percentage_24h || 21.38,
                  logo_url: data.xai.image || 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png'
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
  
  // 超级简化版UI - 紧凑型布局
  return (
    <div style={{display: 'flex', gap: '4px', padding: '2px 0'}}>
      {tokens.map((token) => (
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
            background: darkMode ? '#111' : '#fff'
          }}
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
  )
}