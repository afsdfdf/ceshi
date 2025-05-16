'use client';

import { useState, useEffect, useCallback } from 'react';
import { TokenRanking } from '@/app/types/token';

// 备用数据，当API请求失败时使用
// 使用固定值而非随机值以确保服务器和客户端一致
const fallbackTokens: TokenRanking[] = [
  {
    "token": "0xa5957e0e2565dc93880da7be32abcbdf55788888",
    "chain": "bsc",
    "symbol": "ATM",
    "name": "ATM Token",
    "logo_url": "https://www.logofacade.com/token_icon_request/65ffb2a20a9e59af22dae8a5_1711256226.png",
    "current_price_usd": 0.000010993584854389429,
    "price_change_24h": -76.53,
    "tx_volume_u_24h": 13385053.845136339,
    "holders": 14304
  },
  {
    "token": "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc",
    "chain": "eth",
    "symbol": "BTC",
    "name": "Bitcoin",
    "logo_url": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "current_price_usd": 66000.5,
    "price_change_24h": 2.3,
    "tx_volume_u_24h": 25000000,
    "holders": 1000000
  }
];

// 添加固定的测试数据以确保服务器和客户端渲染一致
const additionalTokens = [
  {
    "token": "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "chain": "eth",
    "symbol": "USDT",
    "name": "Tether",
    "logo_url": "",
    "current_price_usd": 1.0,
    "price_change_24h": 0.1,
    "tx_volume_u_24h": 42000000,
    "holders": 5000000
  },
  {
    "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "chain": "eth",
    "symbol": "USDC",
    "name": "USD Coin",
    "logo_url": "",
    "current_price_usd": 0.999,
    "price_change_24h": -0.05,
    "tx_volume_u_24h": 31000000,
    "holders": 4500000
  },
  {
    "token": "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39",
    "chain": "eth",
    "symbol": "HEX",
    "name": "HEX",
    "logo_url": "",
    "current_price_usd": 0.0065,
    "price_change_24h": 3.2,
    "tx_volume_u_24h": 7000000,
    "holders": 300000
  },
  {
    "token": "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    "chain": "eth",
    "symbol": "BUSD",
    "name": "Binance USD",
    "logo_url": "",
    "current_price_usd": 0.998,
    "price_change_24h": -0.08,
    "tx_volume_u_24h": 12000000,
    "holders": 3000000
  },
  {
    "token": "0x0000000000085d4780b73119b644ae5ecd22b376",
    "chain": "eth",
    "symbol": "TUSD",
    "name": "TrueUSD",
    "logo_url": "",
    "current_price_usd": 0.997,
    "price_change_24h": -0.1,
    "tx_volume_u_24h": 8500000,
    "holders": 800000
  },
  {
    "token": "0x00000000000045166c45af0fc6e4cf31d9e14b9a",
    "chain": "bsc",
    "symbol": "BNB",
    "name": "BNB",
    "logo_url": "",
    "current_price_usd": 574.5,
    "price_change_24h": 1.8,
    "tx_volume_u_24h": 18000000,
    "holders": 2500000
  },
  {
    "token": "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    "chain": "eth",
    "symbol": "BAT",
    "name": "Basic Attention Token",
    "logo_url": "",
    "current_price_usd": 0.25,
    "price_change_24h": -2.5,
    "tx_volume_u_24h": 3500000,
    "holders": 450000
  }
];

// 将固定测试数据添加到备用数据中
fallbackTokens.push(...additionalTokens);

/**
 * 简化版按主题获取代币数据的Hook
 */
export function useTokensByTopic(topicId: string) {
  const [tokens, setTokens] = useState<TokenRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // 简化的获取函数
  const fetchTokens = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // 简单的fetch实现
    fetch(`/api/tokens?topic=${topicId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("API请求失败");
        }
        return response.json();
      })
      .then(data => {
        if (data && data.success && data.data && Array.isArray(data.data.tokens)) {
          setTokens(data.data.tokens);
          setLastUpdated(new Date());
          setUsingFallback(false);
        } else {
          throw new Error("数据格式无效");
        }
      })
      .catch(err => {
        console.error("获取代币数据失败:", err);
        setError(err.message || "未知错误");
        setTokens(fallbackTokens);
        setUsingFallback(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [topicId]);
  
  // 初始化和主题变更时加载数据
  useEffect(() => {
    fetchTokens();
  }, [topicId, fetchTokens]);
  
  // 刷新函数
  const refresh = () => {
    fetchTokens();
  };
  
  return {
    tokens: tokens.length > 0 ? tokens : fallbackTokens,
    isLoading,
    error,
    refresh,
    lastUpdated,
    usingFallback
  };
} 