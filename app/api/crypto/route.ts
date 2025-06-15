import { NextResponse } from "next/server";

// 处理GET请求
export async function GET() {
  try {
    // 尝试从本地Python API获取数据
    const response = await fetch("http://localhost:5000/api/home", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
      // 设置较短的超时时间，避免长时间等待
      signal: AbortSignal.timeout(5000), // 增加到5秒
    });

    if (!response.ok) {
      throw new Error(`Python API返回错误: ${response.status}`);
    }

    const data = await response.json();
    
    // 验证数据格式
    if (!data || typeof data !== 'object') {
      throw new Error('Python API返回无效数据格式');
    }
    
    // 处理API返回的数据
    return NextResponse.json({
      success: true,
      data: {
        popularTokens: Array.isArray(data.popular) ? data.popular : [],
        trendingTokens: Array.isArray(data.trending) ? data.trending : [],
        newTokens: Array.isArray(data.new) ? data.new : []
      }
    });
  } catch (error) {
    console.error('Crypto API Error:', error);
    
    // 返回错误，不使用模拟数据
    return NextResponse.json({
      success: false,
      error: '暂时无法获取加密货币数据，请稍后重试',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
} 