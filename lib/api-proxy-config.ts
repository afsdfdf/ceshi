// API代理配置
export const API_PROXY_CONFIG = {
  // 头像服务代理
  avatar: {
    original: 'https://api.dicebear.com/7.x/pixel-art/svg',
    proxy: '/api/avatar-proxy',
    timeout: 10000,
    cacheTime: 24 * 60 * 60 * 1000, // 24小时
  },
  
  // 价格数据API
  prices: {
    ave: {
      original: 'https://prod.ave-api.com/v2/tokens/price',
      timeout: 10000,
      retryDelay: 60 * 1000, // 1分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      fallbackCacheTime: 60 * 60 * 1000, // 1小时
    },
    oneInch: {
      original: 'https://api.1inch.io/v5.0/56/tokens',
      timeout: 10000,
      retryDelay: 30 * 1000, // 30秒
    }
  }
};

// 默认的用户代理字符串
export const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 错误重试配置
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒基础延迟
  maxDelay: 30000, // 最大30秒延迟
  exponentialBackoff: true,
};

// 代理请求的通用配置
export function getProxyRequestConfig(timeout: number = 10000) {
  return {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
    },
    signal: AbortSignal.timeout(timeout),
  };
} 