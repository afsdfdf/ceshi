import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// 缓存配置
const CACHE_TTL = 600 * 1000; // 10分钟缓存时间
const FALLBACK_CACHE_TTL = 1800 * 1000; // 30分钟备用缓存时间
const RETRY_INTERVAL = 60 * 1000; // 1分钟重试间隔

// 内存缓存对象
interface CacheObject {
  data: any;
  expires: number;
  lastUpdated: number;
  isFallback?: boolean;
}

// 全局缓存
let priceCache: CacheObject | null = null;
let fallbackCache: CacheObject | null = null;
let updateInProgress = false;
let lastFailedUpdate = 0;
let lastSuccessfulUpdate = 0;

// XAI代币信息
const XAI_TOKEN_INFO = {
  address: "0x1c864c55f0c5e0014e2740c36a1f2378bfabd487",
  chain: "bsc",
  symbol: "XAI",
  name: "𝕏AI",
  image: "https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed"
};

// 数据源1: AVE API
async function fetchFromAveApi() {
  const tokenId = `${XAI_TOKEN_INFO.address}-${XAI_TOKEN_INFO.chain}`;
  const AVE_API_KEY = "NMUuJmYHJB6d91bIpgLqpuLLKYVws82lj0PeDP3UEb19FoyWFJUVGLsgE95XTEmA";

  logger.debug('尝试AVE API获取价格', { tokenId }, { component: 'MainstreamPricesAPI', action: 'fetchFromAveApi' });
    
    const response = await fetch("https://prod.ave-api.com/v2/tokens/price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      "X-API-KEY": AVE_API_KEY,
      "User-Agent": "XAI-Finance/1.0"
      },
    body: JSON.stringify({ token_ids: [tokenId] }),
    signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
    throw new Error(`AVE API failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 1 || !result.data || !result.data[tokenId]) {
    throw new Error('AVE API returned invalid data');
    }

    const data = result.data[tokenId];
  return {
    symbol: XAI_TOKEN_INFO.symbol,
    name: XAI_TOKEN_INFO.name,
    current_price: parseFloat(data.current_price_usd) || 0,
    price_change_percentage_24h: parseFloat(data.price_change_24h) || 0,
    image: XAI_TOKEN_INFO.image,
      market_cap: parseFloat(data.market_cap || '0'),
      volume_24h: parseFloat(data.tx_volume_u_24h || '0'),
    liquidity_usd: parseFloat(data.tvl || '0'),
    source: 'ave_api'
  };
}

// 数据源2: DexScreener API
async function fetchFromDexScreener() {
  logger.debug('尝试DexScreener API获取价格', { component: 'MainstreamPricesAPI', action: 'fetchFromDexScreener' });
  
  const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${XAI_TOKEN_INFO.address}`, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "XAI-Finance/1.0"
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`DexScreener API failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (!result.pairs || result.pairs.length === 0) {
    throw new Error('DexScreener returned no pairs');
  }

  // 找到最大流动性的交易对
  const bestPair = result.pairs.reduce((best: any, current: any) => {
    const currentLiquidity = parseFloat(current.liquidity?.usd || '0');
    const bestLiquidity = parseFloat(best?.liquidity?.usd || '0');
    return currentLiquidity > bestLiquidity ? current : best;
  });

  return {
    symbol: XAI_TOKEN_INFO.symbol,
    name: XAI_TOKEN_INFO.name,
    current_price: parseFloat(bestPair.priceUsd) || 0,
    price_change_percentage_24h: parseFloat(bestPair.priceChange?.h24) || 0,
    image: XAI_TOKEN_INFO.image,
    market_cap: parseFloat(bestPair.marketCap) || 0,
    volume_24h: parseFloat(bestPair.volume?.h24) || 0,
    liquidity_usd: parseFloat(bestPair.liquidity?.usd) || 0,
    source: 'dexscreener'
  };
}

// 数据源3: CoinGecko API (免费版，有限制)
async function fetchFromCoinGecko() {
  logger.debug('尝试CoinGecko API获取价格', { component: 'MainstreamPricesAPI', action: 'fetchFromCoinGecko' });
  
  // CoinGecko的XAI代币ID (需要先查找)
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${XAI_TOKEN_INFO.address}`, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "XAI-Finance/1.0"
    },
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.market_data) {
    throw new Error('CoinGecko returned no market data');
  }

  return {
    symbol: XAI_TOKEN_INFO.symbol,
    name: XAI_TOKEN_INFO.name,
    current_price: parseFloat(data.market_data.current_price?.usd) || 0,
    price_change_percentage_24h: parseFloat(data.market_data.price_change_percentage_24h) || 0,
    image: XAI_TOKEN_INFO.image,
    market_cap: parseFloat(data.market_data.market_cap?.usd) || 0,
    volume_24h: parseFloat(data.market_data.total_volume?.usd) || 0,
    liquidity_usd: 0,
    source: 'coingecko'
  };
}

