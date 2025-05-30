import { Chart, KLineData } from 'klinecharts'
import { logger } from '@/lib/logger'

/**
 * 优化图表显示，设置合适的可见范围和蜡烛宽度
 * @param chart 图表实例
 * @param interval 时间间隔
 * @param data K线数据
 */
export function optimizeChartDisplay(chart: Chart, interval: string, data: KLineData[]): void {
  if (!chart || !data || data.length === 0) return;
  
  // 根据时间间隔设置合适的蜡烛宽度
  const candleWidthMap: Record<string, number> = {
    '1m': 3,
    '5m': 4,
    '15m': 5,
    '1h': 6,
    '4h': 8,
    '1d': 10,
    '1w': 12
  };
  
  const defaultWidth = 8;
  const width = candleWidthMap[interval] || defaultWidth;
  
  // 设置蜡烛宽度
  setCustomBarWidth(chart, width);
  
  // 适配可见范围：显示近期数据但保留足够历史
  const dataLength = data.length;
  
  // 设置右边距
  const rightDistance = Math.ceil(chart.getOffsetRightDistance() * 0.08);
  chart.setOffsetRightDistance(rightDistance);
  
  // 无法直接设置可见范围，依赖图表自动调整
  // 图表在初始化时会自动显示合适的数据范围
}

/**
 * 设置自定义蜡烛宽度
 * @param chart 图表实例
 * @param width 宽度
 */
export function setCustomBarWidth(chart: Chart, width: number): void {
  chart.setBarSpace(width);
}

/**
 * 获取价格小数位数
 * @param price 价格
 * @returns 小数位数
 */
export function getPriceDecimalPlaces(price: number): number {
  if (price === 0) return 2;
  
  if (price < 0.00001) return 8;
  if (price < 0.0001) return 7;
  if (price < 0.001) return 6;
  if (price < 0.01) return 5;
  if (price < 0.1) return 4;
  if (price < 1) return 3;
  if (price < 1000) return 2;
  
  return 2;
}

/**
 * 根据时间间隔更新蜡烛宽度
 * @param chart 图表实例
 * @param interval 时间间隔
 */
export function updateCandleWidthForInterval(chart: Chart, interval: string): void {
  const candleWidthMap: Record<string, number> = {
    '1m': 3,
    '5m': 4,
    '15m': 5,
    '1h': 6,
    '4h': 8,
    '1d': 10,
    '1w': 12
  };
  
  const width = candleWidthMap[interval] || 6;
  setCustomBarWidth(chart, width);
}

/**
 * 设置图表技术指标
 * @param chart 图表实例
 * @param mainIndicator 主图指标
 * @param subIndicator 副图指标
 */
export function setupIndicators(chart: Chart, mainIndicator?: string, subIndicator?: string): void {
  // 设置主图指标
  if (mainIndicator) {
    chart.createIndicator(mainIndicator, false, { id: 'main-indicator' });
  }
  
  // 设置副图指标
  if (subIndicator) {
    // 处理现有指标
    try {
      // 尝试移除现有指标，如果存在的话
      chart.removeIndicator('sub-indicator', subIndicator);
    } catch (error) {
      // 忽略错误，继续添加新指标
      logger.debug('移除现有指标失败，可能不存在', { subIndicator }, { component: 'ChartUtils', action: 'setupIndicators' });
    }
    
    // 增加新的副图指标
    chart.createIndicator(
      subIndicator, 
      true, 
      { 
        id: 'sub-indicator',
        height: 80,
      }
    );
  }
} 