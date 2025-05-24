import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../api/lib/constants';
import { executeWithRateLimit } from '../../api/lib/rate-limiter';

/**
 * GET handler
 * Fetch token details from Ave.ai API
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  
  console.log(`[token-details] 开始获取代币详情 ${chain}:${address}`);
  
  // Validate parameters
  if (!address || !chain) {
    return NextResponse.json({
      success: false,
      error: "Missing required parameters: address and chain"
    }, { status: 400 });
  }
  
  // 专门处理XAI代币
  if (address.toLowerCase() === '0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6' && chain.toLowerCase() === 'bsc') {
    console.log('[token-details] 检测到XAI代币请求，使用DEX Screener API');
    
    try {
      // XAI代币的备用数据
      const xaiBackupData = {
        success: true,
        symbol: 'XAI',
        name: '𝕏AI',
        address: '0x1c864C55F0c5E0014e2740c36a1F2378BFabD487',
        logo: 'https://assets.coingecko.com/coins/images/31166/standard/XAI_logo.png',
        price: 0.00005238,
        priceChange: 21.38,
        priceChange24h: 21.38,
        volume24h: 3574.71,
        marketCap: 108030,
        fdv: 108029,
        totalSupply: 1000000000,
        holders: 1782,
        chain: 'bsc',
        website: 'https://xai-x.life',
        twitter: 'https://x.com/AI7872853070301?t=FbVMCb0gpkQAEqa5WP44fA&s=09',
        telegram: 'https://t.me/XAIEnglish',
        created_at: 1733148144000,
        risk_score: 35,
        buy_tx: 93,
        sell_tx: 19,
        locked_percent: 27.5,
        burn_amount: 0
      };
      
      console.log('[token-details] 直接从交易对获取𝕏AI最新价格数据');
      
      // 直接使用交易对URL获取𝕏AI数据
      try {
        const pairUrl = 'https://api.dexscreener.com/latest/dex/pairs/bsc/0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6';
        console.log(`[token-details] 请求URL: ${pairUrl}`);
        
        const response = await fetch(pairUrl, {
          headers: { 'Accept': '*/*' },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data && data.pair) {
            console.log('[token-details] 成功获取𝕏AI交易对数据');
            const pair = data.pair;
            
            // 更新价格和其他数据
            if (pair.priceUsd) {
              xaiBackupData.price = parseFloat(pair.priceUsd);
              console.log(`[token-details] 最新价格: $${pair.priceUsd}`);
            }
            
            if (pair.priceChange && pair.priceChange.h24 !== undefined) {
              xaiBackupData.priceChange = pair.priceChange.h24;
              xaiBackupData.priceChange24h = pair.priceChange.h24;
              console.log(`[token-details] 24h价格变化: ${pair.priceChange.h24}%`);
            }
            
            if (pair.volume && pair.volume.h24) {
              xaiBackupData.volume24h = pair.volume.h24;
              console.log(`[token-details] 24h交易量: ${pair.volume.h24}`);
            }
            
            if (pair.fdv) {
              xaiBackupData.fdv = pair.fdv;
              console.log(`[token-details] 完全稀释市值: ${pair.fdv}`);
            }
            
            if (pair.marketCap) {
              xaiBackupData.marketCap = pair.marketCap;
              console.log(`[token-details] 市值: ${pair.marketCap}`);
            }
            
            if (pair.liquidity && pair.liquidity.usd) {
              xaiBackupData.locked_percent = (pair.liquidity.usd / xaiBackupData.marketCap) * 100;
              console.log(`[token-details] 流动性占比: ${xaiBackupData.locked_percent}%`);
            }
            
            // 更新社交媒体链接
            if (pair.info) {
              if (pair.info.websites && pair.info.websites.length > 0) {
                xaiBackupData.website = pair.info.websites[0].url;
              }
              
              if (pair.info.socials) {
                for (const social of pair.info.socials) {
                  if (social.type === 'twitter') {
                    xaiBackupData.twitter = social.url;
                  } else if (social.type === 'telegram') {
                    xaiBackupData.telegram = social.url;
                  }
                }
              }
            }
            
            // 获取交易数据
            if (pair.txns && pair.txns.h24) {
              xaiBackupData.buy_tx = pair.txns.h24.buys || xaiBackupData.buy_tx;
              xaiBackupData.sell_tx = pair.txns.h24.sells || xaiBackupData.sell_tx;
            }
            
            console.log('[token-details] 成功更新𝕏AI数据');
          }
        } else {
          console.log(`[token-details] 获取交易对数据失败，状态码: ${response.status}`);
        }
      } catch (error) {
        console.error('[token-details] 获取𝕏AI交易对数据出错:', error);
      }
      
      // 尝试从Ave API获取持有人、总供应量等额外数据
      try {
        console.log('[token-details] 尝试从Ave API获取XAI补充数据');
        const aveUrl = `https://prod.ave-api.com/v2/tokens/${address}-${chain}`;
        
        const response = await fetch(aveUrl, {
          headers: {
            'Accept': '*/*',
            'X-API-KEY': AVE_API_KEY
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[token-details] Ave API响应成功，提取补充数据');
          
          // 处理API响应
          let tokenData: any = null;
          
          if (data.data && data.data.token) {
            tokenData = data.data.token;
          } else if (data.data) {
            tokenData = data.data;
          } else if (data.token) {
            tokenData = data.token;
          } else if (data.success && data.symbol) {
            tokenData = data;
          }
          
          if (tokenData) {
            // 仅更新持有人数量和其他非价格相关数据
            if (tokenData.holders) {
              xaiBackupData.holders = parseInt(tokenData.holders) || xaiBackupData.holders;
              console.log(`[token-details] 更新持有人数量: ${xaiBackupData.holders}`);
            }
            
            if (tokenData.total) {
              xaiBackupData.totalSupply = parseFloat(tokenData.total) || xaiBackupData.totalSupply;
              console.log(`[token-details] 更新总供应量: ${xaiBackupData.totalSupply}`);
            }
          }
        }
      } catch (error) {
        console.error('[token-details] 从Ave API获取XAI补充数据出错:', error);
      }
      
      return NextResponse.json(xaiBackupData);
    } catch (error) {
      console.error('[token-details] 处理XAI代币出错:', error);
      return NextResponse.json({
        success: false,
        error: '获取𝕏AI代币详情失败',
        message: error instanceof Error ? error.message : '未知错误'
      }, { status: 500 });
    }
  }
  
  // 处理交易对数据，提取价格信息并更新XAI数据
  async function processXaiPairs(pairs: any[], xaiData: any): Promise<boolean> {
    try {
      // 首先找BSC链上的𝕏AI代币
      let filteredPairs = pairs.filter(pair => 
        pair.chainId === 'bsc' && 
        pair.baseToken && (
          (pair.baseToken.name && pair.baseToken.name.includes('𝕏AI')) ||
          pair.baseToken.symbol === '𝕏AI'
        )
      );
      
      // 如果没找到，尝试BSC链上的XAI代币
      if (filteredPairs.length === 0) {
        filteredPairs = pairs.filter(pair => 
          pair.chainId === 'bsc' && 
          pair.baseToken && (
            pair.baseToken.address.toLowerCase() === '0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6' ||
            pair.baseToken.symbol === 'XAI' ||
            (pair.baseToken.name && pair.baseToken.name.includes('XAI'))
          )
        );
      }
      
      // 如果BSC链上没找到，使用任何链上的相关代币
      if (filteredPairs.length === 0) {
        filteredPairs = pairs.filter(pair => 
          pair.baseToken && (
            (pair.baseToken.name && (
              pair.baseToken.name.includes('𝕏AI') || 
              pair.baseToken.name.includes('XAI')
            )) ||
            pair.baseToken.symbol === '𝕏AI' ||
            pair.baseToken.symbol === 'XAI'
          )
        );
      }
      
      if (filteredPairs.length === 0) {
        console.log('[token-details] 没有找到相关的交易对');
        return false;
      }
      
      // 按流动性排序
      const sortedPairs = [...filteredPairs].sort((a, b) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      );
      
      const mainPair = sortedPairs[0];
      console.log(`[token-details] 选择交易对: ${mainPair.baseToken.symbol}/${mainPair.quoteToken.symbol} 在 ${mainPair.chainId} 链上`);
      
      // 更新价格数据
      if (mainPair.priceUsd) {
        xaiData.price = parseFloat(mainPair.priceUsd);
        console.log(`[token-details] 最新价格: $${mainPair.priceUsd}`);
      }
      
      // 更新其他数据
      if (mainPair.priceChange && mainPair.priceChange.h24 !== undefined) {
        xaiData.priceChange = mainPair.priceChange.h24;
        xaiData.priceChange24h = mainPair.priceChange.h24;
        console.log(`[token-details] 24h价格变化: ${mainPair.priceChange.h24}%`);
      }
      
      if (mainPair.volume && mainPair.volume.h24) {
        xaiData.volume24h = mainPair.volume.h24;
        console.log(`[token-details] 24h交易量: ${mainPair.volume.h24}`);
      }
      
      if (mainPair.fdv) {
        xaiData.marketCap = mainPair.fdv;
        console.log(`[token-details] 市值: ${mainPair.fdv}`);
      }
      
      if (mainPair.liquidity && mainPair.liquidity.usd) {
        xaiData.locked_percent = (mainPair.liquidity.usd / xaiData.marketCap) * 100;
        console.log(`[token-details] 流动性占比: ${xaiData.locked_percent}%`);
      }
      
      console.log('[token-details] 成功更新𝕏AI数据');
      return true;
    } catch (error) {
      console.error('[token-details] 处理交易对数据出错:', error);
      return false;
    }
  }
  
  // 尝试多种API URL格式
  const apiFormats = [
    {
      url: `https://prod.ave-api.com/v2/tokens/${address}-${chain}`,
      description: '主要API格式'
    },
    {
      url: `https://prod.ave-api.com/v2/tokens?token=${address}&chain=${chain}`,
      description: '备用URL格式1'
    },
    {
      url: `https://prod.ave-api.com/v2/token/${chain}/${address}`,
      description: '备用URL格式2'
    }
  ];
  
  let lastError: any = null;
  let apiResponseData = null;
  
  try {
    // 使用速率限制器执行API请求
    for (const format of apiFormats) {
      try {
        console.log(`[token-details] 尝试${format.description}: ${format.url}`);
        
        const response = await fetch(format.url, {
          headers: {
            'Accept': '*/*',
            'X-API-KEY': AVE_API_KEY
          },
          cache: 'no-store',
          // 增加超时以避免长时间等待
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          console.log(`[token-details] ${format.description}请求失败，状态码: ${response.status}`);
          
          // 特别处理速率限制错误
          if (response.status === 429) {
            console.log(`[token-details] 遇到速率限制，等待5秒`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          continue; // 尝试下一个格式
        }
        
        const data = await response.json();
        console.log(`[token-details] ${format.description}响应: `, JSON.stringify(data).substring(0, 200) + '...');
        
        // 检查响应格式并处理不同的响应结构
        let tokenData: any = null;
        
        if (data.data && data.data.token) {
          // 新格式 - 从示例API响应中看到的结构
          tokenData = data.data.token;
          console.log(`[token-details] 使用新的响应格式 data.data.token`);
        } else if (data.data) {
          // 标准格式
          tokenData = data.data;
          console.log(`[token-details] 使用标准响应格式 data.data`);
        } else if (data.token) {
          // 另一种可能的格式
          tokenData = data.token;
          console.log(`[token-details] 使用直接响应格式 data.token`);
        } else if (data.success && data.symbol) {
          // 直接包含字段的格式
          tokenData = data;
          console.log(`[token-details] 使用包含所有字段的响应格式`);
        } else if (data.status === 1 && data.data) {
          // 带status字段的格式
          if (data.data.token) {
            tokenData = data.data.token;
            console.log(`[token-details] 使用status响应格式的token字段`);
          } else {
            tokenData = data.data;
            console.log(`[token-details] 使用status响应格式的data字段`);
          }
        } else {
          console.log(`[token-details] ${format.description}响应格式无法识别`, data);
          continue;
        }
        
        if (!tokenData) {
          console.log(`[token-details] ${format.description}未能提取有效的代币数据`);
          continue;
        }
        
        // 保存API响应数据并退出循环
        apiResponseData = tokenData;
        break;
      } catch (error) {
        console.error(`[token-details] ${format.description}请求出错:`, error);
        lastError = error;
      }
    }
    
    // 所有格式尝试后还没有数据，抛出错误
    if (!apiResponseData) {
      throw lastError || new Error('所有API格式尝试均失败');
    }
    
    // 确保必要字段存在，处理真实的API数据
    const processedData = {
      success: true,
      symbol: apiResponseData.symbol || 'N/A',
      name: apiResponseData.name || 'Unknown',
      address: apiResponseData.token || address,
      logo: apiResponseData.logo_url || '',
      chain: apiResponseData.chain || chain,
      // 按照API响应格式匹配字段
      price: parseFloat(apiResponseData.current_price_usd) || 0,
      priceChange: parseFloat(apiResponseData.price_change_1d) || 0,
      priceChange24h: parseFloat(apiResponseData.price_change_24h) || 0,
      volume24h: parseFloat(apiResponseData.tx_volume_u_24h) || 0,
      marketCap: parseFloat(apiResponseData.market_cap) || 0,
      totalSupply: parseFloat(apiResponseData.total) || 0,
      holders: parseInt(apiResponseData.holders) || 0,
      // 额外字段
      website: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'website') : '',
      twitter: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'twitter') : '',
      telegram: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'telegram') : '',
      created_at: apiResponseData.created_at || 0,
      risk_score: apiResponseData.risk_score || 0,
      risk_level: apiResponseData.risk_level || 0,
      launch_at: apiResponseData.launch_at || 0,
      buy_tx: parseFloat(apiResponseData.buy_tx) || 0,
      sell_tx: parseFloat(apiResponseData.sell_tx) || 0,
      locked_percent: parseFloat(apiResponseData.locked_percent) || 0,
      burn_amount: parseFloat(apiResponseData.burn_amount) || 0,
    };
    
    console.log(`[token-details] 成功获取代币详情，返回处理后的数据`);
    console.log(JSON.stringify(processedData).substring(0, 200) + '...');
    
    // 返回成功的响应
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('[token-details] 获取代币详情失败:', error);
    
    // 返回错误响应，不返回模拟数据
    return NextResponse.json({
      success: false,
      error: '获取代币详情失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * 从appendix JSON字符串中提取特定字段
 */
function extractFromAppendix(appendixStr: string, field: string): string {
  try {
    const appendix = JSON.parse(appendixStr);
    return appendix[field] || '';
  } catch (e) {
    console.error('解析appendix字段失败:', e);
    return '';
  }
} 