import { NextRequest, NextResponse } from 'next/server';
import { AVE_API_KEY, API_ENDPOINTS } from '../lib/constants';

// 接口定义
interface RankTopic {
  id: string;
  name_en: string;
  name_zh: string;
}

interface TokenData {
  token: string;
  chain: string;
  symbol: string;
  name: string;
  logo_url: string;
  current_price_usd: number;
  price_change_24h: number;
  tx_volume_u_24h: number;
  holders: number;
  market_cap?: string;
  fdv?: string;
  risk_score?: string;
}

// 内存缓存对象，用于存储不同主题的数据
const memoryCache: Record<string, { data: any; timestamp: number }> = {};

// 缓存有效期（10分钟，单位为毫秒）- 提升加载速度
const CACHE_TTL = 600000;
// 过期缓存保留时间（1小时）- 用于服务不可用时的备用数据
const STALE_CACHE_TTL = 3600000;

/**
 * 检查缓存是否有效
 */
function isMemoryCacheValid(cacheKey: string): boolean {
  if (!memoryCache[cacheKey]) return false;
  const now = Date.now();
  return now - memoryCache[cacheKey].timestamp < CACHE_TTL;
}

/**
 * 检查是否有过期但可用的缓存
 */
function hasStaleCache(cacheKey: string): boolean {
  if (!memoryCache[cacheKey]) return false;
  const now = Date.now();
  return now - memoryCache[cacheKey].timestamp < STALE_CACHE_TTL;
}

/**
 * 获取真实API数据
 */
