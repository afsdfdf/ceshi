/**
 * API 响应类型定义
 */

// 基础API响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
  fallback?: boolean;
  fallback_reason?: string;
  stale?: boolean;
  stale_reason?: string;
}

// 分页响应
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 错误响应
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  status: number;
  timestamp: number;
}

// 请求配置
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  shouldRetryOnServerError?: boolean;
}

// API 错误类型
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
} 