// 尝试多个数据源获取XAI价格
async function fetchXaiPrice() {
  const dataSources = [
    fetchFromDexScreener,  // 优先使用DexScreener（比较稳定）
    fetchFromAveApi,       // 然后AVE API
    fetchFromCoinGecko     // 最后CoinGecko
  ];

  for (const fetchFunc of dataSources) {
    try {
      const data = await fetchFunc();
      if (data.current_price > 0) {  // 验证价格有效
        logger.info('成功获取价格数据', { source: data.source, price: data.current_price }, { component: 'MainstreamPricesAPI', action: 'fetchXaiPrice' });
        return data;
      }
  } catch (error) {
      logger.warn('价格数据源失败', { 
        source: fetchFunc.name, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, { component: 'MainstreamPricesAPI', action: 'fetchXaiPrice' });
      continue;
    }
  }

  throw new Error('All price data sources failed');
}

// 获取XAI价格数据并更新缓存
async function updateCache() {
  if (updateInProgress) return false;
  const now = Date.now();
  
  // 如果最近失败过，不要太频繁重试
  if (lastFailedUpdate > 0 && now - lastFailedUpdate < RETRY_INTERVAL) {
    return false;
  }
  
  updateInProgress = true;
  try {
    const xaiData = await fetchXaiPrice();
    const newData = {
      timestamp: now,
      cached: false,
      data_source: xaiData.source,
      xai: xaiData
    };
    
    // 更新主缓存
    priceCache = {
      data: newData,
      expires: now + CACHE_TTL,
      lastUpdated: now
    };
    
    // 更新备用缓存（有效期更长）
    fallbackCache = {
      data: newData,
      expires: now + FALLBACK_CACHE_TTL,
      lastUpdated: now
    };
    
    lastFailedUpdate = 0;
    lastSuccessfulUpdate = now;
    logger.info('缓存更新成功', { source: xaiData.source }, { component: 'MainstreamPricesAPI', action: 'updateCache' });
    return true;
  } catch (error) {
    logger.error('缓存更新失败', error, { component: 'MainstreamPricesAPI', action: 'updateCache' });
    lastFailedUpdate = now;
    return false;
  } finally {
    updateInProgress = false;
  }
}

// 获取可用的数据（按优先级）
function getAvailableData() {
  const now = Date.now();
  
  // 1. 优先使用新鲜的主缓存
  if (priceCache && priceCache.expires > now && priceCache.data?.xai) {
    return {
      data: priceCache.data.xai,
      cached: true,
      source: 'primary_cache',
      cache_age: Math.round((now - priceCache.lastUpdated) / 1000) + '秒',
      data_source: priceCache.data.data_source
    };
  }
  
  // 2. 使用备用缓存（即使过期了一点也可以接受）
  if (fallbackCache && fallbackCache.data?.xai) {
    const isExpired = fallbackCache.expires <= now;
    return {
      data: fallbackCache.data.xai,
      cached: true,
      source: 'fallback_cache',
      cache_age: Math.round((now - fallbackCache.lastUpdated) / 1000) + '秒',
      expired: isExpired,
      data_source: fallbackCache.data.data_source
    };
  }
  
  // 3. 如果没有任何缓存数据，返回null
  return null;
}

// 初始化缓存预热函数
function initCacheWarming() {
  console.log('[XAI-Price] Starting cache warming...');
  updateCache(); // 启动时拉一次
  
  // 定期更新缓存
  setInterval(() => {
    console.log('[XAI-Price] Triggering scheduled cache update...');
    updateCache();
  }, CACHE_TTL);
}

initCacheWarming();

export async function GET() {
  const now = Date.now();
  logger.debug('价格请求接收', { component: 'MainstreamPricesAPI', action: 'GET' });
  
  // 先检查是否有可用数据
  const availableData = getAvailableData();
  
  // 如果没有任何缓存数据，尝试立即获取
  if (!availableData) {
    logger.debug('无缓存数据，尝试立即获取', { component: 'MainstreamPricesAPI', action: 'GET' });
    
    // 如果没有正在更新，立即更新
    if (!updateInProgress) {
      const success = await updateCache();
      if (success) {
        const newData = getAvailableData();
        if (newData) {
          return NextResponse.json({
            xai: newData.data,
            cached: true,
            cache_age: newData.cache_age,
            data_source: newData.data_source
          });
        }
      }
    }
    
    // 如果获取失败，返回错误
    return NextResponse.json(
      { error: '暂时无法获取价格数据，请稍后重试' },
      { status: 503 }
    );
  }
  
  // 如果有新鲜的主缓存，直接返回
  if (availableData.source === 'primary_cache') {
    logger.debug('使用主缓存响应', { component: 'MainstreamPricesAPI', action: 'GET' });
    return NextResponse.json({
      xai: availableData.data,
      cached: true,
      cache_age: availableData.cache_age,
      data_source: availableData.data_source
    });
  }
  
  // 如果主缓存过期且没有正在更新，尝试异步更新
  if (!updateInProgress && now - lastSuccessfulUpdate > CACHE_TTL) {
    logger.debug('启动后台缓存更新', { component: 'MainstreamPricesAPI', action: 'GET' });
    updateCache(); // 异步更新，不等待结果
  }
  
  // 返回最佳可用数据
  logger.debug('使用缓存响应', { source: availableData.source }, { component: 'MainstreamPricesAPI', action: 'GET' });
  return NextResponse.json({
    xai: availableData.data,
    cached: true,
    cache_age: availableData.cache_age,
    source: availableData.source,
    data_source: availableData.data_source,
    ...(availableData.expired && { warning: '数据可能不是最新的' })
  });
} 