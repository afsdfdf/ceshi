"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface MainstreamToken {
  symbol: string
  name: string
  price: number
  priceChange24h: number
  logoUrl: string
}

interface MainstreamTokensProps {
  darkMode: boolean
}

export function MainstreamTokens({ darkMode }: MainstreamTokensProps) {
  const [tokens, setTokens] = useState<MainstreamToken[]>([])
  const [loading, setLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark" || darkMode

  useEffect(() => {
    const fetchMainstreamTokens = async () => {
      try {
        setLoading(true)
        
        // 获取主流币数据，使用缓存并每5分钟更新一次
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h', {
          next: { revalidate: 300 }, // 5分钟缓存
        })
        
        if (!response.ok) {
          throw new Error(`CoinGecko API failed with status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // 获取XAI代币价格数据
        let xaiData = null
        let xaiError = null
        
        try {
          // 优先使用专用价格API端点
          console.log('尝试从专用API获取XAI代币数据');
          const xaiApiUrl = '/api/prices?symbol=XAI';
          
          // 添加随机参数避免缓存
          const timestamp = Date.now();
          const fullUrl = `${xaiApiUrl}&_t=${timestamp}`;
          
          const xaiResponse = await fetch(fullUrl, {
            cache: 'no-store', // 确保获取最新数据
            next: { revalidate: 0 } // 禁用缓存
          });
          
          if (xaiResponse.ok) {
            const responseData = await xaiResponse.json();
            console.log('XAI专用API响应:', responseData);
            
            if (responseData && responseData.success) {
              xaiData = {
                current_price_usd: responseData.current_price_usd.toString(),
                price_change_24h: responseData.price_change_24h.toString()
              };
              console.log('成功从专用API获取XAI数据:', xaiData);
            } else {
              throw new Error(`XAI专用API响应无效: ${JSON.stringify(responseData)}`);
            }
          } else {
            const errorText = await xaiResponse.text();
            console.error('XAI专用API请求失败:', errorText);
            throw new Error(`XAI专用API请求失败: ${xaiResponse.status}`);
          }
        } catch (apiError) {
          console.error('从专用API获取XAI数据失败:', apiError);
          
          // 如果专用API失败，尝试直接从DEX Screener获取
          try {
            // 尝试直接从DEX Screener获取XAI代币数据
            console.log('尝试从DEX Screener获取XAI代币数据');
            
            // 使用DEX Screener API - 参考文档: https://docs.dexscreener.com/api/reference
            const dexScreenerUrl = 'https://api.dexscreener.com/latest/dex/pairs/bsc/0x29a459fe1dbea8a156a4c4c53eea7189cf6183b6';
            const dexScreenerResponse = await fetch(dexScreenerUrl, {
              cache: 'no-store', // 确保获取最新数据
            });
            
            if (dexScreenerResponse.ok) {
              const dexScreenerData = await dexScreenerResponse.json();
              console.log('DEX Screener响应:', dexScreenerData);
              
              // 检查是否有交易对数据
              if (dexScreenerData.pairs && dexScreenerData.pairs.length > 0) {
                // 按流动性排序，选择流动性最高的交易对
                const sortedPairs = [...dexScreenerData.pairs].sort((a, b) => 
                  (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
                );
                
                const mainPair = sortedPairs[0];
                console.log(`找到XAI主交易对: ${mainPair.baseToken.symbol}/${mainPair.quoteToken.symbol}`);
                
                // 提取价格和价格变化
                if (mainPair.priceUsd && mainPair.priceChange) {
                  xaiData = {
                    current_price_usd: mainPair.priceUsd,
                    price_change_24h: mainPair.priceChange.h24 !== undefined ? mainPair.priceChange.h24.toString() : "0"
                  };
                  console.log('成功从DEX Screener获取XAI数据:', xaiData);
                }
              } else {
                console.log('DEX Screener没有返回交易对数据');
                throw new Error('DEX Screener没有返回交易对数据');
              }
            } else {
              console.error('DEX Screener请求失败:', await dexScreenerResponse.text());
              throw new Error(`DEX Screener请求失败: ${dexScreenerResponse.status}`);
            }
          } catch (dexError) {
            console.error('从DEX Screener获取XAI数据失败:', dexError);
            
            // 如果DEX Screener失败，尝试使用内部API
            try {
              // 作为备用，尝试与重试机制获取XAI数据
              const MAX_RETRIES = 3
              let retryCount = 0
              let retryDelay = 1000 // 初始重试延迟1秒
              
              while (retryCount < MAX_RETRIES && !xaiData) {
                try {
                  console.log(`尝试获取XAI代币数据 (尝试 ${retryCount + 1}/${MAX_RETRIES})`)
                  // 使用内部API获取XAI代币数据
                  const xaiTokenResponse = await fetch('/api/token-details?address=0x1c864C55F0c5E0014e2740c36a1F2378BFabD487&chain=bsc', {
                    next: { revalidate: 300 }, // 5分钟缓存
                    cache: 'no-store', // 确保获取最新数据
                  })
                  
                  if (xaiTokenResponse.ok) {
                    const responseData = await xaiTokenResponse.json()
                    console.log('XAI API 响应:', responseData)
                    
                    if (responseData && responseData.success) {
                      xaiData = {
                        current_price_usd: responseData.price?.toString() || "0",
                        price_change_24h: responseData.priceChange24h?.toString() || responseData.priceChange?.toString() || "0"
                      }
                      console.log('成功获取XAI数据:', xaiData)
                      break // 成功获取数据，跳出循环
                    } else {
                      throw new Error(`XAI API 响应无效: ${JSON.stringify(responseData)}`)
                    }
                  } else {
                    const errorText = await xaiTokenResponse.text()
                    throw new Error(`XAI API 请求失败 (${xaiTokenResponse.status}): ${errorText}`)
                  }
                } catch (err) {
                  xaiError = err
                  console.error(`获取XAI数据失败 (尝试 ${retryCount + 1}/${MAX_RETRIES}):`, err)
                  
                  // 增加重试计数
                  retryCount++
                  
                  // 如果还有重试次数，等待后再尝试
                  if (retryCount < MAX_RETRIES) {
                    console.log(`${retryDelay}毫秒后重试...`)
                    await new Promise(resolve => setTimeout(resolve, retryDelay))
                    // 指数退避延迟
                    retryDelay = Math.min(retryDelay * 2, 5000)
                  }
                }
              }
              
              // 所有重试都失败后记录最后的错误
              if (!xaiData && xaiError) {
                console.error('获取XAI数据失败，达到最大重试次数:', xaiError)
              }
            } catch (error) {
              console.error('获取XAI代币错误:', error)
            }
          }
        }
        
        const formattedTokens = data.map((token: any) => ({
          symbol: token.symbol.toUpperCase(),
          name: token.name,
          price: token.current_price,
          priceChange24h: token.price_change_percentage_24h,
          logoUrl: token.image
        }))
        
        // 添加XAI代币
        const xaiToken = {
          symbol: 'XAI',
          name: '𝕏AI',
          price: 0.00005238, // 更新为最新价格
          priceChange24h: 21.38,
          logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
        }
        
        // 如果有XAI数据，使用XAI数据
        if (xaiData) {
          console.log('使用获取的XAI数据:', xaiData)
          const price = parseFloat(xaiData.current_price_usd)
          const priceChange = parseFloat(xaiData.price_change_24h)
          
          // 检查数据是否有效
          if (!isNaN(price) && price > 0) {
            xaiToken.price = price
            console.log('设置XAI价格:', price)
          } else {
            console.warn('XAI价格数据无效:', xaiData.current_price_usd)
          }
          
          if (!isNaN(priceChange)) {
            xaiToken.priceChange24h = priceChange
            console.log('设置XAI价格变化:', priceChange)
          } else {
            console.warn('XAI价格变化数据无效:', xaiData.price_change_24h)
          }
        }
        
        formattedTokens.push(xaiToken)
        setTokens(formattedTokens)
      } catch (error) {
        console.error('获取主流代币错误:', error)
        // 回退数据
        setTokens([
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 68000,
            priceChange24h: -0.91,
            logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: 3500,
            priceChange24h: -1.2,
            logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
          },
          {
            symbol: 'BNB',
            name: 'Binance Coin',
            price: 652,
            priceChange24h: -1.6,
            logoUrl: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png'
          },
          {
            symbol: 'SOL',
            name: 'Solana',
            price: 175,
            priceChange24h: -1.44,
            logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
          },
          {
            symbol: 'XAI',
            name: '𝕏AI',
            price: 0.00005238,
            priceChange24h: 21.38,
            logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchMainstreamTokens()
    
    // 每5分钟刷新一次数据
    const intervalId = setInterval(fetchMainstreamTokens, 5 * 60 * 1000)
    
    return () => {
      clearInterval(intervalId)
    }
  }, [])
  
  // 格式化价格显示
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 0.01) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    } else if (price >= 0.000001) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
    } else {
      // 极小数值使用科学计数法
      return `$${price.toExponential(2)}`;
    }
  }
  
  // 格式化价格变化
  const formatPriceChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  }

  // 计算每个卡片宽度，平均分配空间
  const itemWidth = `calc(20% - 6px)`;  // 5个代币，每个占20%宽度，减去间距
  
  if (loading) {
    return (
      <div className={cn(
        "flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none py-1 px-1",
        "scroll-smooth w-full"
      )}>
        {[...Array(5)].map((_, index) => (
          <div key={index} 
            style={{ width: itemWidth }}
            className={cn(
            "h-10 rounded-md px-1 py-1 flex flex-col items-center justify-between",
            "animate-pulse",
            isDark 
              ? "bg-muted/40" 
              : "bg-muted/30"
          )}></div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn(
      "flex flex-nowrap gap-1.5 overflow-x-auto scrollbar-none py-1 px-1",
      "scroll-smooth snap-x w-full"
    )}>
      {tokens.map((token) => (
        <div 
          key={token.symbol}
          style={{ width: itemWidth }}
          className={cn(
            "h-10 rounded-md p-1 flex flex-col items-center justify-between snap-start",
            "border shadow-sm backdrop-blur-sm transition-all duration-150",
            token.priceChange24h >= 0
              ? isDark 
                ? "bg-emerald-500/10 border-emerald-500/20" 
                : "bg-emerald-500/10 border-emerald-500/20"
              : isDark
                ? "bg-rose-500/10 border-rose-500/20" 
                : "bg-rose-500/10 border-rose-500/20"
          )}
        >
          {/* Symbol + Price Change 上面一行 */}
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-semibold">{token.symbol}</span>
            <span className={cn(
              "text-[9px] font-semibold",
              token.priceChange24h >= 0 ? "text-emerald-500" : "text-rose-500"
            )}>
              {formatPriceChange(token.priceChange24h)}
            </span>
          </div>
          
          {/* Price 下面一行 */}
          <span className="text-[9px] font-medium truncate w-full text-center">
            {formatPrice(token.price)}
          </span>
        </div>
      ))}
    </div>
  )
}