"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { init, dispose, Chart, KLineData } from 'klinecharts'
import { DARK_THEME, LIGHT_THEME } from './themes'
import { getPriceDecimalPlaces, updateCandleWidthForInterval, setupIndicators } from './chartUtils'
import { logger } from '@/lib/logger'
import { Loader2, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChartWrapperProps {
  darkMode: boolean
  tokenAddress?: string
  tokenChain?: string
  interval?: string
  subIndicator?: string
  onDataLoaded?: () => void
}

export default function ChartWrapper({ 
  darkMode, 
  tokenAddress = "0xtoken", 
  tokenChain = "eth",
  interval = "1h",
  subIndicator = "VOL",
  onDataLoaded
}: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [klineData, setKlineData] = useState<KLineData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // 数据点配置优化
  const pointsConfig = useMemo(() => ({
    '1m': 288,   // 4.8小时数据
    '5m': 288,   // 24小时数据
    '15m': 192,  // 48小时数据
    '1h': 168,   // 7天数据
    '4h': 168,   // 28天数据
    '1d': 120,   // 4个月数据
    '1w': 104    // 2年数据
  }), []);

  // 获取K线数据的优化版本
  const fetchKlineData = useCallback(async () => {
    if (!tokenAddress || !tokenChain || tokenAddress === "0xtoken") {
      logger.info('缺少地址或链信息', { tokenAddress, tokenChain }, { component: 'ChartWrapper', action: 'fetchKlineData' });
      setError("请选择有效的代币进行查看");
      return;
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const points = pointsConfig[interval as keyof typeof pointsConfig] || 120;
      
        logger.info('请求K线数据', { tokenAddress, tokenChain, interval, points }, { component: 'ChartWrapper', action: 'fetchKlineData' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
      
      const response = await fetch(
        `/api/token-kline?address=${encodeURIComponent(tokenAddress)}&chain=${encodeURIComponent(tokenChain)}&interval=${interval}&limit=${points}`, 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
        
        if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
      if (data?.success && data?.klines?.length > 0) {
          logger.info('成功获取K线数据', { count: data.klines.length }, { component: 'ChartWrapper', action: 'fetchKlineData' });
          
        // 数据转换和验证
        const formattedData: KLineData[] = data.klines
          .map((item: any) => {
            const timestamp = item.timestamp < 10000000000 ? item.timestamp * 1000 : item.timestamp;
            const open = parseFloat(item.open);
            const high = parseFloat(item.high);
            const low = parseFloat(item.low);
            const close = parseFloat(item.close);
            const volume = parseFloat(item.volume || 0);
            
            // 数据验证
            if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || high < low) {
              return null;
            }
            
            return { timestamp, open, high, low, close, volume };
          })
          .filter(Boolean) as KLineData[];
        
        if (formattedData.length === 0) {
          throw new Error("没有有效的K线数据");
        }
        
        // 按时间排序
        formattedData.sort((a, b) => a.timestamp - b.timestamp);
          
          // 分析价格范围
            const prices = formattedData.map(item => item.close);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange({ min: minPrice, max: maxPrice });
          
          setKlineData(formattedData);
        setLastUpdate(new Date());
        setRetryCount(0);
          
          // 更新图表
          if (chartInstance.current) {
          const precision = getPriceDecimalPlaces(minPrice);
          chartInstance.current.setPriceVolumePrecision(precision, 0);
            chartInstance.current.applyNewData(formattedData);
            updateCandleWidthForInterval(chartInstance.current, interval);
          }
          
        onDataLoaded?.();
        } else {
        throw new Error(data?.message || "API返回无效数据");
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
        setError("请求超时，请检查网络连接");
          logger.warn('K线数据请求超时', { component: 'ChartWrapper', action: 'fetchKlineData' });
        } else {
          logger.error('获取K线数据失败', error, { component: 'ChartWrapper', action: 'fetchKlineData' });
          
        // 智能重试逻辑
        if (retryCount < 3) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
          setError(`获取数据失败，${Math.ceil(retryDelay / 1000)}秒后重试...`);
            
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchKlineData();
            }, retryDelay);
          } else {
          setError("无法获取K线数据，请稍后重试");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress, tokenChain, interval, pointsConfig, retryCount, onDataLoaded]);

  // 手动重试
  const handleRetry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchKlineData();
  }, [fetchKlineData]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;

    try {
      // 清理现有实例
      if (chartInstance.current) {
        dispose(chartRef.current);
        chartInstance.current = null;
      }

      // 创建新实例
      chartInstance.current = init(chartRef.current);
      
      if (chartInstance.current) {
        // 应用主题
        chartInstance.current.setStyles(darkMode ? DARK_THEME : LIGHT_THEME);
      
      // 设置技术指标
        setupIndicators(chartInstance.current, 'MA', subIndicator);
        
        // 获取数据
        fetchKlineData();
        }
    } catch (error) {
      logger.error('图表初始化失败', error, { component: 'ChartWrapper', action: 'init' });
      setError("图表初始化失败");
    }
    
      return () => {
        if (chartInstance.current && chartRef.current) {
          dispose(chartRef.current);
          chartInstance.current = null;
        }
      };
  }, []);
  
  // 主题变化
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setStyles(darkMode ? DARK_THEME : LIGHT_THEME);
    }
  }, [darkMode]);
  
  // 数据变化
  useEffect(() => {
    if (chartInstance.current && (tokenAddress !== "0xtoken")) {
      const timer = setTimeout(fetchKlineData, 300); // 防抖
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [fetchKlineData, tokenAddress, tokenChain, interval]);
  
  // 副图指标变化
  useEffect(() => {
    if (chartInstance.current) {
      setupIndicators(chartInstance.current, 'MA', subIndicator);
    }
  }, [subIndicator]);

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center z-10 backdrop-blur-sm",
      darkMode ? "bg-gray-900/80" : "bg-white/80"
    )}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <div className="text-sm font-medium">加载K线数据中...</div>
        <div className="text-xs text-muted-foreground">
          {interval} • {tokenAddress?.slice(0, 6)}...{tokenAddress?.slice(-4)}
        </div>
      </div>
    </div>
  );

  // 渲染错误状态
  const renderErrorState = () => (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center z-10",
      darkMode ? "bg-gray-900/90" : "bg-white/90"
    )}>
      <div className="flex flex-col items-center space-y-4 max-w-sm mx-auto p-6">
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <span className="font-medium">数据加载失败</span>
        </div>
        
        <p className="text-sm text-center text-muted-foreground">
          {error}
        </p>
        
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>重试</span>
          </Button>
        </div>
        
        {retryCount > 0 && (
          <div className="text-xs text-muted-foreground">
            已重试 {retryCount} 次
          </div>
        )}
      </div>
    </div>
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <div className={cn(
      "absolute inset-0 flex flex-col items-center justify-center z-10",
      darkMode ? "bg-gray-900/50" : "bg-white/50"
    )}>
      <div className="flex flex-col items-center space-y-3 text-muted-foreground">
        <TrendingUp className="h-12 w-12 opacity-50" />
        <div className="text-sm">暂无K线数据</div>
        <div className="text-xs">请选择有效的代币查看图表</div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* 图表容器 */}
    <div 
      ref={chartRef} 
      className="w-full h-full"
      style={{ 
        backgroundColor: darkMode ? '#131722' : '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      
      {/* 状态覆盖层 */}
      {isLoading && renderLoadingState()}
      {error && !isLoading && renderErrorState()}
      {!isLoading && !error && klineData.length === 0 && renderEmptyState()}
      
      {/* 数据信息栏 */}
      {!isLoading && !error && klineData.length > 0 && lastUpdate && (
        <div className={cn(
          "absolute top-2 left-2 px-2 py-1 rounded text-xs backdrop-blur-sm",
          darkMode ? "bg-gray-800/80 text-gray-300" : "bg-white/80 text-gray-600"
        )}>
          <div className="flex items-center space-x-2">
            <span>{klineData.length} 条数据</span>
            <span>•</span>
            <span>{lastUpdate.toLocaleTimeString()}</span>
            {priceRange && (
              <>
                <span>•</span>
                <span>
                  ${priceRange.min.toFixed(6)} - ${priceRange.max.toFixed(6)}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 