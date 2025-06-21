"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface MainstreamToken {
  symbol: string
  price: number
  priceChange24h: number
  link: string
  source?: string
  data_source?: string
}

interface MainstreamPriceBarProps {
  darkMode: boolean
}

export function XaiPriceBar({ darkMode }: MainstreamPriceBarProps) {
  const router = useRouter()
  const [tokens, setTokens] = useState<MainstreamToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 处理点击
  const handleClick = (token: MainstreamToken) => {
    if (token?.link) {
      router.push(token.link);
    }
  };
  
  // 获取主流币数据
  const fetchMainstreamData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/mainstream-prices', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 处理主流币数据
      const mainstreamTokens: MainstreamToken[] = [];
      
      if (data.bitcoin) {
        mainstreamTokens.push({
          symbol: 'BTC',
          price: data.bitcoin.current_price,
          priceChange24h: data.bitcoin.price_change_percentage_24h,
          link: '/token/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
          source: data.source,
          data_source: data.data_source
        });
      }
      
      if (data.ethereum) {
        mainstreamTokens.push({
          symbol: 'ETH',
          price: data.ethereum.current_price,
          priceChange24h: data.ethereum.price_change_percentage_24h,
          link: '/token/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          source: data.source,
          data_source: data.data_source
        });
      }
      
      if (data.binancecoin) {
        mainstreamTokens.push({
          symbol: 'BNB',
          price: data.binancecoin.current_price,
          priceChange24h: data.binancecoin.price_change_percentage_24h,
          link: '/token/bsc/0xbb4cdb9cbd36b01bd1cbaef2af88c6b9043a4f6f',
          source: data.source,
          data_source: data.data_source
        });
      }
      
      setTokens(mainstreamTokens);
      setError(false);
      setRetryCount(0);
    } catch (err) {
      console.error('[MainstreamPriceBar] Error fetching mainstream data:', err);
      setError(true);
      
      // 自动重试逻辑
      if (retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`[MainstreamPriceBar] 将在 ${retryDelay}ms 后重试 (${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchMainstreamData();
        }, retryDelay);
      } else {
        console.error('[MainstreamPriceBar] 已达到最大重试次数，停止重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 获取主流币数据
  useEffect(() => {
    if (!mounted) return;
    
    fetchMainstreamData();
    
    // 定期刷新数据（每10分钟）
    const interval = setInterval(() => {
      setRetryCount(0);
      fetchMainstreamData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [mounted]);
  
  // 格式化价格
  function formatPrice(price: number): string {
    if (price >= 10000) return "$" + (price / 1000).toFixed(1) + "K";
    if (price >= 1000) return "$" + price.toFixed(0);
    if (price >= 1) return "$" + price.toFixed(2);
    if (price >= 0.01) return "$" + price.toFixed(4);
    return "$" + price.toFixed(8).substring(0, 10);
  }
  
  // 格式化变化百分比
  function formatChange(change: number): string {
    return (change >= 0 ? "+" : "") + change.toFixed(2) + "%";
  }

  // Don't render anything until component is mounted
  if (!mounted) {
    return null;
  }

  // 如果没有token数据且不在加载中，不渲染任何内容
  if (!tokens.length && !loading) {
    return null;
  }

  // 如果有token数据，显示价格条
  if (tokens.length > 0) {
    return (
      <div className="w-full h-8 px-4 flex items-center justify-center space-x-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-border/30">
        {tokens.map((token, index) => (
          <div 
            key={token.symbol}
            className="flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => handleClick(token)}
          >
            <span className="font-bold text-sm text-gray-800 dark:text-white">
              {token.symbol}
            </span>
            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
              {formatPrice(token.price)}
            </span>
            <span 
              className={`
                font-bold px-2 py-0.5 rounded-full text-xs
                transition-all duration-200 hover:scale-105
                ${token.priceChange24h >= 0 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700' 
                  : 'text-red-600 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
                }
              `}
            >
              {formatChange(token.priceChange24h)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  return (
    <div className="w-full h-8 px-4 flex items-center justify-center bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-b border-border/30">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-pulse"></div>
        <div className="w-12 h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
} 