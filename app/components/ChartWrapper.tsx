"use client"

import { useEffect, useRef, useState } from "react"
import { init, dispose, Chart, KLineData, DeepPartial, Styles, Options } from 'klinecharts'

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
  const [isLoading, setIsLoading] = useState(false) // Start with false to avoid showing loader before first fetch
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null)

  // 专业交易所风格的颜色配置
  const DARK_THEME: DeepPartial<Styles> = {
    grid: {
      horizontal: { color: '#292929' },
      vertical: { color: '#292929' }
    },
    candle: {
      bar: {
        upColor: '#0ecb81',
        downColor: '#f6465d',
        noChangeColor: '#888888',
      },
      tooltip: { 
        show: true,
        custom: [] // Empty array to remove all text labels
      } as any,
      priceMark: {
        high: { show: true },
        low: { show: true },
        last: { show: true }
      }
    },
    xAxis: {
      axisLine: { color: '#292929' },
      tickLine: { show: true },
      tickText: { show: true, size: 11 }
    },
    yAxis: {
      axisLine: { color: '#292929' },
      tickLine: { show: true },
      tickText: { show: true, size: 11 }
    },
    indicator: {
      text: { show: true, size: 11 },
      line: { colors: ['#FF9600', '#9D65C9', '#2196F3'] },
      tooltip: {
        show: true,
        custom: [] // Empty array to remove all text labels
      } as any
    }
  }

  const LIGHT_THEME: DeepPartial<Styles> = {
    grid: {
      horizontal: { color: '#EDEDED' },
      vertical: { color: '#EDEDED' }
    },
    candle: {
      bar: {
        upColor: '#26A69A',
        downColor: '#EF5350',
        noChangeColor: '#888888',
      },
      tooltip: { 
        show: true,
        custom: [] // Empty array to remove all text labels
      } as any,
      priceMark: {
        high: { show: true },
        low: { show: true },
        last: { show: true }
      }
    },
    xAxis: {
      axisLine: { color: '#EDEDED' },
      tickLine: { show: true },
      tickText: { show: true, size: 11 }
    },
    yAxis: {
      axisLine: { color: '#EDEDED' },
      tickLine: { show: true },
      tickText: { show: true, size: 11 }
    },
    indicator: {
      text: { show: true, size: 11 },
      line: { colors: ['#FF9600', '#9D65C9', '#2196F3'] },
      tooltip: {
        show: true,
        custom: [] // Empty array to remove all text labels
      } as any
    }
  }

  // 获取K线数据
  const fetchKlineData = async () => {
    // Validate input parameters
    if (!tokenAddress || !tokenChain || tokenAddress === "0xtoken") {
      console.log("Skipping API request - missing address or chain");
      setError("缺少代币地址或链信息");
      return;
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // 获取数据点数量，为每个时间区间设置合适的数据点
      const pointsMap: Record<string, number> = {
        '1m': 240,   // 获取更多数据点以便缩放
        '5m': 240,
        '15m': 192,
        '1h': 168,
        '4h': 168,
        '1d': 120,
        '1w': 104
      };
      
      const points = pointsMap[interval] || 120;
      
      try {
        // 使用现有API获取数据
        console.log(`请求K线数据: ${tokenAddress} ${tokenChain} ${interval}`);
        const response = await fetch(`/api/token-kline?address=${encodeURIComponent(tokenAddress)}&chain=${encodeURIComponent(tokenChain)}&interval=${interval}&limit=${points}`, {
          // 增加超时时间
          signal: AbortSignal.timeout(15000) // 15秒超时
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && data.klines && data.klines.length > 0) {
          console.log(`成功获取K线数据: ${data.klines.length}条`);
          
          // 转换数据为KLineChart需要的格式
          const formattedData: KLineData[] = data.klines.map((item: any) => {
            // 确保timestamp是毫秒格式
            let timestamp = item.timestamp;
            if (timestamp < 1000000000000) {
              timestamp = timestamp * 1000;
            }
            
            return {
              timestamp: timestamp,
              open: parseFloat(item.open) || 0,
              high: parseFloat(item.high) || 0,
              low: parseFloat(item.low) || 0,
              close: parseFloat(item.close) || 0,
              volume: parseFloat(item.volume) || 0
            };
          });
          
          // 按时间戳排序
          formattedData.sort((a, b) => a.timestamp - b.timestamp);
          
          setKlineData(formattedData);
          setRetryCount(0); // 重置重试计数
          
          if (chartInstance.current) {
            chartInstance.current.applyNewData(formattedData);
            optimizeChartDisplay(chartInstance.current, interval, formattedData);
          }
          
          // 通知数据已加载
          if (onDataLoaded) {
            onDataLoaded();
          }
        } else {
          throw new Error('API返回无效数据或空数据');
        }
      } catch (apiError) {
        console.error('K线数据API请求失败:', apiError);
        throw apiError;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError("请求超时，请稍后再试");
        console.warn('K线数据请求超时');
      } else {
        console.error('获取K线数据失败', error);
        setError("无法获取K线数据");
        
        // 自动重试逻辑
        if (retryCount < 2) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`将在 ${retryDelay}ms 后重试获取K线数据 (${retryCount + 1}/2)`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchKlineData();
          }, retryDelay);
        } else {
          console.error('已达到最大重试次数，停止重试');
          setKlineData([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 优化图表显示 - 根据不同时间周期调整Y轴范围和缩放
  const optimizeChartDisplay = (chart: Chart, interval: string, data: KLineData[]) => {
    if (!data || data.length === 0) return;
    
    // 计算价格范围
    const prices = data.flatMap(k => [k.high, k.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // 计算价格波动范围比例
    const priceRange = maxPrice - minPrice;
    const averagePrice = (maxPrice + minPrice) / 2;
    const volatilityRatio = priceRange / averagePrice;
    
    console.log(`价格范围: ${minPrice} - ${maxPrice}, 波动率: ${(volatilityRatio * 100).toFixed(2)}%`);
    
    // 根据时间周期和价格波动调整Y轴显示
    try {
      // 计算合适的价格精度
      const pricePrecision = getPriceDecimalPlaces(minPrice);
      // 成交量精度固定为0
      const volumePrecision = 0;
      
      // 根据不同时间周期设置不同的蜡烛宽度
      if (interval === '1m' || interval === '5m') {
        // 短时间周期通常波动较小，扩大Y轴显示
        // 计算合适的Y轴范围扩展比例
        const yRangePercentage = volatilityRatio < 0.01 ? 0.2 : // 波动率低于1%，扩大到20%
                               volatilityRatio < 0.05 ? 0.5 : // 波动率低于5%，扩大到50%
                               1.0; // 默认不扩大
        
        // 设置Y轴范围，扩大价格显示区间
        const rangeExtension = priceRange * yRangePercentage;
        const yMin = Math.max(0, minPrice - rangeExtension); // 确保不小于0
        const yMax = maxPrice + rangeExtension;
        
        console.log(`为${interval}设置Y轴范围: ${yMin} - ${yMax}`);
        
        // 设置价格精度
        try {
          // 使用正确的setPriceVolumePrecision定义，根据API文档调整
          chart.setPriceVolumePrecision(pricePrecision, volumePrecision);
        } catch (e) {
          console.error('设置价格精度失败:', e);
        }
        
        // 设置缩放级别
        try {
          // 设置蜡烛宽度
          setCustomBarWidth(chart, interval === '1m' ? 8 : 6);
        } catch (e) {
          console.error('设置蜡烛宽度失败:', e);
        }
      } else if (interval === '15m' || interval === '1h') {
        // 中等时间周期，适度调整
        try {
          chart.setPriceVolumePrecision(pricePrecision, volumePrecision);
          setCustomBarWidth(chart, 5);
        } catch (e) {
          console.error('设置中等时间周期样式失败:', e);
        }
      } else {
        // 长时间周期，使用自动缩放
        try {
          chart.setPriceVolumePrecision(pricePrecision, volumePrecision);
          setCustomBarWidth(chart, 4);
        } catch (e) {
          console.error('设置长时间周期样式失败:', e);
        }
      }
      
      // 根据时间周期调整样式
      updateCandleWidthForInterval(interval);
    } catch (e) {
      console.error('优化图表显示失败:', e);
    }
  };
  
  // 设置自定义蜡烛宽度 - 通过CSS实现，避免使用不存在的API
  const setCustomBarWidth = (chart: Chart, width: number) => {
    // 使用CSS设置宽度
    updateCandleWidthForInterval(width.toString());
  }

  // 获取价格显示的小数位数
  const getPriceDecimalPlaces = (price: number): number => {
    if (price >= 1000) return 0;
    if (price >= 100) return 1;
    if (price >= 10) return 2;
    if (price >= 1) return 4;
    if (price >= 0.1) return 5;
    if (price >= 0.01) return 6;
    if (price >= 0.001) return 7;
    if (price >= 0.0001) return 8;
    return 9; // 最多9位小数
  };
  
  // 根据时间间隔更新蜡烛图样式
  const updateCandleWidthForInterval = (interval: string) => {
    // 根据时间间隔决定蜡烛图宽度
    let candleWidth;
    
    // 如果参数是数字字符串，直接使用
    if (!isNaN(Number(interval))) {
      candleWidth = `${interval}px`;
    } else {
      // 否则根据时间间隔选择宽度，为较大的图表提供合适的宽度
      candleWidth = 
        interval === '1m' ? '10px' :
        interval === '5m' ? '8px' :
        interval === '15m' ? '7px' :
        interval === '1h' ? '6px' :
        interval === '4h' ? '5px' :
        '4px';
    }
    
    // 更新全局样式
    if (typeof document !== 'undefined') {
      const styleId = 'candle-style';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      
      // 根据时间间隔设置不同的样式
      const borderWidth = 
        interval === '1m' || interval === '5m' ? '2px' : '1.5px';
      
      styleEl.innerHTML = `
        .klinecharts-candle-pane .klinecharts-candle-bar {
          width: ${candleWidth} !important;
          stroke-width: ${borderWidth} !important;
        }
        
        .klinecharts-candlestick-bar {
          stroke-width: ${borderWidth} !important;
        }
      `;
    }
  };

  // 设置指标
  const setupIndicators = (chart: Chart) => {
    // 移除所有指标，通过重新初始化确保只有一个副图
    try {
      console.log('开始重置指标，当前选中副图:', subIndicator);
      
      // 删除旧的副图，强制指定id
      const volPaneId = 'vol_pane';
      const macdPaneId = 'macd_pane';
      const kdjPaneId = 'kdj_pane';
      const rsiPaneId = 'rsi_pane';
      const bollPaneId = 'boll_pane';
      
      // 先删除旧的副图，无论当前选择什么
      try { chart.removeIndicator('VOL', volPaneId); } catch {}
      try { chart.removeIndicator('MACD', macdPaneId); } catch {}
      try { chart.removeIndicator('KDJ', kdjPaneId); } catch {}
      try { chart.removeIndicator('RSI', rsiPaneId); } catch {}
      try { chart.removeIndicator('BOLL', bollPaneId); } catch {}
      
      // 尝试移除其他可能存在的指标
      try { chart.removeIndicator('VOL'); } catch {}
      try { chart.removeIndicator('MACD'); } catch {}
      try { chart.removeIndicator('KDJ'); } catch {}
      try { chart.removeIndicator('RSI'); } catch {}
      try { chart.removeIndicator('BOLL'); } catch {}
      
      // 主图指标
    chart.createIndicator('MA', false, {
      id: 'candle_pane',
        showName: true,
        showParams: true,
        showTooltip: true
      } as any);
      
      // 延迟添加副图，确保之前的删除操作已完成
      setTimeout(() => {
        try {
          // 副图高度调整 - 为较大的图表提供更高的副图区域
          const indicatorHeight = 80;
          
          // 只添加当前选中的副图
          if (subIndicator === "VOL") {
            console.log('添加VOL副图');
            chart.createIndicator('VOL', false, { 
              id: volPaneId,
              height: indicatorHeight 
            } as any);
          } else if (subIndicator === "MACD") {
            console.log('添加MACD副图');
            chart.createIndicator('MACD', false, { 
              id: macdPaneId,
              height: indicatorHeight 
            } as any);
          } else if (subIndicator === "KDJ") {
            console.log('添加KDJ副图');
            chart.createIndicator('KDJ', false, { 
              id: kdjPaneId,
              height: indicatorHeight 
            } as any);
          } else if (subIndicator === "RSI") {
            console.log('添加RSI副图');
            chart.createIndicator('RSI', false, { 
              id: rsiPaneId,
              height: indicatorHeight 
            } as any);
          } else if (subIndicator === "BOLL") {
            console.log('添加BOLL副图');
            // BOLL通常显示在主图上而不是单独的副图
            chart.createIndicator('BOLL', false, { 
              id: 'candle_pane',
              height: 'auto' 
    } as any);
          }
          
          // 确保使用最新布局和样式
          chart.resize();
          
          // 重新优化数据显示
          if (klineData.length > 0) {
            optimizeChartDisplay(chart, interval, klineData);
          }
        } catch (e) {
          console.error('添加副图失败', e);
        }
      }, 100);
    } catch (e) {
      console.error('处理图表指标失败', e);
    }
  };
  
  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        // 显示所有图表元素
        const options: any = {
          infoOptions: { show: true },
          tooltip: { 
            show: true,
            custom: [] // Empty array to remove all text labels
          },
          crosshair: { show: true },
          xAxis: { 
            axisLine: { show: true }, 
            tickLine: { show: true }, 
            tickText: { show: true } 
          },
          yAxis: { 
            axisLine: { show: true }, 
            tickLine: { show: true }, 
            tickText: { show: true },
            position: 'right' // 将Y轴移到右侧
          },
          candle: {
            tooltip: { 
              show: true,
              custom: [] // Empty array to remove all text labels
            },
            priceMark: {
              high: { show: true },
              low: { show: true },
              last: { show: true },
              mark: { show: true }
            },
            // 优化蜡烛图大小，使其在手机上更友好
            bar: {
              upColor: darkMode ? '#0ecb81' : '#26A69A',
              downColor: darkMode ? '#f6465d' : '#EF5350',
              noChangeColor: '#888888',
              upBorderColor: darkMode ? '#0ecb81' : '#26A69A',
              downBorderColor: darkMode ? '#f6465d' : '#EF5350',
              noChangeBorderColor: '#888888',
              upWickColor: darkMode ? '#0ecb81' : '#26A69A',
              downWickColor: darkMode ? '#f6465d' : '#EF5350',
              noChangeWickColor: '#888888'
            }
          },
          labels: [],
          overlay: { showInfo: true },
          technicalIndicatorParams: { 
            showInfo: true,
            tooltip: {
              show: true,
              custom: [] // Empty array to remove all text labels
            }
          },
          // 设置右侧空间为0，让蜡烛图靠右边
          grid: {
            show: true,
            horizontal: {
              show: true
            },
            vertical: {
              show: true
            }
          },
          // 设置UI比例
          thousandsSeparator: ',',
          candleBarSpace: 4, // 蜡烛图间距
          candleBarFullScreen: false,
          rightSpace: 0, // 设置右侧空间为0
          // 移动端友好的布局配置
          maximumZoomLevel: 5,  // 允许放大的最大倍数
          minimumZoomLevel: 0.2, // 允许缩小的最小倍数
          defaultZoomLevel: 1 // 默认缩放级别
        };
        chartInstance.current = init(chartRef.current, options);
        if (chartInstance.current) {
          chartInstance.current.setStyles(darkMode ? DARK_THEME : LIGHT_THEME);
          setupIndicators(chartInstance.current);
          
          // 设置图表右侧空间为0，让蜡烛图靠右
          chartInstance.current.setOffsetRightDistance(0);
        }
      }
      
      // 只有当有有效的地址和链时才获取K线数据
      if (tokenAddress && tokenChain && tokenAddress !== "0xtoken") {
        fetchKlineData();
      } else {
        // 如果没有有效的地址和链，显示空图表
        setKlineData([]);
        setError("请选择有效的代币进行查看");
      }
    }
    
    // 组件卸载时清理图表实例
    return () => {
      if (chartRef.current && chartInstance.current) {
        dispose(chartRef.current);
        chartInstance.current = null;
      }
    };
  }, []);

  // 当暗色模式改变时更新主题
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setStyles(darkMode ? DARK_THEME : LIGHT_THEME);
    }
  }, [darkMode]);

  // 当交易对或时间间隔改变时重新获取数据
  useEffect(() => {
    if (chartInstance.current && tokenAddress && tokenChain && tokenAddress !== "0xtoken") {
      // 添加防抖，避免频繁请求
      const timer = setTimeout(() => {
        fetchKlineData();
        // 确保数据更新后蜡烛图靠右
        if (chartInstance.current) {
          chartInstance.current.setOffsetRightDistance(0);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
    
    // 如果条件不满足，返回undefined
    return undefined;
  }, [tokenAddress, tokenChain, interval]);

  // 当时间间隔改变时更新蜡烛图样式
  useEffect(() => {
    if (chartInstance.current) {
      // 根据时间间隔更新蜡烛图样式
      updateCandleWidthForInterval(interval);
      
      // 对1m和5m时间周期进行特殊优化
      if (interval === '1m' || interval === '5m') {
        // 重新计算显示范围，为小波动增强效果
        if (klineData.length > 0) {
          optimizeChartDisplay(chartInstance.current, interval, klineData);
        }
      }
    }
  }, [interval]);

  // 副图切换时，移除并添加indicator
  useEffect(() => {
    if (chartInstance.current) {
      setupIndicators(chartInstance.current);
    }
  }, [subIndicator]);
  
  return (
    <>
      <div className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-black z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-black z-10">
            <div className="bg-red-600 text-white px-4 py-2 rounded-md">
              {error}
            </div>
          </div>
        )}
        <div 
          ref={chartRef} 
          className="w-full h-full"
          style={{ height: '100%', minHeight: '300px' }}
        />
      </div>
      <style jsx global>{`
        /* 主图样式 */
        .klinecharts-candle-pane {
          height: auto !important; 
          max-height: none !important;
          min-height: 200px !important;
        }
        
        /* 副图样式 */
        .klinecharts-technical-indicator-pane {
          border-top: 1px solid ${darkMode ? '#333' : '#ddd'};
          margin-top: 0px !important;
          padding-top: 0px !important;
          height: 80px !important;
          z-index: 1 !important; /* 确保副图在下层 */
        }
        
        /* 确保图表层级正确 */
        .klinecharts-container {
          z-index: 1 !important; /* 确保图表在下层 */
          margin-bottom: 0 !important; /* 移除图表底部空白区域 */
        }
        
        /* 优化蜡烛图样式 - 适应不同时间周期 */
        .klinecharts-candle-bar {
          stroke-width: ${interval === '1m' ? '1.5px' : '1px'} !important;
        }
        
        /* 1分钟K线特殊优化 - 增加宽度和颜色饱和度 */
        .klinecharts-candle-pane .klinecharts-candle-bar.up {
          fill: ${interval === '1m' ? '#00e676' : (darkMode ? '#0ecb81' : '#26A69A')} !important;
          stroke: ${interval === '1m' ? '#00e676' : (darkMode ? '#0ecb81' : '#26A69A')} !important;
        }
        
        .klinecharts-candle-pane .klinecharts-candle-bar.down {
          fill: ${interval === '1m' ? '#ff1744' : (darkMode ? '#f6465d' : '#EF5350')} !important;
          stroke: ${interval === '1m' ? '#ff1744' : (darkMode ? '#f6465d' : '#EF5350')} !important;
        }
        
        /* 设置蜡烛图颜色和大小 */
        .klinecharts-candlestick-bar {
          stroke-width: ${interval === '1m' ? '2px' : '1px'} !important;
        }
        
        /* 优化移动端显示 */
        @media (max-width: 768px) {
          /* 手机上高度不强制设置固定值，由容器决定 */
          .klinecharts-candle-pane {
            height: auto !important;
            min-height: 200px !important;
          }
          
          /* 缩小字体，优化移动端显示 */
          .klinecharts-text,
          .klinecharts-y-axis-tick-text,
          .klinecharts-x-axis-tick-text {
            font-size: 10px !important;
          }
          
          /* 副图高度 */
          .klinecharts-technical-indicator-pane {
            height: 80px !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
        }
        
        /* 隐藏K线图tooltip中的文字标签 */
        .klinecharts-tooltip-content .tooltip-data-container .item .title,
        .klinecharts-indicator-tooltip-content .tooltip-data-container .item .title {
          display: none !important;
        }

        /* 可选：如果需要完全隐藏tooltip */
        /* 
        .klinecharts-tooltip-content,
        .klinecharts-indicator-tooltip-content {
          display: none !important;
        }
        */
      `}</style>
    </>
  )
} 