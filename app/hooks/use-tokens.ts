'use client';

import { useState, useEffect, useCallback } from 'react';
import { TokenRanking } from '@/app/types/token';

/**
 * 优化版按主题获取代币数据的Hook
 * 去除模拟数据，改进错误处理和重试机制
 */
export function useTokensByTopic(topicId: string) {
  const [tokens, setTokens] = useState<TokenRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // 获取代币数据的函数
  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 增加到15秒超时
      
      const response = await fetch(`/api/tokens?topic=${topicId}`, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      // 处理不同的HTTP状态码
      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('服务暂时不可用，请稍后重试');
        } else if (response.status === 429) {
          throw new Error('请求过于频繁，请稍后重试');
        } else if (response.status >= 500) {
          throw new Error('服务器错误，请稍后重试');
        } else if (response.status === 404) {
          throw new Error('请求的资源不存在');
        } else {
          throw new Error(`请求失败 (${response.status})`);
        }
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API返回失败状态');
      }
      
      if (data.data && Array.isArray(data.data.tokens)) {
        setTokens(data.data.tokens);
        setLastUpdated(new Date());
        setUsingFallback(false);
        setRetryCount(0); // 重置重试计数
        console.log(`成功获取${data.data.tokens.length}个代币数据`);
      } else {
        throw new Error('数据格式无效');
      }
    } catch (err) {
      console.error(`获取代币数据失败 (topic: ${topicId}):`, err);
      
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      
      // 根据错误类型决定是否重试
      const shouldRetry = !errorMessage.includes('服务暂时不可用') && 
                         !errorMessage.includes('请求过于频繁') && 
                         !errorMessage.includes('服务器错误') &&
                         retryCount < 2;
      
      if (shouldRetry) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000); // 指数退避，最大8秒
        console.log(`将在 ${retryDelay}ms 后重试 (${retryCount + 1}/2)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchTokens();
        }, retryDelay);
        
        // 在重试期间显示友好的错误信息
        setError(`正在重试... (${retryCount + 1}/2)`);
      } else {
        // 设置最终错误信息
        if (errorMessage.includes('服务暂时不可用')) {
          setError('数据服务暂时不可用，请稍后刷新页面重试');
        } else if (errorMessage.includes('请求过于频繁')) {
          setError('请求过于频繁，请等待一分钟后重试');
        } else if (errorMessage.includes('服务器错误')) {
          setError('服务器暂时出现问题，请稍后重试');
        } else {
          setError(errorMessage);
        }
        
        console.error(`已达到最大重试次数或遇到不可重试的错误，停止重试`);
        setTokens([]); // 清空数据
        setUsingFallback(false);
      }
    } finally {
      // 只有在不需要重试时才设置loading为false
      if (retryCount >= 2 || error?.includes('服务暂时不可用') || error?.includes('请求过于频繁')) {
        setIsLoading(false);
      }
    }
  }, [topicId, retryCount]);
  
  // 初始化和主题变更时加载数据
  useEffect(() => {
    setRetryCount(0); // 重置重试计数
    setError(null); // 清除之前的错误
    fetchTokens();
  }, [topicId]); // 移除fetchTokens依赖，避免无限循环
  
  // 手动刷新函数
  const refresh = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchTokens();
  }, [fetchTokens]);
  
  return {
    tokens,
    isLoading,
    error,
    refresh,
    lastUpdated,
    usingFallback
  };
} 