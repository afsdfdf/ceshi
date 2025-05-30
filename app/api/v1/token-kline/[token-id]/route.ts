import { NextRequest, NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../../lib/constants';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'token-id': string }> }
) {
  const resolvedParams = await params;
  const tokenId = resolvedParams['token-id'];
  
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get('interval') || '1h';
  const limit = searchParams.get('limit') || '100';
  
  const klineUrl = `https://prod.ave-api.com/v2/tokens/kline/${tokenId}?interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(klineUrl, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${AVE_API_KEY}`
      }
    });

    if (!response.ok) {
      logger.error('AVE KLine API 请求失败', { status: response.status, tokenId }, { component: 'TokenKlineAPI', action: 'GET' });
      return NextResponse.json({ error: 'Failed to fetch KLine data' }, { status: response.status });
    }

    const result = await response.json();

    if (result.status !== 1 || !result.data || !result.data.points) {
      logger.error('AVE KLine API 返回无效数据', { result }, { component: 'TokenKlineAPI', action: 'GET' });
      return NextResponse.json({ error: 'Invalid data from KLine API' }, { status: 500 });
    }

    // Reformat data if necessary, based on frontend requirements
    // Assuming frontend expects an array of objects with {open, high, low, close, volume, timestamp}
    const formattedData = result.data.points.map((p: any) => ({
      open: parseFloat(p.open),
      high: parseFloat(p.high),
      low: parseFloat(p.low),
      close: parseFloat(p.close),
      volume: parseFloat(p.volume),
      timestamp: p.time // Already in Unix epoch seconds
    }));

    return NextResponse.json(formattedData);

  } catch (error) {
    logger.error('获取KLine数据时出错', error, { component: 'TokenKlineAPI', action: 'GET' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 