async function fetchAveApiData(endpoint: string) {
  console.log(`Fetching data from: ${endpoint}`);
  try {
    const headers: HeadersInit = {
      "Accept": "*/*",
      "X-API-KEY": AVE_API_KEY,
      "User-Agent": "XAI-Finance/1.0"
    };
    
    const response = await fetch(endpoint, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(12000) // 增加到12秒超时
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`API rate limit exceeded (${response.status})`);
      } else if (response.status >= 500) {
        throw new Error(`API server error (${response.status})`);
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }
    
    const data = await response.json();
    
    if (data?.status !== 1 || !data?.data) {
      throw new Error('Invalid API response format');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 将API返回的代币数据转换为我们需要的格式
 */
function transformTokenData(apiData: any[]): TokenData[] {
  return apiData.map(token => {
    let tokenName = token.symbol || "";
    try {
      if (token.appendix) {
        const appendixData = JSON.parse(token.appendix);
        if (appendixData.tokenName) {
          tokenName = appendixData.tokenName;
        }
      }
    } catch (e) {
      // 忽略解析错误
    }

    return {
      token: token.token || "",
      chain: token.chain || "",
      symbol: token.symbol || "",
      name: tokenName || token.symbol || "Unknown Token",
      logo_url: token.logo_url || "",
      current_price_usd: parseFloat(token.current_price_usd) || 0,
      price_change_24h: parseFloat(token.price_change_24h) || 0,
      tx_volume_u_24h: parseFloat(token.tx_volume_u_24h) || 0,
      holders: parseInt(token.holders) || 0,
      market_cap: token.market_cap || "0",
      fdv: token.fdv || "0",
      risk_score: token.risk_score || "0"
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topic = searchParams.get('topic') || 'hot';
    console.log("Topic requested:", topic);
    
    // 如果请求的是话题列表
    if (topic === 'topics') {
      const cacheKey = 'topics';
      
      // 检查内存缓存是否有效
      if (isMemoryCacheValid(cacheKey)) {
        console.log("Returning cached topics data from memory");
        return NextResponse.json({ 
          success: true, 
          data: { topics: memoryCache[cacheKey].data }, 
          timestamp: Date.now(),
          cached: true
        }, { status: 200 });
      }
      
      console.log("Fetching fresh topics data from Ave.ai API");
      
      try {
        const data = await fetchAveApiData(API_ENDPOINTS.AVE_RANK_TOPICS);
        
        // 更新内存缓存
        memoryCache[cacheKey] = {
          data: data.data,
          timestamp: Date.now()
        };
        
        console.log("Returning fresh topics data and updating cache");
        return NextResponse.json({ 
          success: true, 
          data: { topics: data.data }, 
          timestamp: Date.now(),
          cached: false
        }, { status: 200 });
      } catch (apiError) {
        console.error("Error fetching topics from Ave.ai:", apiError);
        
        // 尝试使用过期缓存
        if (hasStaleCache(cacheKey)) {
          console.log("Using stale cache for topics due to API error");
          return NextResponse.json({ 
            success: true, 
            data: { topics: memoryCache[cacheKey].data }, 
            timestamp: Date.now(),
            cached: true,
            stale: true,
            warning: '数据可能不是最新的'
          }, { status: 200 });
        }
        
        // 返回友好的错误信息
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
        let userFriendlyMessage = '暂时无法获取话题数据，请稍后重试';
        
        if (errorMessage.includes('rate limit')) {
          userFriendlyMessage = '请求过于频繁，请稍后重试';
        } else if (errorMessage.includes('server error')) {
          userFriendlyMessage = '数据服务暂时不可用，请稍后重试';
        }
        
        return NextResponse.json({ 
          success: false, 
          error: userFriendlyMessage,
          timestamp: Date.now() 
        }, { status: 503 });
      }
    } 
    // 返回特定主题的代币列表
    else {
      const cacheKey = `tokens_${topic}`;
      
      // 检查内存缓存是否有效
      if (isMemoryCacheValid(cacheKey)) {
        console.log(`Returning cached tokens data for topic: ${topic} from memory`);
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: memoryCache[cacheKey].data,
            count: memoryCache[cacheKey].data.length
          },
          timestamp: Date.now(),
          cached: true
        }, { status: 200 });
      }
      
      console.log(`Fetching fresh tokens data for topic: ${topic} from Ave.ai API`);
      
      try {
        const data = await fetchAveApiData(`${API_ENDPOINTS.AVE_RANK_BY_TOPIC}?topic=${topic}`);
        
        // 转换数据格式
        const transformedData = transformTokenData(data.data);
        
        // 更新内存缓存
        memoryCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now()
        };
        
        console.log(`Returning fresh tokens data for topic: ${topic} and updating cache`);
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: transformedData,
            count: transformedData.length
          },
          timestamp: Date.now(),
          cached: false
        }, { status: 200 });
      } catch (apiError) {
        console.error(`Error fetching tokens for topic ${topic} from Ave.ai:`, apiError);
        
        // 尝试使用过期缓存
        if (hasStaleCache(cacheKey)) {
          console.log(`Using stale cache for topic ${topic} due to API error`);
          return NextResponse.json({ 
            success: true,
            data: {
              topic: topic,
              tokens: memoryCache[cacheKey].data,
              count: memoryCache[cacheKey].data.length
            },
            timestamp: Date.now(),
            cached: true,
            stale: true,
            warning: '数据可能不是最新的'
          }, { status: 200 });
        }
        
        // 返回友好的错误信息
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error';
        let userFriendlyMessage = '暂时无法获取代币数据，请稍后重试';
        
        if (errorMessage.includes('rate limit')) {
          userFriendlyMessage = '请求过于频繁，请稍后重试';
        } else if (errorMessage.includes('server error')) {
          userFriendlyMessage = '数据服务暂时不可用，请稍后重试';
        }
        
        return NextResponse.json({ 
          success: false, 
          error: userFriendlyMessage,
          timestamp: Date.now() 
        }, { status: 503 });
      }
    }
  } catch (error) {
    console.error('Unexpected error in tokens API:', error);
    return NextResponse.json({ 
      success: false, 
      error: '服务器内部错误，请稍后重试',
      timestamp: Date.now() 
    }, { status: 500 });
  }
} 