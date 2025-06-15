"use client"

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'minimal' | 'card'
}

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  isRetrying = false, 
  className,
  showIcon = true,
  variant = 'default'
}: ErrorDisplayProps) {
  
  // 根据错误类型选择图标
  const getErrorIcon = () => {
    if (error.includes('网络') || error.includes('连接')) {
      return <WifiOff className="w-5 h-5 text-red-500" />
    }
    if (error.includes('服务') || error.includes('不可用')) {
      return <Wifi className="w-5 h-5 text-orange-500" />
    }
    return <AlertCircle className="w-5 h-5 text-red-500" />
  }

  // 根据错误类型提供建议
  const getSuggestion = () => {
    if (error.includes('请求过于频繁')) {
      return '请等待一分钟后再试'
    }
    if (error.includes('服务暂时不可用')) {
      return '我们正在努力修复，请稍后重试'
    }
    if (error.includes('网络')) {
      return '请检查网络连接'
    }
    return '请稍后重试或联系客服'
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        {showIcon && getErrorIcon()}
        <span>{error}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-6 px-2 text-xs"
          >
            {isRetrying ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              '重试'
            )}
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-lg border border-red-200 bg-red-50 p-4",
        "dark:border-red-800 dark:bg-red-950/20",
        className
      )}>
        <div className="flex items-start gap-3">
          {showIcon && getErrorIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              出现了一些问题
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {getSuggestion()}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isRetrying}
                className="mt-3 h-8 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                    重试中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-2" />
                    重试
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // default variant
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 px-4 text-center",
      className
    )}>
      {showIcon && (
        <div className="mb-3">
          {getErrorIcon()}
        </div>
      )}
      <h3 className="text-sm font-medium text-foreground mb-1">
        出现了一些问题
      </h3>
      <p className="text-sm text-muted-foreground mb-2">
        {error}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {getSuggestion()}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="h-8"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              重试中...
            </>
          ) : (
            <>
              <RefreshCw className="w-3 h-3 mr-2" />
              重试
            </>
          )}
        </Button>
      )}
    </div>
  )
} 