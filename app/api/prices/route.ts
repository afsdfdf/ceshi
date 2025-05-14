import { NextResponse } from 'next/server';

// 定义接口
interface DexScreenerPair {
  chainId: string;
  baseToken: {
    address: string;
    symbol: string;
    name?: string;
  };
  quoteToken: {
    address: string;
    symbol: string;
  };
  priceUsd: string;
  priceChange?: {
    h24?: number;
  };
  volume?: {
    h24?: number;
  };
  liquidity?: {
    usd?: number;
  };
  dexId?: string;
}

/**
 * GET handler
 * Fetch token prices from DEX Screener API
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase();
  
  // 如果没有指定symbol，返回错误
  if (!symbol) {
    return NextResponse.json({
      success: false,
      error: "Missing required parameter: symbol"
    }, { status: 400 });
  }
  
  console.log(`[prices] 获取代币价格: ${symbol}`);
  
  // 处理XAI代币
  if (symbol === 'XAI') {
    try {
      console.log('[prices] 尝试从DEX Screener获取XAI价格数据');
      
      // 直接使用交易对地址获取𝕏AI数据 - 这是最可靠的方法
      const pairUrl = 'https://api.dexscreener.com/latest/dex/pairs/bsc/0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6';
      console.log(`[prices] 请求URL: ${pairUrl}`);
      
      const response = await fetch(pairUrl, {
        headers: {
          'Accept': '*/*'
        },
        cache: 'no-store', // 不缓存
        signal: AbortSignal.timeout(15000) // 15秒超时
      });
      
      // 记录响应状态
      console.log(`[prices] DEX Screener响应状态: ${response.status}`);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[prices] DEX Screener错误响应: ${errorBody}`);
        
        // 直接返回备用数据
        const fallbackData = {
          success: true,
          symbol: 'XAI',
          name: '𝕏AI',
          address: '0x1c864C55F0c5E0014e2740c36a1F2378BFabD487',
          chain: 'bsc',
          current_price_usd: 0.00005238,
          price_change_24h: 21.38,
          volume_24h: 3574.71,
          liquidity_usd: 28661.39,
          updated_at: new Date().toISOString(),
          source: 'fallback',
          note: '由于API请求失败，返回备用数据'
        };
        
        console.log('[prices] 返回XAI备用价格数据');
        return NextResponse.json(fallbackData);
      }
      
      const data = await response.json();
      console.log('[prices] DEX Screener响应成功，数据结构:', Object.keys(data).join(', '));
      
      // 确保有pair数据
      if (!data.pair) {
        console.error('[prices] DEX Screener没有返回pair数据:', data);
        throw new Error('DEX Screener没有返回pair数据');
      }
      
      const pair = data.pair;
      console.log(`[prices] 找到𝕏AI交易对: ${pair.baseToken.symbol}/${pair.quoteToken.symbol} (${pair.dexId})`);
      
      // 检查必要字段是否存在
      if (!pair.priceUsd) {
        console.error('[prices] DEX Screener响应中缺少价格数据:', pair);
        throw new Error('DEX Screener响应中缺少价格数据');
      }
      
      // 构建响应数据
      const priceData = {
        success: true,
        symbol: 'XAI',
        name: '𝕏AI',
        address: pair.baseToken.address,
        chain: pair.chainId,
        current_price_usd: parseFloat(pair.priceUsd),
        price_change_24h: pair.priceChange?.h24 || 0,
        volume_24h: pair.volume?.h24 || 0,
        liquidity_usd: pair.liquidity?.usd || 0,
        market_cap: pair.marketCap || 0,
        fdv: pair.fdv || 0,
        updated_at: new Date().toISOString(),
        source: 'dexscreener_pair',
        pair: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`,
        dex: pair.dexId || 'unknown',
        social: pair.info?.socials || []
      };
      
      console.log(`[prices] 𝕏AI价格: $${priceData.current_price_usd}`);
      return NextResponse.json(priceData);
      
    } catch (error) {
      console.error('[prices] 获取XAI价格失败:', error);
      
      // 返回备用数据
      const fallbackData = {
        success: true,
        symbol: 'XAI',
        name: '𝕏AI',
        address: '0x1c864C55F0c5E0014e2740c36a1F2378BFabD487',
        chain: 'bsc',
        current_price_usd: 0.00005238,
        price_change_24h: 21.38,
        volume_24h: 3574.71,
        liquidity_usd: 28661.39,
        updated_at: new Date().toISOString(),
        source: 'fallback',
        note: '由于API请求失败，返回备用数据'
      };
      
      console.log('[prices] 返回XAI备用价格数据');
      return NextResponse.json(fallbackData);
    }
  }
  
  // 对于其他代币，目前返回未实现错误
  return NextResponse.json({
    success: false,
    error: `价格API暂不支持${symbol}代币`
  }, { status: 501 });
} 