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
        
        // Default fallback data in case the fetch fails
        const fallbackTokens = [
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
            price: 185,
            priceChange24h: 2.4,
            logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.png'
          },
          {
            symbol: 'XAI',
            name: '𝕏AI',
            price: 0.00005238,
            priceChange24h: 21.38,
            logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
          }
        ]

        try {
          // First attempt - CoinGecko API
          const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h', {
            cache: 'no-store',
          })
          
          if (!response.ok) {
            throw new Error(`CoinGecko API failed with status: ${response.status}`)
          }
          
          const data = await response.json()
          
          // Process CoinGecko data
          const formattedTokens = data.map((token: any) => ({
            symbol: token.symbol.toUpperCase(),
            name: token.name,
            price: token.current_price,
            priceChange24h: token.price_change_percentage_24h,
            logoUrl: token.image
          }))
          
          // Add XAI token
          const xaiToken = {
            symbol: 'XAI',
            name: '𝕏AI',
            price: 0.00005238,
            priceChange24h: 21.38,
            logoUrl: 'https://dd.dexscreener.com/ds-data/tokens/bsc/0x1c864c55f0c5e0014e2740c36a1f2378bfabd487.png?key=d597ed'
          }
          
          formattedTokens.push(xaiToken)
          setTokens(formattedTokens)
        } catch (error) {
          console.error('CoinGecko API error:', error)
          
          // Use fallback data if CoinGecko fails
          setTokens(fallbackTokens)
        }
      } catch (error) {
        console.error('Error fetching mainstream tokens:', error)
        // Set fallback data if everything fails
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
            price: 185,
            priceChange24h: 2.4,
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
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
    } else if (price >= 0.01) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`
    } else if (price >= 0.000001) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`
    } else {
      return `$${price.toExponential(4)}`
    }
  }

  const formatPriceChange = (change: number) => {
    return change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`
  }

  return (
    <div className={cn(
      "mb-3 overflow-hidden",
      "mx-auto",
      "border-b pb-2",
      isDark ? "border-muted/30" : "border-muted/40"
    )}>
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2 py-1">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-md min-w-[80px] h-[90px]",
                "border transition-all duration-200 backdrop-blur-sm",
                "hover:scale-105 cursor-pointer",
                isDark 
                  ? "bg-card/30 border-muted/20 hover:bg-card/80 hover:border-muted/50 hover:shadow-md" 
                  : "bg-card/40 border-muted/30 hover:bg-card/90 hover:border-muted/50 hover:shadow-md"
              )}
            >
              <div className="relative w-8 h-8 mb-1">
                {token.logoUrl ? (
                  <img
                    src={token.logoUrl}
                    alt={token.name}
                    width={32}
                    height={32}
                    className="rounded-full object-contain"
                    onError={(e) => {
                      // In case the image fails to load, show a fallback
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-primary/50 flex items-center justify-center text-xs font-medium">
                    {token.symbol.substring(0, 2)}
                  </div>
                )}
              </div>
              
              <div className="text-xs font-semibold mb-0.5">{token.symbol}</div>
              
              <div className="text-xs font-medium text-muted-foreground mb-0.5">
                {formatPrice(token.price)}
              </div>
              
              <div className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-sm",
                token.priceChange24h >= 0 
                  ? (isDark ? "text-green-400 bg-green-500/10" : "text-green-600 bg-green-500/10") 
                  : (isDark ? "text-red-400 bg-red-500/10" : "text-red-600 bg-red-500/10")
              )}>
                {formatPriceChange(token.priceChange24h)}
              </div>
            </div>
          ))}
          
          {loading && (
            Array(4).fill(0).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-3 rounded-md min-w-[80px] h-[90px]",
                  "border transition-all duration-200 backdrop-blur-sm animate-pulse",
                  isDark 
                    ? "bg-card/20 border-muted/10" 
                    : "bg-card/30 border-muted/20"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-muted/50 mb-1"></div>
                <div className="h-3 w-12 bg-muted/50 rounded mb-1"></div>
                <div className="h-3 w-16 bg-muted/50 rounded mb-1"></div>
                <div className="h-3 w-10 bg-muted/50 rounded"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}