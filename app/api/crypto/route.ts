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
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API返回错误: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 处理API返回的数据
      return NextResponse.json({
        success: true,
        data: {
          popularTokens: data.popular || [],
          trendingTokens: data.trending || [],
          newTokens: data.new || []
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
    
  } catch (error) {
    console.error('API Error:', error);
    
    // 返回模拟数据
    return NextResponse.json({
      success: true,
      data: {
        popularTokens: generateMockTokens(5, 'Popular'),
        trendingTokens: generateMockTokens(5, 'Trending'),
        newTokens: generateMockTokens(5, 'New')
      },
      mock: true
    });
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