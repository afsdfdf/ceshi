import { NextRequest, NextResponse } from 'next/server'
import { API_PROXY_CONFIG, getProxyRequestConfig } from '@/lib/api-proxy-config'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// 简单的内存缓存
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

function getCacheKey(token: string, chain: string): string {
  return `${chain}:${token}`
}

async function fetchWithTimeout(url: string, options: any = {}) {
  const config = getProxyRequestConfig(API_PROXY_CONFIG.prices.oneInch.timeout)
  return fetch(url, { ...config, ...options })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const chain = searchParams.get('chain')
    
    if (!token || !chain) {
      return NextResponse.json({ 
        error: 'Missing required parameters: token and chain' 
      }, { status: 400 })
    }
    
    const cacheKey = getCacheKey(token, chain)
    const now = Date.now()
    
    // 检查缓存
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > now) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true
      })
    }
    
    let apiUrl: string
    let formattedData: any
    
    // 选择合适的API端点
    if (chain === 'bsc') {
      // 尝试主要API - PancakeSwap
      try {
        apiUrl = `https://api.pancakeswap.info/api/v2/tokens/${token}`
        const response = await fetchWithTimeout(apiUrl, {
          headers: { 'Accept': 'application/json' },
        })
        
        if (response.ok) {
          const data = await response.json()
          const tokenData = data.data
          
          formattedData = {
            symbol: tokenData.symbol,
            name: tokenData.name,
            current_price_usd: parseFloat(tokenData.price || '0'),
            price_change_24h: parseFloat(tokenData.price_change_percentage_24h || '0'),
            logo_url: `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token}/logo.png`,
            chain: 'bsc',
            source: 'pancakeswap'
          }
        }
      } catch (error) {
        logger.debug('PancakeSwap API 失败，尝试备选方案', { component: 'TokenInfoAPI', action: 'GET' });
      }
      
      // 如果主要API失败，使用备选API - 1inch
      if (!formattedData) {
        try {
          const fallbackUrl = `https://api.1inch.io/v5.0/56/tokens/${token}`
          const fallbackResponse = await fetchWithTimeout(fallbackUrl, {
            headers: { 'Accept': 'application/json' },
          })
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            
            formattedData = {
              symbol: fallbackData.symbol,
              name: fallbackData.name,
              current_price_usd: 0, // 1inch API不提供价格数据
              price_change_24h: 0,  // 1inch API不提供价格变化数据
              logo_url: fallbackData.logoURI || `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token}/logo.png`,
              chain: 'bsc',
              decimals: fallbackData.decimals,
              source: 'oneInch_fallback'
            }
          }
        } catch (fallbackError) {
          logger.error('所有API都失败', fallbackError, { component: 'TokenInfoAPI', action: 'GET' });
        }
      }
    } else {
      return NextResponse.json({ 
        error: `Unsupported chain: ${chain}` 
      }, { status: 400 })
    }
    
    if (!formattedData) {
      // 如果所有API都失败，返回基本信息
      formattedData = {
        symbol: 'UNKNOWN',
        name: `Token ${token.slice(0, 8)}...`,
        current_price_usd: 0,
        price_change_24h: 0,
        logo_url: `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token}/logo.png`,
        chain: chain,
        source: 'fallback_static'
      }
    }
    
    // 缓存结果
    cache.set(cacheKey, {
      data: formattedData,
      expires: now + CACHE_TTL
    })
    
    return NextResponse.json({
      success: true,
      data: formattedData
    })
    
  } catch (error) {
    logger.error('Token info API error', error, { component: 'TokenInfoAPI', action: 'GET' });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 