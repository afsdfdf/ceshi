import { NextRequest, NextResponse } from 'next/server';
import { API_PROXY_CONFIG, getProxyRequestConfig } from '@/lib/api-proxy-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seed = searchParams.get('seed') || 'default';
    
    // 使用配置的超时和请求设置
    const config = getProxyRequestConfig(API_PROXY_CONFIG.avatar.timeout);
    
    // 代理请求到dicebear API
    const response = await fetch(`${API_PROXY_CONFIG.avatar.original}?seed=${seed}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const svgContent = await response.text();
    
    // 返回SVG内容，设置正确的Content-Type和缓存
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${Math.floor(API_PROXY_CONFIG.avatar.cacheTime / 1000)}`,
      },
    });
    
  } catch (error) {
    console.error('Avatar proxy error:', error);
    
    // 如果代理失败，返回一个默认的SVG头像
    const defaultSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="#6B7280"/>
        <circle cx="50" cy="40" r="15" fill="#F3F4F6"/>
        <circle cx="50" cy="70" r="20" fill="#F3F4F6"/>
      </svg>
    `;
    
    return new NextResponse(defaultSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600', // 1小时缓存
      },
    });
  }
} 