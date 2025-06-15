"use client"

import { forwardRef } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { TokenPrice } from "@/app/types/token"
import { formatTokenPrice, formatPriceChange } from "@/app/lib/formatters"

interface SearchResultsProps {
  results: TokenPrice[]
  isSearching: boolean
  isDark: boolean
  searchValue: string
  onSelectToken: (token: TokenPrice) => void
  showLogo: boolean
  logoSize: number
}

// 搜索结果组件
const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(
  ({ results, isSearching, isDark, searchValue, onSelectToken, showLogo, logoSize }, ref) => {
    // 没有搜索结果的渲染函数
    const renderNoResults = () => {
      if (!searchValue.trim()) return null;
      
      return (
        <div className="p-6 text-center">
          <div className="text-muted-foreground mb-1">未找到相关代币</div>
          <div className="text-xs text-muted-foreground/70">
            请尝试其他关键词或代币地址
          </div>
        </div>
      );
    };

    // 搜索中的渲染函数
    const renderSearching = () => (
      <div className="p-4 text-center text-sm">
        <div className="animate-spin h-4 w-4 border-2 border-xai-purple border-t-transparent rounded-full inline-block mr-2"></div>
        搜索中...
      </div>
    );

    // 渲染搜索结果列表项
    const renderResultItem = (token: TokenPrice, index: number) => {
      const priceChange = formatPriceChange(token.price_change_24h || 0);
      
      return (
        <div
          key={`${token.token}-${index}`}
          className={cn(
            "p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 group",
            "border-b last:border-0 hover:scale-[1.02]",
            isDark 
              ? "border-border/20 hover:bg-gradient-to-r hover:from-xai-purple/10 hover:to-xai-cyan/10" 
              : "border-border/10 hover:bg-gradient-to-r hover:from-xai-purple/5 hover:to-xai-cyan/5",
          )}
          onClick={() => onSelectToken(token)}
        >
          {/* 代币图标 */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-xai-purple/20 to-xai-cyan/20 flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300">
            {token.logo_url && token.logo_url.trim() !== '' ? (
              <Image
                src={token.logo_url}
                alt={token.symbol || 'Token'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  // Replace with placeholder image on error
                  (e.target as HTMLImageElement).src = "/images/token-placeholder.png";
                }}
              />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-sm font-bold text-white",
                `bg-gradient-to-br ${
                  index % 5 === 0 ? "from-xai-pink to-xai-purple" :
                  index % 5 === 1 ? "from-xai-cyan to-xai-green" :
                  index % 5 === 2 ? "from-xai-green to-xai-cyan" :
                  index % 5 === 3 ? "from-xai-orange to-xai-pink" :
                  "from-xai-purple to-xai-cyan"
                }`
              )}>
                {token.symbol?.charAt(0) || '?'}
              </div>
            )}
            {/* 链标识 */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
              <div className={cn(
                "w-3 h-3 rounded-full",
                token.chain === 'ethereum' ? "bg-blue-500" :
                token.chain === 'solana' ? "bg-purple-500" :
                token.chain === 'bsc' ? "bg-yellow-500" :
                "bg-gray-500"
              )} />
            </div>
          </div>
          
          {/* 代币信息 */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base group-hover:text-xai-purple transition-colors duration-300">
                {token.symbol}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                {token.chain.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {token.name}
            </p>
          </div>
          
          {/* 价格信息 */}
          <div className="text-right flex-shrink-0">
            <div className="text-base font-semibold mb-1 group-hover:text-xai-cyan transition-colors duration-300">
              {formatTokenPrice(token.current_price_usd || 0)}
            </div>
            {token.price_change_24h && (
              <div className={cn(
                "text-xs px-3 py-1 rounded-full font-medium transition-all duration-300",
                priceChange.isPositive
                  ? 'text-xai-green bg-xai-green/10 group-hover:bg-xai-green/20' 
                  : 'text-red-500 bg-red-500/10 group-hover:bg-red-500/20'
              )}>
                {priceChange.value}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div 
        ref={ref} 
        className={cn(
          "absolute left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-md shadow-lg z-50 animate-fade-in",
          isDark 
            ? "bg-card border border-border/70" 
            : "bg-card border border-border/40"
        )}
        style={{ marginLeft: showLogo ? `${logoSize + 12}px` : '0' }}
      >
        {isSearching ? (
          renderSearching()
        ) : results.length > 0 ? (
          results.map(renderResultItem)
        ) : (
          renderNoResults()
        )}
      </div>
    );
  }
);

SearchResults.displayName = "SearchResults";

export default SearchResults; 