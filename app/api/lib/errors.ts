/**
 * API错误处理模块
 */
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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
  logger.error('API错误:', error, { component: 'ErrorHandler', action: 'buildErrorResponse' });
  
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
    logger.error('API处理器错误:', error, { component: 'ErrorHandler', action: 'withErrorHandling' });
    
    // 如果提供了回退处理程序，尝试使用它
    if (fallbackHandler) {
      try {
        const fallbackData = await fallbackHandler();
        logger.info('使用回退数据', { component: 'ErrorHandler', action: 'withErrorHandling' });
        
        // 确保返回NextResponse对象
        return NextResponse.json({
          ...fallbackData,
          fallback: true,
          fallback_reason: error instanceof Error ? error.message : '未知错误'
        });
      } catch (fallbackError) {
        logger.error('执行回退处理程序时出错:', fallbackError, { component: 'ErrorHandler', action: 'withErrorHandling' });
      }
    }
    
    throw error;
  }
}

export function handleApiError(error: unknown, context = ''): Response {
  if (error instanceof ApiError) {
    logger.warn(`API错误: ${error.message}`, { statusCode: error.statusCode, context }, { component: 'ErrorHandler', action: 'handleApiError' });
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        code: error.statusCode 
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof TypeError) {
    logger.error('类型错误:', error, { component: 'ErrorHandler', action: 'handleApiError' });
    return NextResponse.json(
      { 
        success: false, 
        error: '请求参数类型错误' 
      },
      { status: 400 }
    );
  }

  if (error instanceof SyntaxError) {
    logger.error('语法错误:', error, { component: 'ErrorHandler', action: 'handleApiError' });
    return NextResponse.json(
      { 
        success: false, 
        error: '请求格式错误' 
      },
      { status: 400 }
    );
  }

  // 未知错误
  logger.error('未知API错误:', error, { component: 'ErrorHandler', action: 'handleApiError' });
  return NextResponse.json(
    { 
      success: false, 
      error: '服务器内部错误' 
    },
    { status: 500 }
  );
} 