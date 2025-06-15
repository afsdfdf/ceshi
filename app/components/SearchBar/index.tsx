"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Sparkles, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { searchTokens } from "@/app/lib/ave-api-service"
import { useDebounce } from "@/app/hooks/use-debounce"
import { TokenPrice } from "@/app/types/token"
import { cn } from "@/lib/utils"
import Link from "next/link"
import SearchResults from "./SearchResults"
import LogoBase64 from "../LogoBase64"
import { logger } from '@/lib/logger'

interface SearchBarProps {
  isDark: boolean;
  onResultSelect?: (token: TokenPrice) => void;
  placeholder?: string;
  simplified?: boolean;
  showLogo?: boolean;
  logoSize?: number;
}

/**
 * XAI主题搜索栏组件 - 重制版
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
  const [isFocused, setIsFocused] = useState(false)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
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
      logger.debug('开始搜索代币', { term, length: term.length }, { component: 'SearchBar', action: 'performSearch' });

      const results = await searchTokens(term);
      setSearchResults(results);
      
      // 如果API搜索有结果，则显示结果列表
      if (results.length > 0) {
        setShowResults(true);
        logger.info('搜索完成', { resultsCount: results.length }, { component: 'SearchBar', action: 'performSearch' });
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
      logger.error('搜索请求失败', error, { component: 'SearchBar', action: 'performSearch' });
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
  const handleTokenSelect = useCallback((token: TokenPrice) => {
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
  }, [onResultSelect, router]);

  // 处理搜索框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(searchValue);
    }
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center space-x-3">
        {/* XAI Logo */}
        {showLogo && (
          <Link href="/" className="flex-shrink-0 group">
            <div className={cn(
              "relative overflow-hidden rounded-xl transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              "bg-gradient-to-r from-xai-purple to-xai-cyan p-1",
              "shadow-lg group-hover:shadow-xl group-hover:shadow-xai-purple/25"
            )}
              style={{ width: logoSize + 8, height: logoSize + 8 }}
            >
              <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                <LogoBase64 width={logoSize} height={logoSize} className="transition-transform duration-300" />
              </div>
            </div>
          </Link>
        )}
        
        {/* 搜索输入框容器 */}
        <div className="relative flex-1">
          {/* 背景装饰 */}
          <div className={cn(
            "absolute inset-0 rounded-2xl transition-all duration-300",
            isFocused 
              ? "bg-gradient-to-r from-xai-purple/20 via-xai-cyan/20 to-xai-green/20 blur-sm scale-105" 
              : "bg-gradient-to-r from-xai-purple/10 via-xai-cyan/10 to-xai-green/10 blur-sm"
          )} />
          
          {/* 主搜索框 */}
          <div className={cn(
            "relative backdrop-blur-xl border transition-all duration-300 rounded-2xl",
            isFocused 
              ? "border-xai-purple/50 shadow-lg shadow-xai-purple/25" 
              : "border-border/50",
            isDark ? "bg-card/70" : "bg-white/70"
          )}>
            {/* 搜索图标 */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-xai-purple border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className={cn(
                  "w-5 h-5 transition-colors duration-300",
                  isFocused ? "text-xai-purple" : "text-muted-foreground"
                )} />
              )}
            </div>
            
            {/* 输入框 */}
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "pl-12 pr-16 py-4 text-base border-0 bg-transparent",
                "placeholder:text-muted-foreground/60",
                "focus:ring-0 focus:outline-none",
                "transition-all duration-300"
              )}
            />
            
            {/* 右侧装饰 */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {searchValue && (
                <div className="flex items-center space-x-1">
                  <Sparkles className="w-4 h-4 text-xai-cyan animate-pulse" />
                  <Zap className="w-4 h-4 text-xai-green animate-bounce" />
                </div>
              )}
              
              {/* 搜索按钮 */}
              <button
                onClick={() => performSearch(searchValue)}
                disabled={!searchValue.trim() || isSearching}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300",
                  "bg-gradient-to-r from-xai-purple to-xai-cyan text-white",
                  "hover:shadow-lg hover:shadow-xai-purple/25 hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                  "btn-glow"
                )}
              >
                搜索
              </button>
            </div>
          </div>
          
          {/* 搜索结果 */}
          {showResults && (
            <div 
              ref={searchResultsRef}
              className={cn(
                "absolute top-full left-0 right-0 mt-2 z-50",
                "backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden",
                "shadow-2xl animate-slide-up",
                isDark ? "bg-card/90" : "bg-white/90"
              )}
            >
                             <SearchResults
                 results={searchResults}
                 isSearching={isSearching}
                 isDark={isDark}
                 searchValue={searchValue}
                 onSelectToken={handleTokenSelect}
                 showLogo={showLogo}
                 logoSize={logoSize}
               />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 