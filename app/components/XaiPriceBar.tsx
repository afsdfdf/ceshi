"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface XaiToken {
  symbol: string
  price: number
  priceChange24h: number
  link: string
  source?: string
  data_source?: string
}

interface XaiPriceBarProps {
  darkMode: boolean
}

export function XaiPriceBar({ darkMode }: XaiPriceBarProps) {
  const router = useRouter()
  const [token, setToken] = useState<XaiToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 处理点击
  const handleClick = () => {
    if (token?.link) {
      router.push(token.link);
    }
  };
  
  // 获取XAI数据
  const fetchXaiData = async () => {
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
      
      if (data && data.xai && data.xai.current_price !== undefined) {
        setToken({
          symbol: 'XAI',
          price: data.xai.current_price,
          priceChange24h: data.xai.price_change_percentage_24h,
          link: '/token/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487',
          source: data.source,
          data_source: data.data_source
        });
        setError(false);
        setRetryCount(0); // 重置重试计数
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('[XaiPriceBar] Error fetching XAI data:', err);
      setError(true);
      
      // 自动重试逻辑
      if (retryCount < 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // 指数退避，最大10秒
        console.log(`[XaiPriceBar] 将在 ${retryDelay}ms 后重试 (${retryCount + 1}/3)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchXaiData();
        }, retryDelay);
      } else {
        console.error('[XaiPriceBar] 已达到最大重试次数，停止重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 获取XAI数据
  useEffect(() => {
    if (!mounted) return;
    
    // 只在首次挂载时获取数据
    fetchXaiData();
    
    // 定期刷新数据（每10分钟）
    const interval = setInterval(() => {
      setRetryCount(0); // 重置重试计数
      fetchXaiData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [mounted]); // 只依赖mounted，避免重试时重复设置定时器
  
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
  if (!token && !loading) {
    return null;
  }

  // 如果有token数据，显示价格条
  if (token) {
    return (
      <div 
        className={`
          w-full h-8 px-4 flex items-center justify-center cursor-pointer
          transition-all duration-300 hover:scale-[1.02]
          bg-gradient-to-r from-xai-purple/10 via-xai-cyan/10 to-xai-green/10
          hover:from-xai-purple/20 hover:via-xai-cyan/20 hover:to-xai-green/20
          border-b border-border/30
        `}
        onClick={handleClick}
      >
        {/* XAI价格和涨幅 - 居中显示 */}
        <div className="flex items-center space-x-4 text-sm">
          <span className={`
            font-bold text-base gradient-text
          `}>
            XAI
          </span>
          <span className={`
            font-semibold text-base
            ${darkMode ? 'text-white' : 'text-gray-900'}
          `}>
            {formatPrice(token.price)}
          </span>
          <span 
            className={`
              font-bold px-3 py-1 rounded-full text-sm
              transition-all duration-200 hover:scale-105
              ${token.priceChange24h >= 0 
                ? 'text-xai-green bg-xai-green/20 border border-xai-green/30' 
                : 'text-red-500 bg-red-500/20 border border-red-500/30'
              }
            `}
          >
            {formatChange(token.priceChange24h)}
          </span>
        </div>
      </div>
    );
  }

  // 如果正在加载，显示加载状态
  return (
    <div className="w-full h-8 px-4 flex items-center justify-center bg-gradient-to-r from-xai-purple/5 via-xai-cyan/5 to-xai-green/5 border-b border-border/30">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-pulse"></div>
        <div className="w-16 h-4 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded animate-pulse"></div>
        <div className="w-12 h-6 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
} 