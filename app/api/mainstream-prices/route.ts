import { NextResponse } from 'next/server';

// 缓存配置
const CACHE_TTL = 300 * 1000; // 5分钟缓存时间
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

// 从CoinGecko获取主流币数据
async function fetchMainstreamFromCoinGecko() {
  try {
    console.log('[mainstream-prices] 从CoinGecko获取主流币数据');
    
    // 使用免费API请求
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h',
      {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: AbortSignal.timeout(15000), // 增加超时时间到15秒
        next: { revalidate: 300 } // 5分钟的缓存
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API响应错误: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[mainstream-prices] CoinGecko返回数据:`, data && data.length ? `${data.length}个币` : '无数据');
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CoinGecko返回数据无效');
    }
    
    return data;
  } catch (error) {
    console.error('[mainstream-prices] 从CoinGecko获取数据失败:', error);
    
    // 备用方案: 尝试使用备用CoinGecko API镜像
    try {
      console.log('[mainstream-prices] 尝试使用CoinGecko API备用镜像');
      
      const backupResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true',
        {
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36'
          },
          signal: AbortSignal.timeout(15000)
        }
      );
      
      if (!backupResponse.ok) {
        throw new Error(`备用CoinGecko API响应错误: ${backupResponse.status}`);
      }
      
      const backupData = await backupResponse.json();
      
      if (!backupData || Object.keys(backupData).length === 0) {
        throw new Error('备用CoinGecko API返回数据无效');
      }
      
      // 转换为主API格式
      const formattedData = Object.entries(backupData).map(([id, data]: [string, any]) => {
        const symbol = id === 'bitcoin' ? 'btc' : 
                      id === 'ethereum' ? 'eth' : 
                      id === 'binancecoin' ? 'bnb' : 
                      id === 'solana' ? 'sol' : id;
                      
        return {
          id,
          symbol,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          current_price: data.usd,
          price_change_percentage_24h: data.usd_24h_change,
          market_cap: data.usd_market_cap,
          total_volume: data.usd_24h_vol,
          image: `https://cryptologos.cc/logos/${id}-${symbol}-logo.png`
        };
      });
      
      return formattedData;
    } catch (backupError) {
      console.error('[mainstream-prices] 备用CoinGecko API也失败:', backupError);
      
      // 使用最终的硬编码回退数据
      return [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 68000,
          price_change_percentage_24h: -0.91,
          market_cap: 1320000000000,
          total_volume: 25000000000,
          image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3500,
          price_change_percentage_24h: -1.2,
          market_cap: 420000000000,
          total_volume: 15000000000,
          image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
        },
        {
          id: 'binancecoin',
          symbol: 'bnb',
          name: 'Binance Coin',
          current_price: 652,
          price_change_percentage_24h: -1.6,
          market_cap: 100000000000,
          total_volume: 2000000000,
          image: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
        },
        {
          id: 'solana',
          symbol: 'sol',
          name: 'Solana',
          current_price: 175,
          price_change_percentage_24h: -1.44,
          market_cap: 75000000000,
          total_volume: 3000000000,
          image: 'https://cryptologos.cc/logos/solana-sol-logo.png'
        }
      ];
    }
  }
}

