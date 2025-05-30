import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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
    logger.warn('缺少symbol参数', { component: 'PricesAPI', action: 'GET' });
    return NextResponse.json({
      success: false,
      error: "Missing required parameter: symbol"
    }, { status: 400 });
  }
  
  logger.info('价格查询请求', { symbol }, { component: 'PricesAPI', action: 'GET' });
  
  // 处理XAI代币
  if (symbol === 'XAI') {
    try {
      logger.debug('开始从DEX Screener获取XAI价格数据', { component: 'PricesAPI', action: 'GET' });
      
      // 直接使用交易对地址获取𝕏AI数据 - 这是最可靠的方法
      const pairUrl = 'https://api.dexscreener.com/latest/dex/pairs/bsc/0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6';
      logger.debug('请求DEX Screener', { url: pairUrl }, { component: 'PricesAPI', action: 'GET' });
      
      const response = await fetch(pairUrl, {
        headers: {
          'Accept': '*/*'
        },
        cache: 'no-store', // 不缓存
        signal: AbortSignal.timeout(15000) // 15秒超时
      });
      
      // 记录响应状态
      logger.debug('DEX Screener响应', { status: response.status }, { component: 'PricesAPI', action: 'GET' });
      
      if (!response.ok) {
        const errorBody = await response.text();
        logger.error('DEX Screener错误响应', { status: response.status, errorBody }, { component: 'PricesAPI', action: 'GET' });
        
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
        
        logger.info('返回XAI备用价格数据', { component: 'PricesAPI', action: 'GET' });
        return NextResponse.json(fallbackData);
      }
      
      const data = await response.json();
      logger.debug('DEX Screener响应成功', { keys: Object.keys(data).join(', ') }, { component: 'PricesAPI', action: 'GET' });
      
      // 确保有pair数据
      if (!data.pair) {
        logger.error('DEX Screener没有返回pair数据', { data }, { component: 'PricesAPI', action: 'GET' });
        throw new Error('DEX Screener没有返回pair数据');
      }
      
      const pair = data.pair;
      logger.debug('找到𝕏AI交易对', { 
        symbol: `${pair.baseToken.symbol}/${pair.quoteToken.symbol}`, 
        dex: pair.dexId 
      }, { component: 'PricesAPI', action: 'GET' });
      
      // 检查必要字段是否存在
      if (!pair.priceUsd) {
        logger.error('DEX Screener响应中缺少价格数据', { pair }, { component: 'PricesAPI', action: 'GET' });
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
      
      logger.info('XAI价格获取成功', { price: priceData.current_price_usd }, { component: 'PricesAPI', action: 'GET' });
      return NextResponse.json(priceData);
      
    } catch (error) {
      logger.error('获取XAI价格失败', error, { component: 'PricesAPI', action: 'GET' });
      
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
      
      logger.info('返回XAI备用价格数据', { component: 'PricesAPI', action: 'GET' });
      return NextResponse.json(fallbackData);
    }
  }
  
  // 对于其他代币，目前返回未实现错误
  logger.warn('不支持的代币', { symbol }, { component: 'PricesAPI', action: 'GET' });
  return NextResponse.json({
    success: false,
    error: `价格API暂不支持${symbol}代币`
  }, { status: 501 });
} 