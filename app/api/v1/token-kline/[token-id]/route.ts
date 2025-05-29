import { NextRequest, NextResponse } from 'next/server';

const AVE_API_KEY = "NMUuJmYHJB6d91bIpgLqpuLLKYVws82lj0PeDP3UEb19FoyWFJUVGLsgE95XTEmA"; // 硬编码私钥

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ 'token-id': string }> }
) {
  const resolvedParams = await params;
  const tokenId = resolvedParams['token-id'];
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get('interval') || '60'; // Default to 60 minutes
  const size = searchParams.get('size') || '200'; // Default to 200 data points

  if (!tokenId) {
    return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
  }

  const klineUrl = `https://prod.ave-api.com/v2/klines/token/${tokenId}?interval=${interval}&size=${size}`;

  try {
    const response = await fetch(klineUrl, {
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${AVE_API_KEY}`
      }
    });

    if (!response.ok) {
      console.error(`AVE KLine API request failed: ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch KLine data' }, { status: response.status });
    }

    const result = await response.json();

    if (result.status !== 1 || !result.data || !result.data.points) {
      console.error('AVE KLine API returned invalid data:', result);
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
    console.error('Error fetching KLine data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 