"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { TrendingDown, TrendingUp } from "lucide-react"

interface TokenData {
  name: string
  symbol: string
  address: string
  logo?: string
  price?: number
  chain?: string
}

interface TokenBoostCardProps {
  token: TokenData
  darkMode: boolean
  onClick: () => void
}

export function TokenBoostCard({ token, darkMode, onClick }: TokenBoostCardProps) {
  const isDark = darkMode;
  
  // Default logo if not available
  const logoUrl = token.logo || "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  
  // Format price with commas and fixed decimal places
  const formatPrice = (price: number | undefined) => {
    if (!price) return "N/A"
    return price < 0.01 
      ? "$" + price.toFixed(6)
      : "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Truncate long addresses
  const formatAddress = (address: string) => {
    if (!address) return "N/A"
    return address.length > 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address
  }

  // Calculate price change color and percentage (mocked for now)
  const priceChange = token.symbol === "TRUMP" ? -8.75 : (Math.random() * 10000).toFixed(2); 
  const isPriceUp = Number(priceChange) >= 0;

  // Chain color indicator
  const getChainColor = (chain?: string) => {
    if (!chain) return "bg-gray-400";
    
    const chainLower = chain.toLowerCase();
    if (chainLower.includes("eth")) return "bg-blue-400";
    if (chainLower.includes("bsc") || chainLower.includes("binance")) return "bg-yellow-400";
    if (chainLower.includes("sol")) return "bg-purple-400";
    if (chainLower.includes("arb")) return "bg-blue-300";
    if (chainLower.includes("pol")) return "bg-indigo-400";
    return "bg-gray-400";
  }

  return (
    <Card
      className={cn(
        "p-2.5 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden",
        "group relative border",
        "hover:scale-[1.02]",
        isDark 
          ? "bg-gray-900/90 border-gray-800/90 hover:border-gray-700" 
          : "bg-white/95 border-gray-200/80 hover:border-gray-300",
        "before:absolute before:inset-0 before:w-full before:h-full",
        isDark
          ? "before:bg-gradient-to-tr before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100"
          : "before:bg-gradient-to-tr before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100",
        "before:transition-opacity before:duration-300 before:pointer-events-none"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "relative w-7 h-7 rounded-full overflow-hidden bg-gray-800", 
            "shadow-sm transition-all duration-300",
            "border-2",
            "group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3",
            isDark ? "border-gray-700" : "border-gray-100"
          )}>
            {logoUrl && (
              <Image 
                src={logoUrl} 
                alt={token.name || token.symbol} 
                fill 
                className="object-cover"
                onError={(e) => {
                  // Fallback to default logo on error
                  (e.target as HTMLImageElement).src = "https://cryptologos.cc/logos/ethereum-eth-logo.png"
                }}
              />
            )}
          </div>

          <div>
            <p className={cn(
              "font-medium text-sm transition-colors",
              "group-hover:text-primary"
            )}>
              {token.symbol || "Unknown"}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[130px]">{formatAddress(token.address)}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-medium text-sm">{formatPrice(token.price)}</p>
          <p className={cn(
            "text-xs px-1.5 py-0.5 rounded-full inline-flex items-center",
            isPriceUp 
              ? "text-green-500 bg-green-500/10 border border-green-500/20" 
              : "text-red-500 bg-red-500/10 border border-red-500/20"
          )}>
            {isPriceUp ? (
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
            )}
            {isPriceUp ? "+" : ""}{priceChange}%
          </p>
        </div>
      </div>

      <div className="text-right mt-1.5 text-xs text-gray-400 relative z-10">
        <p className={cn(
          "font-medium capitalize inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
          isDark ? "bg-gray-800/70 text-gray-300" : "bg-gray-100/70 text-gray-600"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full",
            getChainColor(token.chain)
          )}></span>
          {token.chain || "Unknown"}
        </p>
      </div>
    </Card>
  )
} 