"use client"

import type { TrendingToken } from "@/app/api/trending/route"
import { getTokenIconUrl } from "../lib/trending-service"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TrendingTokenCardProps {
  token: TrendingToken
  darkMode: boolean
  onClick: () => void
}

export function TrendingTokenCard({ token, darkMode, onClick }: TrendingTokenCardProps) {
  const isDark = darkMode;
  
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
            "relative w-7 h-7 rounded-full overflow-hidden", 
            "shadow-sm transition-all duration-300",
            "border-2",
            "group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3",
            isDark ? "border-gray-700" : "border-gray-100"
          )}>
            <Image src={getTokenIconUrl(token)} alt={token.name} fill className="object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <p className={cn(
                "font-medium text-sm transition-colors",
                "group-hover:text-primary"
              )}>
                {token.symbol}
              </p>
              <span className="text-xs text-gray-500 px-1 py-0.5 bg-gray-100/20 rounded-sm">
                #{token.rank}
              </span>
              {token.trending === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
              {token.trending === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[130px]">{token.name}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-medium text-sm">{token.priceUsd}</p>
          <p className={cn(
            "text-xs px-1.5 py-0.5 rounded-full inline-flex items-center",
            token.change24h >= 0 
              ? "text-green-500 bg-green-500/10 border border-green-500/20" 
              : "text-red-500 bg-red-500/10 border border-red-500/20"
          )}>
            {token.change24h >= 0 && (
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
            )}
            {token.change24h < 0 && (
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
            )}
            {token.change24h >= 0 ? "+" : ""}
            {token.change24h}%
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
            token.chain === "ETH" || token.chain === "ethereum" ? "bg-blue-400" :
            token.chain === "BSC" || token.chain === "binance" ? "bg-yellow-400" :
            token.chain === "SOL" || token.chain === "solana" ? "bg-purple-400" :
            "bg-gray-400"
          )}></span>
          {token.chain}
        </p>
      </div>
    </Card>
  )
}
