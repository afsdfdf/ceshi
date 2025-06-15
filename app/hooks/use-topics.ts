'use client';

import { useState, useEffect, useCallback } from 'react';
import { RankTopic, TopicsResponse, ApiResponse } from '@/app/types/token';

/**
 * 优化版主题获取Hook
 * 去除fallback数据，改进错误处理和重试机制
 */
export function useTopics() {
  const [topics, setTopics] = useState<RankTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTopics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      const response = await fetch('/api/tokens?topic=topics', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json() as ApiResponse<TopicsResponse>;
      
      if (!result.success) {
        throw new Error(result.error || 'API返回失败状态');
      }
      
      if (result.data && result.data.topics && Array.isArray(result.data.topics)) {
        setTopics(result.data.topics);
        setRetryCount(0); // 重置重试计数
        console.log(`成功获取${result.data.topics.length}个主题`);
      } else {
        throw new Error('数据格式无效');
      }
    } catch (error) {
      console.error("获取主题失败:", error);
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError(errorMessage);
      
      // 自动重试逻辑
      if (retryCount < 2 && !errorMessage.includes('503')) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 指数退避，最大5秒
        console.log(`将在 ${retryDelay}ms 后重试获取主题 (${retryCount + 1}/2)`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchTopics();
        }, retryDelay);
      } else {
        console.error(`已达到最大重试次数或服务不可用，停止重试`);
        setTopics([]); // 清空数据，不使用fallback
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    setRetryCount(0); // 重置重试计数
    fetchTopics();
  }, []); // 移除fetchTopics依赖，避免无限循环

  return {
    topics,
    isLoading,
    error,
    refresh: useCallback(() => {
      setRetryCount(0);
      fetchTopics();
    }, [fetchTopics])
  };
} 