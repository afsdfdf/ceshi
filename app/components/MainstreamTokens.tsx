"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface XaiToken {
  symbol: string
  price: number
  priceChange24h: number
  logo_url: string
  link: string
  description?: string
  source?: string
  data_source?: string
}

interface MainstreamTokensProps {
  darkMode: boolean
}

export function MainstreamTokens({ darkMode }: MainstreamTokensProps) {
  const router = useRouter()
  const [token, setToken] = useState<XaiToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // Ensure component is mounted before rendering to prevent hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 处理代币点击
  const handleTokenClick = () => {
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
      console.log('[MainstreamTokens] Received data:', data);
      
      if (data && data.xai && data.xai.current_price !== undefined) {
        setToken({
          symbol: 'XAI',
          price: data.xai.current_price || 0.00005238,
          priceChange24h: data.xai.price_change_percentage_24h || 21.38,
          logo_url: data.xai.image || 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png',
          link: '/token/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487',
          description: 'XAI 是新一代去中心化 AI 生态系统的原生代币，赋能智能经济。',
          source: data.source,
          data_source: data.data_source
        });
        setError(false);
        setRetryCount(0);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (err) {
      console.error('[MainstreamTokens] Error fetching XAI data:', err);
      setError(true);
      
      // 如果是首次加载失败，设置默认数据
      if (!token && retryCount === 0) {
        setToken({
          symbol: 'XAI',
          price: 0.00005238,
          priceChange24h: 21.38,
          logo_url: 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png',
          link: '/token/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487',
          description: 'XAI 是新一代去中心化 AI 生态系统的原生代币，赋能智能经济。',
          source: 'fallback',
          data_source: 'static'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 重试机制
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchXaiData();
    }
  };
  
  // 获取XAI数据
  useEffect(() => {
    if (!mounted) return;
    
    fetchXaiData();
    
    // 定期刷新数据（每5分钟）
    const interval = setInterval(() => {
      fetchXaiData();
    }, 5 * 60 * 1000);
    
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

  // 格式化数据源显示
  function getDataSourceDisplay(source?: string, data_source?: string) {
    if (data_source === 'dexscreener') return '🔄 实时';
    if (data_source === 'ave_api') return '📊 AVE';
    if (data_source === 'coingecko') return '🦎 CG';
    if (source === 'fallback_cache') return '💾 缓存';
    if (source === 'static_fallback') return '📋 静态';
    return '🔄 实时';
  }

  // Don't render anything until component is mounted
  if (!mounted) {
    return null;
  }

  // 加载状态UI
  if (loading && !token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 8px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          height: '65px',
          borderRadius: '10px',
          background: darkMode ? '#222' : '#f7f7f7',
          animation: 'pulse 1.5s infinite ease-in-out',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <style jsx global>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 0.8; }
              100% { opacity: 0.6; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // 错误状态UI（仅在没有数据时显示）
  if (error && !token && retryCount >= 3) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 8px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          padding: '10px',
          borderRadius: '10px',
          textAlign: 'center',
          color: darkMode ? '#f88' : '#c44',
          background: darkMode ? '#331111' : '#fff8f8',
          border: '1px solid ' + (darkMode ? '#633' : '#fcc'),
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div>无法获取XAI数据，请稍后重试</div>
          <button 
            onClick={handleRetry}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid ' + (darkMode ? '#f88' : '#c44'),
              borderRadius: '4px',
              color: darkMode ? '#f88' : '#c44',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 如果没有token数据，不渲染任何内容
  if (!token) {
    return null;
  }

  // 正常状态UI - 更紧凑的布局
  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: '8px 4px'}}>
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '6px 10px',
          border: '1px solid ' + (darkMode ? '#333' : '#eee'),
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          background: darkMode ? '#111' : '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,' + (darkMode ? '0.15' : '0.06') + ')',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          marginBottom: '2px',
          // 如果是静态数据，添加提示样式
          ...(token.source === 'static_fallback' && {
            border: '1px solid ' + (darkMode ? '#664400' : '#ffcc00'),
            background: darkMode ? '#221100' : '#fffdf0'
          })
        }}
        onClick={handleTokenClick}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,' + (darkMode ? '0.22' : '0.10') + ')';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,' + (darkMode ? '0.15' : '0.06') + ')';
        }}
      >
        {/* 左侧：图标和价格变化 */}
        <div style={{display: 'flex', alignItems: 'center'}}>
          <img
            src={token.logo_url}
            alt={token.symbol}
            style={{
              width: 28, 
              height: 28, 
              borderRadius: '50%', 
              marginRight: 8, 
              objectFit: 'cover',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
            }} />
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span style={{
                fontSize: 16, 
                fontWeight: 'bold', 
                color: darkMode ? '#fff' : '#333'
              }}>{token.symbol}</span>
              <div style={{
                marginLeft: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: '3px',
                backgroundColor: token.priceChange24h >= 0 ? 
                  (darkMode ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.09)') : 
                  (darkMode ? 'rgba(239, 68, 68, 0.18)' : 'rgba(239, 68, 68, 0.09)'),
                color: token.priceChange24h >= 0 ? '#10b981' : '#ef4444',
              }}>
                {formatChange(token.priceChange24h)}
              </div>
            </div>
            <div style={{
              fontSize: 13, 
              fontWeight: 500,
              color: darkMode ? '#eee' : '#222'
            }}>
              {formatPrice(token.price)}
            </div>
          </div>
        </div>

        {/* 中间：数据源指示器 */}
        <div style={{
          marginLeft: 'auto',
          marginRight: '8px',
          fontSize: 10,
          color: darkMode ? '#888' : '#999',
          display: 'flex',
          alignItems: 'center'
        }}>
          {getDataSourceDisplay(token.source, token.data_source)}
        </div>

        {/* 右侧：简介 */}
        <div style={{
          fontSize: 12, 
          color: darkMode ? '#aaa' : '#666', 
          maxWidth: '45%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{marginRight: 4, fontSize: 13}}>🤖</span>
          <span>新一代去中心化 AI 生态系统代币</span>
        </div>
      </div>
      
      {/* 刷新指示器 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: darkMode ? '#666' : '#ccc',
          animation: 'pulse 1s infinite'
        }} />
      )}
    </div>
  );
}