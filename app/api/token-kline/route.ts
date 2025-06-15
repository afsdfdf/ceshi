import { NextResponse } from 'next/server';
import { KLineData } from 'klinecharts';
import { AVE_API_KEY } from '../../api/lib/constants';

// 缓存K线数据，减少API调用
const klineCache: Record<string, { data: KLineData[], timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 增加到10分钟缓存，减少API调用

// 为各种API端点维护全局请求计数
interface RequestCounter {
  lastRequestTime: number;
  count: number;
}

const requestCounters: Record<string, RequestCounter> = {
  kline: { lastRequestTime: 0, count: 0 },
  tokenDetails: { lastRequestTime: 0, count: 0 },
  transactions: { lastRequestTime: 0, count: 0 },
  holders: { lastRequestTime: 0, count: 0 },
  risk: { lastRequestTime: 0, count: 0 }
};

// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 检查并执行速率限制
async function executeWithRateLimit(
  endpoint: string, 
  minDelay: number = 1000, 
  fn: () => Promise<any>
): Promise<any> {
  const counter = requestCounters[endpoint];
  const now = Date.now();
  const timeSinceLastRequest = now - counter.lastRequestTime;
  
  // 如果距离上次请求时间不足minDelay，则等待
  if (counter.lastRequestTime > 0 && timeSinceLastRequest < minDelay) {
    const waitTime = minDelay - timeSinceLastRequest;
    console.log(`API率限制: ${endpoint} 等待 ${waitTime}ms`);
    await sleep(waitTime);
  }
  
  // 更新计数器
  counter.lastRequestTime = Date.now();
  counter.count++;
  
  try {
    return await fn();
  } catch (error) {
    // 如果是429错误，等待更长时间后重试
    if (error instanceof Error && error.message.includes('429')) {
      console.log(`${endpoint} 遇到速率限制，等待2秒后重试`);
      await sleep(2000);
      counter.lastRequestTime = Date.now(); // 更新上次请求时间
      return await fn();
    }
    throw error;
  }
}

// 直接从Ave.ai API获取K线数据的函数
async function fetchAveKlineData(address: string, chain: string, interval: string, limit: number): Promise<KLineData[]> {
  return executeWithRateLimit('kline', 500, async () => {
    try {
      // 格式化token_id
      const tokenId = `${address}-${chain}`;
      
      // 处理时间间隔参数
      const intervalMap: { [key: string]: number } = {
        '1m': 1,
        '5m': 5,
        '15m': 15,
        '30m': 30,
        '1h': 60,
        '2h': 120,
        '4h': 240,
        '1d': 1440,
        '3d': 4320,
        '1w': 10080,
        '1M': 43200,
        '1y': 525600
      };
      
      const intervalValue = intervalMap[interval] || 1440; // 默认日K
      
      // 检查缓存
      const cacheKey = `${tokenId}-${intervalValue}-${limit}`;
      const cachedData = klineCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log(`使用缓存的K线数据: ${cacheKey}`);
        return cachedData.data;
      }
      
      // 直接构建URL
      const url = `https://prod.ave-api.com/v2/klines/token/${tokenId}?interval=${intervalValue}&size=${limit}`;
      
      console.log(`直接从Ave.ai获取K线数据: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': '*/*',
          'X-API-KEY': AVE_API_KEY
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('429 Rate limit exceeded');
        }
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 1 || !data.data || !data.data.points) {
        throw new Error('无效的API响应格式');
      }
      
      // 处理API返回的K线数据
      const klinePoints = data.data.points;
      
      const klineData = klinePoints.map((point: any) => ({
        timestamp: point.time * 1000, // 转换为毫秒时间戳
        open: parseFloat(point.open),
        high: parseFloat(point.high),
        low: parseFloat(point.low),
        close: parseFloat(point.close),
        volume: parseFloat(point.volume)
      }));
      
      // 更新缓存
      klineCache[cacheKey] = {
        data: klineData,
        timestamp: Date.now()
      };
      
      return klineData;
    } catch (error) {
      console.error('从Ave.ai获取K线数据失败:', error);
      throw error;
    }
  });
}



/**
 * GET 处理程序
 * 获取代币K线数据
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  const interval = searchParams.get('interval') || '1h';
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  if (!address || !chain) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Missing required parameters: address and chain' 
      },
      { status: 400 }
    );
  }

  try {
    console.log(`获取K线数据请求: ${address}-${chain}, ${interval}, ${limit}条`);
    
    // 直接从Ave.ai API获取数据
    const klineData = await fetchAveKlineData(address, chain, interval, limit);
    
    if (klineData && klineData.length > 0) {
      console.log(`成功获取${klineData.length}条K线数据`);
      return NextResponse.json({
        success: true,
        klines: klineData
      });
    } else {
      console.log('API返回空数据');
      return NextResponse.json({
        success: false,
        error: '暂无K线数据'
      }, { status: 404 });
    }
  } catch (apiError) {
    console.error('获取K线数据失败:', apiError);
    
    // 尝试使用过期缓存数据
    const cacheKey = `${address}-${chain}-${interval}-${limit}`;
    if (klineCache[cacheKey]) {
      console.log('API失败，使用过期的缓存数据');
      return NextResponse.json({
        success: true,
        klines: klineCache[cacheKey].data,
        stale: true,
        message: '使用缓存数据'
      });
    }
    
    // 没有缓存数据时返回错误
    return NextResponse.json({
      success: false,
      error: '暂时无法获取K线数据，请稍后重试',
      message: apiError instanceof Error ? apiError.message : 'Unknown error'
    }, { status: 503 });
  }
} 