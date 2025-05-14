import { NextResponse } from "next/server";

// Set to dynamic to avoid static rendering issues
export const dynamic = 'force-dynamic';

// 处理GET请求
export async function GET() {
  try {
    // Check if we're in a production environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, we should use a remote API or mock data
    // For local development, we can try to use localhost
    let apiUrl = isProduction 
      ? process.env.CRYPTO_API_URL || 'https://api.example.com/api/home' 
      : 'http://localhost:5000/api/home';
    
    // 尝试从API获取数据
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        signal: controller.signal,
        cache: 'no-store'
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        return NextResponse.json({
          success: true,
          data,
          source: 'api'
        });
      } else {
        throw new Error(`API返回错误状态: ${response.status}`);
      }
    } catch (error) {
      console.error('API请求错误:', error);
      
      // 超时或者请求失败，使用模拟数据
      return NextResponse.json({
        success: true,
        data: {
          btc: {
            price: 67850,
            change: 1.2
          },
          eth: {
            price: 3205,
            change: 0.8
          }
        },
        source: 'mock'
      });
    }
  } catch (error) {
    console.error('处理请求时出错:', error);
    
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}

// 生成模拟代币数据
function generateMockTokens(count, prefix) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix.toLowerCase()}-token-${i+1}`,
    name: `${prefix} Token ${i+1}`,
    symbol: `${prefix.substring(0, 1)}TK${i+1}`,
    price: Math.random() * 1000,
    change24h: (Math.random() * 20) - 10,
    volume24h: Math.random() * 1000000,
    marketCap: Math.random() * 10000000,
    logo: `https://example.com/logo/${prefix.toLowerCase()}-${i+1}.png`
  }));
} 