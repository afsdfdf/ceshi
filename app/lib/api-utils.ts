/**
 * API工具函数 - 提供通用请求处理、错误处理和超时机制
 */

import { logger } from '@/lib/logger';

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
  shouldRetryOnServerError?: boolean;
  next?: { revalidate?: number };
}

/**
 * API请求错误类
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * 通用API请求函数
 * @param endpoint API端点
 * @param options 请求选项
 * @returns 请求响应数据
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { 
    timeout = 30000, 
    retries = 2, 
    retryDelay = 1000,
    retryCondition = (error: ApiError) => error.status >= 500,
    shouldRetryOnServerError = true,
    ...fetchOptions 
  } = options;

  // 构建完整的URL
  const url = endpoint.startsWith('http') ? endpoint : `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`;
  
  logger.debug('API请求URL:', url, { component: 'ApiUtils', action: 'apiRequest' });

  // 重试逻辑
  for (let currentAttempt = 0; currentAttempt <= retries; currentAttempt++) {
    try {
      // 创建控制器用于超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // 发起请求
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      // 清除超时
      clearTimeout(timeoutId);

      // 记录响应时间（可选）
      const requestDuration = Date.now() - Date.now();
      if (requestDuration > 5000) {
        logger.warn(`慢请求: ${url} 耗时 ${requestDuration}ms`, { component: 'ApiUtils', action: 'apiRequest' });
      }

      // 解析响应
      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        logger.error('JSON解析错误:', e, { component: 'ApiUtils', action: 'apiRequest' });
        throw new ApiError(
          'Invalid JSON response',
          response.status,
          response.statusText
        );
      }

      // 检查HTTP状态
      if (!response.ok) {
        logger.debug(`API响应状态: ${response.status} ${response.statusText}`, { component: 'ApiUtils', action: 'apiRequest' });
        
        // 尝试从响应中获取错误信息
        const errorMessage = data?.error || data?.message || `HTTP ${response.status} ${response.statusText}`;
        logger.error(`API错误响应数据:`, data, { component: 'ApiUtils', action: 'apiRequest' });
        
        const apiError = new ApiError(
          errorMessage,
          response.status,
          response.statusText,
          data
        );

        // 是否重试
        if (shouldRetryOnServerError && retryCondition(apiError) && currentAttempt < retries) {
          logger.debug(`API请求重试条件满足`, { component: 'ApiUtils', action: 'apiRequest' });
          continue;
        }

        throw apiError;
      }

      return data;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.error(`API请求超时: ${endpoint}`, { component: 'ApiUtils', action: 'apiRequest' });
        throw new ApiError('Request timeout', 408, 'Request Timeout');
      }

      logger.error(`API请求失败 (尝试 ${currentAttempt + 1}/${retries + 1}):`, error, { component: 'ApiUtils', action: 'apiRequest' });

      // 如果是最后一次尝试，抛出错误
      if (currentAttempt === retries) {
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError(
          error instanceof Error ? error.message : 'Unknown error',
          0,
          'Network Error'
        );
      }

      // 等待后重试
      if (currentAttempt < retries) {
        const delay = retryDelay * Math.pow(2, currentAttempt); // 指数退避
        logger.debug(`请求失败，${delay}ms后重试 (${currentAttempt + 1}/${retries + 1})...`, { component: 'ApiUtils', action: 'apiRequest' });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 理论上不会到达这里
  throw new ApiError('Max retries exceeded', 0, 'Network Error');
}

/**
 * 用户友好的错误消息映射
 */
export const errorMessages: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请登录',
  403: '无访问权限',
  404: '未找到请求的资源',
  408: '请求超时，请稍后再试',
  429: '请求过于频繁，请稍后再试',
  500: '服务器错误，请稍后再试',
  502: '网关错误，请稍后再试',
  503: '服务不可用，请稍后再试',
  504: '网关超时，请稍后再试'
};

/**
 * 获取用户友好的错误消息
 * @param error 错误对象
 * @returns 用户友好的错误消息
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return errorMessages[error.status] || error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return '网络连接错误，请检查您的网络连接';
    }
    return error.message;
  }
  
  return '发生未知错误，请稍后再试';
}

/**
 * 构建带参数的URL
 * @param baseUrl 基础URL
 * @param params 参数对象
 * @returns 完整URL
 */
export function buildUrl(baseUrl: string, params: Record<string, string | number | boolean | undefined>): string {
  // 检查是否在服务器端
  const isServer = typeof window === 'undefined';
  
  // 创建URL对象
  let url: URL;
  
  if (isServer) {
    // 服务器端，使用绝对URL
    if (baseUrl.startsWith('/')) {
      // 在服务器端，使用环境变量或默认值作为基础URL
      const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      url = new URL(baseUrl, baseAppUrl);
    } else {
      url = new URL(baseUrl);
    }
  } else {
    // 客户端，使用window.location.origin
    url = new URL(baseUrl, window.location.origin);
  }
  
  // 添加参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  
  // 在服务器端，返回完整URL以保证访问正确的端点
  return url.toString();
} 