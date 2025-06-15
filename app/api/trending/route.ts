import { NextResponse } from "next/server"

// 定义热门代币接口
export interface TrendingToken {
  id: string
  name: string
  symbol: string
  price: number
  priceUsd: string
  change24h: number
  volume24h: number
  volumeUsd: string
  marketCap: number
  marketCapUsd: string
  chainId: string
  chain: string
  address: string
  logo: string
  color: string
  rank: number
  trending: string
}

// 内存缓存
let trendingCache: {
  data: any;
  timestamp: number;
} | null = null;

// 缓存有效期（10分钟）
const CACHE_TTL = 600000;

// 检查缓存是否有效
function isCacheValid(): boolean {
  if (!trendingCache) return false;
  const now = Date.now();
  return now - trendingCache.timestamp < CACHE_TTL;
}

// 获取热门代币列表
export async function GET() {
  try {
    // 检查缓存
    if (isCacheValid()) {
      console.log("Returning cached trending data");
      return NextResponse.json({
        success: true,
        data: trendingCache!.data,
        cached: true
      });
    }

    console.log("Fetching fresh trending data from crypto API");
    
    // 从 crypto API 获取热门代币
    const response = await fetch("/api/crypto", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(10000) // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`Crypto API返回错误: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error('Crypto API返回无效数据');
    }
    
    // 转换数据格式
    let trendingTokens: TrendingToken[] = [];
    let newListings: TrendingToken[] = [];
    let highVolume: TrendingToken[] = [];

      // 从 popularTokens 生成主要趋势代币列表
    if (data.data.popularTokens && Array.isArray(data.data.popularTokens)) {
      trendingTokens = data.data.popularTokens.map((token: any, index: number) => ({
        id: token.id || `token_${index}`,
        name: token.name || `Token ${index}`,
        symbol: token.symbol || `TKN${index}`,
        price: token.price || 0,
        priceUsd: `$${(token.price || 0).toLocaleString()}`,
        change24h: token.change || 0,
        volume24h: 10000000 + Math.random() * 10000000,
        volumeUsd: `$${(10 + Math.random() * 20).toFixed(2)}M`,
        marketCap: 1000000000 + Math.random() * 10000000000,
        marketCapUsd: `$${(1 + Math.random() * 10).toFixed(2)}B`,
        chainId: "1",
        chain: "ethereum",
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        logo: `https://assets.coingecko.com/coins/images/${Math.floor(Math.random() * 20) + 1}/large/coin.png`,
        color: token.color || "#000000",
        rank: index + 1,
        trending: Math.random() > 0.5 ? "up" : "down"
      }));
      }

      // 从 trendingTokens 生成新上线列表和高交易量列表
    if (data.data.trendingTokens && Array.isArray(data.data.trendingTokens)) {
        newListings = data.data.trendingTokens.slice(0, 3).map((token: any, index: number) => ({
        id: token.id || `new_${index}`,
        name: token.name || `New Token ${index}`,
        symbol: token.symbol || `NEW${index}`,
        price: token.price || 0,
        priceUsd: `$${(token.price || 0).toLocaleString()}`,
        change24h: token.change || 0,
          volume24h: 5000000 + Math.random() * 10000000,
          volumeUsd: `$${(5 + Math.random() * 10).toFixed(2)}M`,
          marketCap: 500000000 + Math.random() * 1000000000,
          marketCapUsd: `$${(0.5 + Math.random() * 1).toFixed(2)}B`,
          chainId: "1",
          chain: Math.random() > 0.5 ? "ethereum" : "binance-smart-chain",
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          logo: `https://assets.coingecko.com/coins/images/${Math.floor(Math.random() * 20) + 100}/large/coin.png`,
        color: token.color || "#000000",
          rank: 50 + index,
          trending: "up"
      }));

        highVolume = data.data.trendingTokens.slice(0, 3).map((token: any, index: number) => ({
        id: token.id || `volume_${index}`,
        name: token.name || `Volume Token ${index}`,
        symbol: token.symbol || `VOL${index}`,
        price: token.price || 0,
        priceUsd: `$${(token.price || 0).toLocaleString()}`,
        change24h: token.change || 0,
          volume24h: 50000000 + Math.random() * 100000000,
          volumeUsd: `$${(50 + Math.random() * 100).toFixed(2)}M`,
          marketCap: 5000000000 + Math.random() * 10000000000,
          marketCapUsd: `$${(5 + Math.random() * 10).toFixed(2)}B`,
          chainId: "1",
          chain: Math.random() > 0.3 ? "ethereum" : "solana",
          address: `0x${Math.random().toString(16).substring(2, 42)}`,
          logo: `https://assets.coingecko.com/coins/images/${Math.floor(Math.random() * 20) + 200}/large/coin.png`,
        color: token.color || "#000000",
          rank: 10 + index,
          trending: Math.random() > 0.3 ? "up" : "down"
      }));
    }

    // 构建响应数据
    const responseData = {
      trending: trendingTokens,
      newListings: newListings,
      highVolume: highVolume,
      lastUpdated: new Date().toISOString()
    };

    // 更新缓存
    trendingCache = {
      data: responseData,
      timestamp: Date.now()
    };

    console.log(`Successfully processed ${trendingTokens.length} trending tokens`);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Trending API Error:', error);
    
    // 如果有缓存数据，即使过期也返回
    if (trendingCache) {
      console.log('API failed, returning stale cache data');
      return NextResponse.json({
        success: true,
        data: trendingCache.data,
        stale: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // 没有缓存数据时返回错误
    return NextResponse.json({
      success: false,
      error: '暂时无法获取趋势数据，请稍后重试',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