// 从DEX Screener获取XAI代币数据
async function fetchXaiFromDexScreener() {
  try {
    console.log('[mainstream-prices] 从DEX Screener获取XAI数据');
    const pairUrl = 'https://api.dexscreener.com/latest/dex/pairs/bsc/0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6';
    
    const response = await fetch(pairUrl, {
      headers: { 
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(15000), // 增加超时时间到15秒
      cache: 'no-store' // 强制不使用缓存
    });
    
    if (!response.ok) {
      throw new Error(`DEX Screener请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('DEX Screener没有返回交易对数据');
    }
    
    // 按流动性排序，选择流动性最高的交易对
    const sortedPairs = [...data.pairs].sort((a, b) => 
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    );
    
    const mainPair = sortedPairs[0];
    console.log(`[mainstream-prices] 找到XAI主交易对: ${mainPair.baseToken.symbol}/${mainPair.quoteToken.symbol}`);
    
    if (!mainPair.priceUsd) {
      throw new Error('DEX Screener返回的数据中没有价格信息');
    }
    
    return {
      symbol: 'XAI',
      name: '𝕏AI',
      current_price: parseFloat(mainPair.priceUsd),
      price_change_percentage_24h: mainPair.priceChange?.h24 !== undefined ? parseFloat(mainPair.priceChange.h24) : 0,
      image: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed',
      market_cap: mainPair.fdv || 0,
      volume_24h: mainPair.volume?.h24 || 0,
      liquidity_usd: mainPair.liquidity?.usd || 0
    };
  } catch (error) {
    console.error('[mainstream-prices] 从DEX Screener获取XAI数据失败:', error);
    
    // 尝试备用API获取XAI数据
    try {
      console.log('[mainstream-prices] 尝试从备用API获取XAI数据');
      const backupUrl = 'https://api.dextools.io/v1/token?chain=bsc&address=0x1c864c55f0c5e0014e2740c36a1f2378bfabd487';
      
      const backupResponse = await fetch(backupUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        if (backupData && backupData.data && backupData.data.price) {
          return {
            symbol: 'XAI',
            name: '𝕏AI',
            current_price: parseFloat(backupData.data.price),
            price_change_percentage_24h: backupData.data.priceChange?.h24 || 0,
            image: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed',
            market_cap: backupData.data.fdv || 0,
            volume_24h: backupData.data.volume || 0
          };
        }
      }
    } catch (backupError) {
      console.error('[mainstream-prices] 从备用API获取XAI数据也失败:', backupError);
    }
    
    // 如果所有API都失败，返回固定回退数据
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

// 获取所有价格数据并更新缓存
async function updateCache() {
  if (updateInProgress) {
    console.log('[mainstream-prices] 已有更新进程在运行，跳过本次更新');
    return false;
  }
  
  const now = Date.now();
  
  // 如果最近一次更新失败，限制重试频率
  if (lastFailedUpdate > 0 && now - lastFailedUpdate < RETRY_INTERVAL) {
    console.log(`[mainstream-prices] 最近一次更新失败，将在${Math.round((RETRY_INTERVAL - (now - lastFailedUpdate)) / 1000)}秒后重试`);
    return false;
  }
  
  updateInProgress = true;
  try {
    // 并行请求所有价格数据
    const [mainstreamData, xaiData] = await Promise.allSettled([
      fetchMainstreamFromCoinGecko(),
      fetchXaiFromDexScreener()
    ]);
    
    // 创建新的缓存数据对象
    const newData: any = {
      timestamp: now,
      cached: false,
      data_source: 'api' // 标记数据来源
    };
    
    // 处理主流币数据
    if (mainstreamData.status === 'fulfilled' && Array.isArray(mainstreamData.value) && mainstreamData.value.length > 0) {
      newData.mainstream = mainstreamData.value;
      console.log(`[mainstream-prices] 成功获取了${newData.mainstream.length}个主流币数据`);
    } else {
      // 如果获取失败但有缓存，保留上次缓存的主流币数据
      if (priceCache && priceCache.data && Array.isArray(priceCache.data.mainstream)) {
        newData.mainstream = priceCache.data.mainstream;
        newData.data_source = 'cache'; // 标记数据来源为缓存
        console.log('[mainstream-prices] 使用缓存的主流币数据');
      } else {
        console.error('[mainstream-prices] 无法获取主流币数据且无缓存可用');
        // 设置默认数据，不抛出错误以允许程序继续运行
        newData.mainstream = [
          {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            current_price: 68000,
            price_change_percentage_24h: -0.91,
            market_cap: 1320000000000,
            total_volume: 25000000000,
            image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
          },
          {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            current_price: 3500,
            price_change_percentage_24h: -1.2,
            market_cap: 420000000000,
            total_volume: 15000000000,
            image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
          },
          {
            id: 'binancecoin',
            symbol: 'bnb',
            name: 'Binance Coin',
            current_price: 652,
            price_change_percentage_24h: -1.6,
            market_cap: 100000000000,
            total_volume: 2000000000,
            image: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
          },
          {
            id: 'solana',
            symbol: 'sol',
            name: 'Solana',
            current_price: 175,
            price_change_percentage_24h: -1.44,
            market_cap: 75000000000,
            total_volume: 3000000000,
            image: 'https://cryptologos.cc/logos/solana-sol-logo.png'
          }
        ];
        newData.data_source = 'fallback'; // 标记数据来源为回退数据
        console.log('[mainstream-prices] 使用回退的主流币数据');
      }
    }
    
    // 处理XAI数据
    if (xaiData.status === 'fulfilled') {
      newData.xai = xaiData.value;
    } else {
      // 如果获取失败但有缓存，保留上次缓存的XAI数据
      if (priceCache && priceCache.data && priceCache.data.xai) {
        newData.xai = priceCache.data.xai;
        console.log('[mainstream-prices] 使用缓存的XAI数据');
      } else {
        console.error('[mainstream-prices] 无法获取XAI数据且无缓存可用');
        // 这里不阻断流程，设置默认XAI数据
        newData.xai = {
          symbol: 'XAI',
          name: '𝕏AI',
          current_price: 0.00005238,
          price_change_percentage_24h: 21.38,
          image: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed',
          market_cap: 10000000,
          volume_24h: 2500000,
          liquidity_usd: 5000000
        };
        console.log('[mainstream-prices] 使用回退的XAI数据');
      }
    }
    
    // 更新缓存
    priceCache = {
      data: newData,
      expires: now + CACHE_TTL,
      lastUpdated: now
    };
    
    console.log('[mainstream-prices] 缓存已更新，过期时间:', new Date(priceCache.expires).toISOString());
    lastFailedUpdate = 0; // 重置失败标记
    return true;
  } catch (error) {
    console.error('[mainstream-prices] 更新缓存失败:', error);
    lastFailedUpdate = now;
    return false;
  } finally {
    updateInProgress = false;
  }
}

// 初始化缓存预热函数
function initCacheWarming() {
  // 启动时立即更新缓存
  updateCache().then(success => {
    console.log(`[mainstream-prices] 初始缓存预热${success ? '成功' : '失败'}`);
  });
  
  // 设置定时器，每隔 CACHE_TTL/2 的时间自动刷新缓存
  // 这样可以确保缓存总是在过期前就被更新
  setInterval(() => {
    updateCache().then(success => {
      console.log(`[mainstream-prices] 定时缓存更新${success ? '成功' : '失败'}`);
    });
  }, CACHE_TTL / 2);
}

// 启动缓存预热
initCacheWarming();

export async function GET() {
  try {
    const now = Date.now();
    
    // 如果缓存有效，直接返回缓存
    if (priceCache && priceCache.expires > now) {
      console.log('[mainstream-prices] 返回缓存数据，过期时间:', new Date(priceCache.expires).toISOString());
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        cache_age: Math.round((now - (priceCache.lastUpdated)) / 1000) + '秒'
      });
    }
    
    console.log('[mainstream-prices] 缓存过期，尝试更新缓存');
    
    // 异步更新缓存但不等待
    // 这次请求依然使用旧缓存，下次请求将使用新缓存
    updateCache().catch(err => {
      console.error('[mainstream-prices] 后台更新缓存失败:', err);
    });
    
    // 即使缓存过期，也尝试返回旧缓存
    if (priceCache && priceCache.data) {
      console.log('[mainstream-prices] 返回过期缓存数据');
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        cache_expired: true,
        cache_age: Math.round((now - priceCache.lastUpdated) / 1000) + '秒'
      });
    }
    
    // 如果没有任何缓存可用，则等待缓存更新
    console.log('[mainstream-prices] 无缓存可用，等待更新...');
    const success = await updateCache();
    
    if (success && priceCache) {
      console.log('[mainstream-prices] 缓存更新成功，返回新数据');
      return NextResponse.json({
        ...priceCache.data,
        cached: false
      });
    }
    
    // 如果更新失败，返回错误
    return NextResponse.json({
      error: '无法获取价格数据',
      message: '服务暂时不可用，请稍后再试'
    }, { status: 503 });
    
  } catch (error) {
    console.error('[mainstream-prices] API处理错误:', error);
    
    // 如果发生错误但缓存有效，返回缓存数据
    if (priceCache && priceCache.data) {
      console.log('[mainstream-prices] 返回过期缓存数据作为回退');
      return NextResponse.json({
        ...priceCache.data,
        cached: true,
        cache_expired: true,
        error: 'API发生错误，返回过期缓存'
      });
    }
    
    // 无缓存可用，返回错误
    return NextResponse.json({
      error: '获取价格数据失败',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 