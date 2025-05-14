import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

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
    
    let apiUrl: string
    
    // 选择合适的API端点
    if (chain === 'bsc') {
      // 使用BSC链上API获取代币信息
      apiUrl = `https://api.pancakeswap.info/api/v2/tokens/${token}`
    } else {
      // 如需支持其他链可以在这里添加
      return NextResponse.json({ 
        error: `Unsupported chain: ${chain}` 
      }, { status: 400 })
    }
    
    // 获取代币数据
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    
    const data = await response.json()
    
    // 处理不同API的响应格式
    let formattedData
    
    if (chain === 'bsc') {
      const tokenData = data.data
      
      // PancakeSwap API响应格式调整
      formattedData = {
        symbol: tokenData.symbol,
        name: tokenData.name,
        current_price_usd: parseFloat(tokenData.price),
        price_change_24h: parseFloat(tokenData.price_change_percentage_24h),
        logo_url: `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token}/logo.png`,
        chain: 'bsc'
      }
    }
    
    return NextResponse.json({
      success: true,
      data: formattedData
    })
    
  } catch (error) {
    console.error('Error fetching token data:', error)
    
    // 尝试使用备选API
    try {
      const searchParams = request.nextUrl.searchParams
      const token = searchParams.get('token')
      const chain = searchParams.get('chain')
      
      // 备选API - 使用1inch API
      const fallbackResponse = await fetch(`https://api.1inch.io/v5.0/56/tokens/${token}`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store'
      })
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        
        return NextResponse.json({
          success: true,
          data: {
            symbol: fallbackData.symbol,
            name: fallbackData.name,
            current_price_usd: 0, // 1inch API不提供价格数据
            price_change_24h: 0,  // 1inch API不提供价格变化数据
            logo_url: fallbackData.logoURI || `https://assets-cdn.trustwallet.com/blockchains/smartchain/assets/${token}/logo.png`,
            chain: 'bsc',
            decimals: fallbackData.decimals
          },
          source: 'fallback'
        })
      }
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError)
    }
    
    // 如果主API和备选API都失败，返回一个错误响应
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch token data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 