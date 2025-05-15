"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface MainstreamToken {
  symbol: string
  name: string
  price: number
  priceChange24h: number
  logoUrl: string
}

interface MainstreamTokensProps {
  darkMode: boolean
}

export function MainstreamTokens({ darkMode }: MainstreamTokensProps) {
  const [tokens, setTokens] = useState<MainstreamToken[]>([])
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark" || darkMode

  useEffect(() => {
    const fetchMainstreamTokens = async () => {
      try {
        setLoading(true)
        
        // 从统一服务端缓存API获取主流币数据
        console.log('从服务器缓存API获取主流币数据');
        const response = await fetch('/api/mainstream-prices', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 } // 强制刷新，不使用Next.js的缓存
        });
        
        if (!response.ok) {
          throw new Error(`获取主流币价格失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API响应数据:', data);
        
        // 处理主流币数据
        let formattedTokens = [];
        
        if (data.mainstream && Array.isArray(data.mainstream)) {
          formattedTokens = data.mainstream.map((token: any) => ({
            symbol: token.symbol.toUpperCase(),
            name: token.name,
            price: token.current_price,
            priceChange24h: token.price_change_percentage_24h,
            logoUrl: token.image
          }));
        }
        
        // 添加XAI数据
        if (data.xai) {
          formattedTokens.push({
            symbol: 'XAI',
            name: '𝕏AI',
            price: data.xai.current_price || 0.00005238,
            priceChange24h: data.xai.price_change_percentage_24h || 21.38,
            logoUrl: data.xai.image || 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
          });
        }
        
        // 设置数据
        setTokens(formattedTokens);
        
        // 显示缓存信息
        if (data.cached) {
          console.log(`使用缓存数据，缓存时间: ${data.cache_age || '未知'}`);
        }
        
        // 如果数据来源是回退，过3分钟后重试
        if (data.data_source === 'fallback') {
          console.log('使用回退数据，将在3分钟后重试');
          setTimeout(() => {
            fetchMainstreamTokens();
          }, 3 * 60 * 1000);
        }
      } catch (error) {
        console.error('获取主流代币错误:', error)
        // 回退数据
        setTokens([
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 68000,
            priceChange24h: -0.91,
            logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: 3500,
            priceChange24h: -1.2,
            logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
          },
          {
            symbol: 'BNB',
            name: 'Binance Coin',
            price: 652,
            priceChange24h: -1.6,
            logoUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
          },
          {
            symbol: 'SOL',
            name: 'Solana',
            price: 175,
            priceChange24h: -1.44,
            logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
          },
          {
            symbol: 'XAI',
            name: '𝕏AI',
            price: 0.00005238,
            priceChange24h: 21.38,
            logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
          }
        ])
        
        // 错误重试，2分钟后尝试重新获取数据
        setTimeout(() => {
          console.log('因错误重试获取数据');
          fetchMainstreamTokens();
        }, 2 * 60 * 1000);
      } finally {
        setLoading(false)
      }
    }
    
    fetchMainstreamTokens()
    
    // 每5分钟刷新一次数据
    const intervalId = setInterval(fetchMainstreamTokens, 5 * 60 * 1000)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  
  // 格式化价格显示
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 0.01) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    } else if (price >= 0.000001) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
    } else {
      // 极小数值使用科学计数法
      return `$${price.toExponential(2)}`;
    }
  }
  
  // 格式化价格变化
  const formatPriceChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  // 计算每个卡片宽度，平均分配空间
  const itemWidth = `calc(20% - 6px)`;  // 5个代币，每个占20%宽度，减去间距
  
  if (loading) {
    return (
      <div className={cn(
        "flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none py-1 px-1",
        "scroll-smooth w-full"
      )}>
        {[...Array(5)].map((_, index) => (
          <div key={index} 
            style={{ width: itemWidth }}
            className={cn(
            "h-10 rounded-md px-1 py-1 flex flex-col items-center justify-between",
            "animate-pulse",
            isDark 
              ? "bg-muted/40" 
              : "bg-muted/30"
          )}></div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn(
      "flex flex-nowrap gap-1.5 py-1 px-1",
      "w-full"
    )}>
      {tokens.map((token) => (
        <div 
          key={token.symbol}
          style={{ width: itemWidth }}
          className={cn(
            "h-10 rounded-md p-1 flex flex-col items-center justify-between",
            "border shadow-sm backdrop-blur-sm transition-all duration-150",
            token.priceChange24h >= 0
              ? isDark 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-emerald-500/10 border-emerald-500/20"
              : isDark
                ? "bg-rose-500/10 border-rose-500/20" 
                : "bg-rose-500/10 border-rose-500/20"
          )}
        >
          {/* Symbol + Price Change 上面一行 */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-semibold">{token.symbol}</span>
            <span className={cn(
              "text-[9px] font-semibold",
              token.priceChange24h >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {formatPriceChange(token.priceChange24h)}
            </span>
          </div>
          
          {/* Price 下面一行 */}
          <span className="text-[9px] font-medium truncate w-full text-center">
            {formatPrice(token.price)}
          </span>
        </div>
      ))}
    </div>
  )
}