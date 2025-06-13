/**
 * 统一日志管理系统
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  context?: LogContext;
  timestamp: number;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private minLevel = this.isDev ? 'debug' : 'warn';
  
  debug(message: string, data?: any, context?: LogContext): void {
    if (this.isDev) {
      this.log('debug', message, data, context);
    }
  }
  
  info(message: string, data?: any, context?: LogContext): void {
    this.log('info', message, data, context);
  }
  
  warn(message: string, data?: any, context?: LogContext): void {
    this.log('warn', message, data, context);
  }
  
  error(message: string, error?: Error | any, context?: LogContext): void {
    this.log('error', message, error, context);
  }
  
  private log(level: LogLevel, message: string, data?: any, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    let logMessage = prefix;
    
    // 添加组件和动作信息
    if (context?.component) {
      logMessage += ` [${context.component}]`;
    }
    if (context?.action) {
      logMessage += ` [${context.action}]`;
    }
    
    logMessage += ` ${message}`;
    
    // 根据级别选择控制台方法
    const consoleMethod = level === 'debug' ? 'log' : level;
    
    // 输出日志
    if (data !== undefined) {
      console[consoleMethod](logMessage, data);
    } else {
      console[consoleMethod](logMessage);
    }
    
    // 生产环境下的错误可以发送到监控服务
    if (!this.isDev && level === 'error') {
      this.sendToMonitoring({ level, message, data, context, timestamp: Date.now() });
    }
  }
  
  private sendToMonitoring(entry: LogEntry): void {
    // 这里可以集成 Sentry、LogRocket 等监控服务
    // 暂时只在控制台输出
    if (typeof window !== 'undefined') {
      // 客户端错误上报
      // 可以发送到 /api/error-report 或第三方服务
    }
  }
  
  // 性能日志
  performance(label: string, fn: () => any): any {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.debug(`Performance: ${label}`, { duration: `${(end - start).toFixed(2)}ms` });
    
    return result;
  }
  
  // 异步性能日志
  async performanceAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      this.debug(`Performance: ${label}`, { duration: `${(end - start).toFixed(2)}ms` });
      return result;
    } catch (error) {
      const end = performance.now();
      this.error(`Performance Error: ${label}`, error, { duration: `${(end - start).toFixed(2)}ms` });
      throw error;
    }
  }
}

// 导出单例实例
export const logger = new Logger();

// 便捷函数
export const log = {
  debug: (message: string, data?: any, context?: LogContext) => logger.debug(message, data, context),
  info: (message: string, data?: any, context?: LogContext) => logger.info(message, data, context),
  warn: (message: string, data?: any, context?: LogContext) => logger.warn(message, data, context),
  error: (message: string, error?: Error | any, context?: LogContext) => logger.error(message, error, context),
  performance: (label: string, fn: () => any) => logger.performance(label, fn),
  performanceAsync: <T>(label: string, fn: () => Promise<T>) => logger.performanceAsync(label, fn),
}; 