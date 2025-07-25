"use client"

import { useState, useEffect, useRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { searchTokens } from "@/app/lib/ave-api-service"
import { useDebounce } from "@/app/hooks/use-debounce"
import { TokenPrice } from "@/app/types/token"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SearchBarProps {
  isDark: boolean;
  onResultSelect?: (token: TokenPrice) => void;
  placeholder?: string;
  simplified?: boolean;
  showLogo?: boolean;
  logoSize?: number;
}

/**
 * 可复用的搜索栏组件
 */
export default function SearchBar({ 
  isDark, 
  onResultSelect,
  placeholder = "搜索代币地址或符号...",
  simplified = false,
  showLogo = true,
  logoSize = 32
}: SearchBarProps) {
  const router = useRouter()
  
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<TokenPrice[]>([]) 
  const [showResults, setShowResults] = useState(false)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  
  // 添加防抖处理
  const debouncedSearchTerm = useDebounce(searchValue, 400)

  // 处理点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);
  
  // 自动搜索效果
  useEffect(() => {
    // 当防抖后的搜索词变化且不为空时自动搜索
    if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 1) {
      performSearch(debouncedSearchTerm);
    } else {
      // 清空结果但不关闭结果框
      if (searchResults.length > 0) {
        setSearchResults([]);
      }
    }
  }, [debouncedSearchTerm]);

  // 执行搜索的封装函数
  const performSearch = async (term: string) => {
    setIsSearching(true);
    if (showResults === false) {
      setShowResults(true);
    }
    
    // 检查是否是以太坊地址格式
    const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(term.trim());
    // 检查是否是Solana地址格式
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(term.trim());
    
    try {
      // 无论是否是合约地址，都先尝试通过API搜索
      const results = await searchTokens(term);
      setSearchResults(results);
      
      // 如果API搜索有结果，则显示结果列表
      if (results.length > 0) {
        setShowResults(true);
      } 
      // 如果API搜索没有结果，但输入是合约地址格式，则尝试直接跳转
      else if ((isEthereumAddress || isSolanaAddress) && term.trim()) {
        // 默认使用以太坊链，除非是Solana格式地址
        const chain = isSolanaAddress ? 'solana' : 'ethereum';
        const address = term.trim();
        
        // 关闭结果框
        setShowResults(false);
        
        // 导航到代币详情页
        router.push(`/token/${chain}/${address}`);
        
        toast({
          title: "正在加载代币数据",
          description: "跳转到代币详情页面",
        });
      }
      // 如果既不是合约地址也没有搜索结果
      else if (term.trim()) {
        toast({
          title: "未找到结果",
          description: "没有找到匹配的代币，请尝试其他关键词",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("搜索错误:", error);
      setSearchResults([]);
      
      // 如果API搜索失败但是输入是合约地址格式，仍然尝试直接跳转
      if ((isEthereumAddress || isSolanaAddress) && term.trim()) {
        const chain = isSolanaAddress ? 'solana' : 'ethereum';
        const address = term.trim();
        setShowResults(false);
        router.push(`/token/${chain}/${address}`);
        
        toast({
          title: "API搜索失败",
          description: "正在尝试直接跳转到代币页面",
          variant: "default",
        });
      } else {
        toast({
          title: "搜索失败",
          description: "无法获取搜索结果，请稍后再试",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  // 处理选择代币
  const handleTokenSelect = (token: TokenPrice) => {
    setShowResults(false);
    
    if (onResultSelect) {
      // 如果提供了结果选择回调，调用它
      onResultSelect(token);
    } else {
      // 导航到代币详情页面
      if (token && token.chain && token.token) {
        router.push(`/token/${token.chain}/${token.token}`);
      }
    }
  }

  // 处理搜索框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(searchValue);
    }
  }

  return (
    <div className="relative">
      {/* 简化模式：只显示搜索框 */}
      {simplified ? (
        <div className="relative w-full">
          <Input
            type="text"
            placeholder={placeholder}
            className={cn(
              "w-full h-9 pl-9 pr-4 text-sm rounded-lg border-0 bg-transparent",
              "transition-all duration-300 placeholder:text-muted-foreground/60",
              "focus:ring-0 focus:outline-none"
            )}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowResults(true)}
          />
          <Search className={cn(
            "absolute left-3 top-2.5 w-4 h-4 transition-colors duration-300",
            searchValue ? "text-xai-purple" : "text-muted-foreground"
          )} />
          
          {/* 搜索状态指示器 */}
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <div className="w-4 h-4 border-2 border-xai-purple border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {/* 搜索结果下拉框 */}
          {showResults && (
            <div 
              ref={searchResultsRef} 
              className={cn(
                "absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-lg shadow-xl z-50 animate-fade-in",
                "border backdrop-blur-md",
                isDark 
                  ? "bg-card/95 border-border/70" 
                  : "bg-white/95 border-border/40"
              )}
            >
              {isSearching ? (
                <div className="p-4 text-center text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2"></div>
                  搜索中...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((token, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 flex items-center gap-3 text-sm cursor-pointer transition-colors",
                      "border-b last:border-0",
                      isDark 
                        ? "border-border/30 hover:bg-muted/50" 
                        : "border-border/20 hover:bg-secondary/70",
                    )}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                      {token.logo_url && token.logo_url.trim() !== '' ? (
                        <Image
                          src={token.logo_url}
                          alt={token.symbol || 'Token'}
                          fill
                          className="object-cover transition-transform hover:scale-110"
                          style={{ transition: "transform 0.2s ease" }}
                          onError={(e) => {
                            // Replace with placeholder image on error
                            (e.target as HTMLImageElement).src = "/images/token-placeholder.png";
                          }}
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center text-xs font-medium text-white",
                          `bg-gradient-to-br ${
                            index % 5 === 0 ? "from-pink-500 to-rose-500" :
                            index % 5 === 1 ? "from-blue-500 to-indigo-500" :
                            index % 5 === 2 ? "from-green-500 to-emerald-500" :
                            index % 5 === 3 ? "from-amber-500 to-orange-500" :
                            "from-purple-500 to-fuchsia-500"
                          }`
                        )}>
                          {token.symbol?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="font-medium truncate">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {token.name} • {token.chain.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium">
                        ${typeof token.current_price_usd === 'string' 
                          ? parseFloat(token.current_price_usd).toFixed(6) 
                          : (token.current_price_usd || 0).toFixed(6)}
                      </div>
                      {token.price_change_24h && (
                        <div className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full mt-1 inline-block",
                          parseFloat(String(token.price_change_24h)) >= 0 
                            ? 'text-emerald-500 bg-emerald-500/10' 
                            : 'text-rose-500 bg-rose-500/10'
                        )}>
                          {parseFloat(String(token.price_change_24h)) >= 0 ? '+' : ''}
                          {parseFloat(String(token.price_change_24h)).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : searchValue.trim() ? (
                <div className="p-4 text-center">
                  <div className="text-muted-foreground text-sm mb-1">未找到相关代币</div>
                  <div className="text-xs text-muted-foreground/70">
                    请尝试其他关键词或代币地址
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        // 完整模式：显示LOGO和搜索框
        <div className="flex items-center gap-3">
          {/* BNB Logo */}
          {showLogo && (
            <Link href="/" className="flex-shrink-0">
              <div className={cn(
                "relative overflow-hidden rounded-full",
                "hover:shadow-md transition-shadow duration-200",
                "hover:scale-105 transition-transform"
              )}
                style={{ width: logoSize, height: logoSize }}
              >
                <div 
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F3BA2F 0%, #F7931E 100%)",
                    color: "white",
                    fontSize: `${Math.max(logoSize * 0.4, 12)}px`,
                    fontWeight: "bold",
                    boxShadow: "0 2px 8px rgba(243, 186, 47, 0.3)"
                  }}
                >
                  BNB
                </div>
              </div>
            </Link>
          )}
          
          {/* 搜索输入框 */}
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder={placeholder}
              className={cn(
                "w-full h-8 pl-8 pr-4 text-sm rounded-xl border-0 bg-transparent",
                "transition-all duration-300 placeholder:text-muted-foreground/60",
                "focus:ring-0 focus:outline-none"
              )}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowResults(true)}
            />
            <Search className={cn(
              "absolute left-2.5 top-2 w-3.5 h-3.5 transition-colors duration-300",
              searchValue ? "text-xai-purple" : "text-muted-foreground"
            )} />
            
            {/* 搜索状态指示器 */}
            {isSearching && (
              <div className="absolute right-2.5 top-2">
                <div className="w-3.5 h-3.5 border-2 border-xai-purple border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          {/* 搜索结果下拉框 */}
          {showResults && (
            <div 
              ref={searchResultsRef} 
              className={cn(
                "absolute left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-md shadow-lg z-50 animate-fade-in",
                isDark 
                  ? "bg-card border border-border/70" 
                  : "bg-card border border-border/40"
              )}
              style={{ marginLeft: showLogo ? `${logoSize + 12}px` : '0' }}
            >
              {isSearching ? (
                <div className="p-4 text-center text-sm">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2"></div>
                  搜索中...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((token, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 flex items-center gap-3 text-sm cursor-pointer transition-colors",
                      "border-b last:border-0",
                      isDark 
                        ? "border-border/30 hover:bg-muted/50" 
                        : "border-border/20 hover:bg-secondary/70",
                    )}
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                      {token.logo_url && token.logo_url.trim() !== '' ? (
                        <Image
                          src={token.logo_url}
                          alt={token.symbol || 'Token'}
                          fill
                          className="object-cover transition-transform hover:scale-110"
                          style={{ transition: "transform 0.2s ease" }}
                          onError={(e) => {
                            // Replace with placeholder image on error
                            (e.target as HTMLImageElement).src = "/images/token-placeholder.png";
                          }}
                        />
                      ) : (
                        <div className={cn(
                          "w-full h-full flex items-center justify-center text-xs font-medium text-white",
                          `bg-gradient-to-br ${
                            index % 5 === 0 ? "from-pink-500 to-rose-500" :
                            index % 5 === 1 ? "from-blue-500 to-indigo-500" :
                            index % 5 === 2 ? "from-green-500 to-emerald-500" :
                            index % 5 === 3 ? "from-amber-500 to-orange-500" :
                            "from-purple-500 to-fuchsia-500"
                          }`
                        )}>
                          {token.symbol?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {token.name} • {token.chain.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">
                        ${typeof token.current_price_usd === 'string' 
                          ? parseFloat(token.current_price_usd).toFixed(6) 
                          : (token.current_price_usd || 0).toFixed(6)}
                      </div>
                      {token.price_change_24h && (
                        <div className={cn(
                          "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
                          parseFloat(String(token.price_change_24h)) >= 0 
                            ? 'text-emerald-500 bg-emerald-500/10' 
                            : 'text-rose-500 bg-rose-500/10'
                        )}>
                          {parseFloat(String(token.price_change_24h)) >= 0 ? '+' : ''}
                          {parseFloat(String(token.price_change_24h)).toFixed(2)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : searchValue.trim() ? (
                <div className="p-6 text-center">
                  <div className="text-muted-foreground mb-1">未找到相关代币</div>
                  <div className="text-xs text-muted-foreground/70">
                    请尝试其他关键词或代币地址
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 