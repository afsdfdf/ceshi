/**
 * API错误处理模块
 */
import { NextResponse } from 'next/server';

// API错误类
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// 构建错误响应
export function buildErrorResponse(error: any) {
  console.error('API错误:', error);
  
  if (error instanceof ApiError) {
    return {
      success: false,
      error: 'API请求失败',
      message: error.message,
      status: error.statusCode,
      timestamp: Date.now()
    };
  }
  
  return {
    success: false,
    error: '内部服务器错误',
    message: error instanceof Error ? error.message : '未知错误',
    status: 500,
    timestamp: Date.now()
  };
}

// API请求错误处理包装器
export async function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
  fallbackHandler?: () => Promise<T>
): Promise<NextResponse<T>> {
  try {
    return await handler();
  } catch (error) {
    console.error('API处理器错误:', error);
    
    // 如果提供了回退处理程序，尝试使用它
    if (fallbackHandler) {
      try {
        const fallbackData = await fallbackHandler();
        console.log('使用回退数据');
        
        // 确保返回NextResponse对象
        return NextResponse.json({
          ...fallbackData,
          fallback: true,
          fallback_reason: error instanceof Error ? error.message : '未知错误'
        });
      } catch (fallbackError) {
        console.error('执行回退处理程序时出错:', fallbackError);
      }
    }
    
    throw error;
  }
} 