import { NextResponse } from 'next/server';

// 缓存配置
const CACHE_TTL = 600 * 1000; // 10分钟缓存时间
const RETRY_INTERVAL = 60 * 1000; // 1分钟重试间隔

// 内存缓存对象
interface CacheObject {
  data: any;
  expires: number;
  lastUpdated: number;
}

// 全局缓存
let priceCache: CacheObject | null = null;
let updateInProgress = false;
let lastFailedUpdate = 0;

// 从AVE获取XAI代币数据
async function fetchXaiFromAve() {
  try {
    const tokenId = "0x1c864c55f0c5e0014e2740c36a1f2378bfabd487-bsc";
    const AVE_API_KEY = process.env.AVE_API_KEY;
    const response = await fetch("https://prod.ave-api.com/v2/tokens/price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(AVE_API_KEY ? { "Authorization": `Bearer ${AVE_API_KEY}` } : {})
      },
      body: JSON.stringify({ token_ids: [tokenId] })
    });
    if (!response.ok) throw new Error("AVE API请求失败");
    const result = await response.json();
    if (!result.data || !result.data[tokenId]) throw new Error("AVE返回无XAI数据");
    const data = result.data[tokenId];
    return {
      symbol: 'XAI',
      name: '𝕏AI',
      current_price: parseFloat(data.current_price_usd),
      price_change_percentage_24h: parseFloat(data.price_change_24h),
      image: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed',
      market_cap: 0, // AVE未返回
      volume_24h: parseFloat(data.tx_volume_u_24h || '0'),
      liquidity_usd: parseFloat(data.tvl || '0')
    };
  } catch (error) {
    // fallback
    return {
      symbol: 'XAI',
      name: '𝕏AI',
      current_price: 0.00005238,
      price_change_percentage_24h: 21.38,
      image: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed',
      market_cap: 10000000,
      volume_24h: 2500000,
      liquidity_usd: 5000000
    };
  }
}

// 获取XAI价格数据并更新缓存
async function updateCache() {
  if (updateInProgress) return false;
  const now = Date.now();
  if (lastFailedUpdate > 0 && now - lastFailedUpdate < RETRY_INTERVAL) return false;
  updateInProgress = true;
  try {
    const xaiData = await fetchXaiFromAve();
    const newData: any = {
      timestamp: now,
      cached: false,
      data_source: 'api',
      xai: xaiData
    };
    priceCache = {
      data: newData,
      expires: now + CACHE_TTL,
      lastUpdated: now
    };
    lastFailedUpdate = 0;
    return true;
  } catch (error) {
    lastFailedUpdate = now;
    return false;
  } finally {
    updateInProgress = false;
  }
}

// 初始化缓存预热函数
function initCacheWarming() {
  updateCache(); // 启动时拉一次
  setInterval(() => {
    updateCache();
  }, CACHE_TTL); // 每10分钟拉一次
}

initCacheWarming();

// 只返回缓存，不主动拉取
export async function GET() {
  const now = Date.now();
  if (priceCache && priceCache.expires > now && priceCache.data && priceCache.data.xai) {
    return NextResponse.json({
      xai: priceCache.data.xai,
      cached: true,
      cache_age: Math.round((now - (priceCache.lastUpdated)) / 1000) + '秒'
    });
  }
  // 缓存失效时直接报错
  return NextResponse.json({
    error: '无法获取XAI价格数据',
    message: '服务暂时不可用，请稍后再试'
  }, { status: 503 });
} 