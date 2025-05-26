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
}

interface MainstreamTokensProps {
  darkMode: boolean
}

export function MainstreamTokens({ darkMode }: MainstreamTokensProps) {
  const router = useRouter()
  const [token, setToken] = useState<XaiToken | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // 处理代币点击
  const handleTokenClick = () => {
    if (token?.link) {
      router.push(token.link);
    }
  };
  
  // 获取XAI数据
  useEffect(() => {
    setLoading(true)
    fetch('/api/mainstream-prices')
      .then(res => res.json())
      .then(data => {
        if (data && data.xai) {
          setToken({
            symbol: 'XAI',
            price: data.xai.current_price || 0.00005238,
            priceChange24h: data.xai.price_change_percentage_24h || 21.38,
            logo_url: data.xai.image || 'https://assets.coingecko.com/coins/images/33413/large/xai-logo-256px.png',
            link: '/token/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487',
            description: 'XAI 是新一代去中心化 AI 生态系统的原生代币，赋能智能经济。'
          });
          setError(false);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
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

  // 加载状态UI
  if (loading) {
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

  // 错误状态UI
  if (error || !token) {
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
          无法获取XAI数据，请稍后重试
        </div>
      </div>
    );
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

        {/* 右侧：简介 */}
        <div style={{
          fontSize: 12, 
          color: darkMode ? '#aaa' : '#666', 
          marginLeft: 'auto',
          maxWidth: '45%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{marginRight: 4, fontSize: 13}}>🤖</span>
          <span>新一代去中心化 AI 生态系统代币</span>
        </div>
      </div>
    </div>
  );
}