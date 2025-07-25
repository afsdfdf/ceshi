"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ExternalLink, ChevronDown, ChevronUp, Info } from "lucide-react"
import { TokenDetails } from "@/app/lib/ave-api-service"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TokenDetailsCardProps {
  tokenDetails: TokenDetails | null
  isLoading: boolean
  darkMode: boolean
  chain: string
  address: string
}

export default function TokenDetailsCard({ 
  tokenDetails, 
  isLoading, 
  darkMode,
  chain,
  address
}: TokenDetailsCardProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [selectedMetricsView, setSelectedMetricsView] = useState<string>("basic")
  const [apiRequestAttempted, setApiRequestAttempted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasInitialData, setHasInitialData] = useState(false)

  // 用于实现延迟的工具函数
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 按优先级获取所有相关数据的函数
  const fetchAllTokenData = async () => {
    if (!address || !chain || apiRequestAttempted) return;
    
    setApiRequestAttempted(true);
    
    try {
      // 构建所有请求
      const detailsPromise = fetch(`/api/token-details?address=${address}&chain=${chain}`);
      const txPromise = fetch(`/api/token-transactions?address=${address}&chain=${chain}&limit=20`);
      const holdersPromise = fetch(`/api/token-holders?address=${address}&chain=${chain}`);
      
      // 并行执行所有请求
      const [detailsResponse, txResponse, holdersResponse] = 
        await Promise.all([detailsPromise, txPromise, holdersPromise]);
      
      // 处理详情响应
      try {
        const detailsData = await detailsResponse.json();
        if (detailsData.success) {
          setEnhancedData(detailsData);
        }
      } catch (error) {
        console.error("Error processing token details:", error);
      }
      
      // 处理交易响应
      try {
        const txData = await txResponse.json();
        if (txData.success) {
          setEnhancedData((prevData: any) => ({
            ...prevData,
            transactions: txData.transactions || []
          }));
        }
      } catch (error) {
        console.error("Error processing transactions:", error);
      }
      
      // 处理持币人响应
      try {
        const holdersData = await holdersResponse.json();
        if (holdersData.success) {
          setEnhancedData((prevData: any) => ({
            ...prevData,
            holders: holdersData.holders || []
          }));
        }
      } catch (error) {
        console.error("Error processing holders:", error);
      }
      
    } catch (error) {
      console.error("Error in parallel data fetching:", error);
    }
  };

  // 重置所有状态，允许重新获取数据
  const resetAndRetry = () => {
    setApiRequestAttempted(false);
    setEnhancedData(null);
    fetchAllTokenData();
  };

  // 监听地址或链变化，重置状态
  useEffect(() => {
    setIsVisible(false)
    setHasInitialData(false)
    setApiRequestAttempted(false)
    setEnhancedData(null)
  }, [address, chain])

  // 监听tokenDetails变化，控制显示状态
  useEffect(() => {
    if (tokenDetails && !hasInitialData) {
      setHasInitialData(true)
      // 延迟显示，避免闪烁
      setTimeout(() => {
        setIsVisible(true)
      }, 150)
    }
  }, [tokenDetails, hasInitialData])

  // 当组件展开时获取增强数据
  useEffect(() => {
    if (expanded && !enhancedData && !apiRequestAttempted) {
      fetchAllTokenData();
    }
  }, [expanded, address, chain, enhancedData, apiRequestAttempted]);

  // Format large numbers with K, M, B, T suffixes
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return "N/A"
    if (num === 0) return "0"

    const suffixes = ["", "K", "M", "B", "T"]
    const magnitude = Math.floor(Math.log10(num) / 3)
    const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)]
    const scaledNum = num / Math.pow(10, magnitude * 3)
    
    return scaledNum.toFixed(1) + suffix
  }

  // Format price to handle small values
  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return "N/A"
    if (price === 0) return "$0.00"
    
    if (price < 0.01) {
      return "$" + price.toFixed(8)
    }
    
    return "$" + price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Format percentage change
  const formatPriceChange = (change: number) => {
    if (change === undefined || change === null) return "N/A"
    
    const prefix = change >= 0 ? "+" : ""
    return `${prefix}${change.toFixed(2)}%`
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Get block explorer URL based on chain
  const getExplorerUrl = () => {
    const baseUrls: {[key: string]: string} = {
      ethereum: "https://etherscan.io/token/",
      bsc: "https://bscscan.com/token/",
      polygon: "https://polygonscan.com/token/",
      arbitrum: "https://arbiscan.io/token/",
      optimism: "https://optimistic.etherscan.io/token/",
      avalanche: "https://snowtrace.io/token/",
      solana: "https://solscan.io/token/",
      base: "https://basescan.org/token/"
    }
    
    return (baseUrls[chain] || "https://etherscan.io/token/") + address
  }

  // 获取代币Logo的函数，尝试多个可能的字段
  const getTokenLogo = () => {
    if (!tokenDetails) return null;
    
    // 尝试多个可能的字段
    const logoUrl = 
      tokenDetails.tokenInfo?.logo_url || 
      tokenDetails.logo ||
      (tokenDetails.tokenInfo as any)?.logo || 
      '';
    
    if (logoUrl && logoUrl.trim() !== '') {
      return logoUrl;
    }
    
    return null;
  }

  // 格式化时间（用于社交链接显示创建时间）
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  }

  // 获取Logo
  const tokenLogo = getTokenLogo();

  // 骨架屏组件
  const SkeletonCard = () => (
    <Card className={cn(
      "p-2 w-full overflow-hidden transition-all duration-300",
      darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    )}>
      {/* Address skeleton */}
      <div className="flex items-center gap-1 mb-2">
        <div className={cn(
          "h-6 flex-grow rounded animate-pulse",
          darkMode ? "bg-gray-800" : "bg-gray-200"
        )} />
        <div className={cn(
          "w-6 h-6 rounded animate-pulse",
          darkMode ? "bg-gray-800" : "bg-gray-200"
        )} />
        <div className={cn(
          "w-6 h-6 rounded animate-pulse",
          darkMode ? "bg-gray-800" : "bg-gray-200"
        )} />
      </div>
      
      {/* Metrics skeleton */}
      <div className="grid grid-cols-4 gap-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={cn(
            "p-1 rounded animate-pulse",
            darkMode ? "bg-gray-800" : "bg-gray-200"
          )}>
            <div className={cn(
              "h-3 w-full mb-1 rounded",
              darkMode ? "bg-gray-700" : "bg-gray-300"
            )} />
            <div className={cn(
              "h-3 w-3/4 rounded",
              darkMode ? "bg-gray-700" : "bg-gray-300"
            )} />
          </div>
        ))}
      </div>
    </Card>
  );

  // 如果正在加载且没有任何数据，显示骨架屏
  if (isLoading && !hasInitialData) {
    return <SkeletonCard />;
  }

  // 如果有初始数据但还在加载中，显示带有加载指示的内容
  return (
    <Card className={cn(
      "p-2 w-full overflow-hidden transition-all duration-500",
      darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      // 平滑的透明度过渡
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      // 添加变换动画
      "transform transition-all duration-500 ease-out"
    )}>
      {/* Address with copy function */}
      <div className="flex items-center gap-1 mb-2 relative">
        {/* 微妙的加载指示器 */}
        {isLoading && hasInitialData && (
          <div className={cn(
            "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse",
            darkMode ? "bg-blue-400" : "bg-blue-500"
          )} />
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "text-xs h-6 gap-1 flex-grow justify-between truncate max-w-full transition-all duration-300",
            darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
            // 加载时稍微降低透明度
            isLoading && hasInitialData ? "opacity-90" : "opacity-100"
          )}
          onClick={copyAddress}
        >
          <span className="truncate text-[9px]">
            {address ? address.slice(0, 6) + '...' + address.slice(-4) : "Address unavailable"}
          </span>
          {copied ? (
            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-6 h-6 p-0",
            darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
          )}
          onClick={() => window.open(getExplorerUrl(), '_blank')}
          title="View on explorer"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
        {/* Expand/Collapse Button */}
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-6 h-6 p-0",
            darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
          )}
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {/* Token Metrics - 单行显示，去除流动性和锁仓比例 */}
      <div className="grid grid-cols-4 gap-1">
        <div className={cn(
          "p-1 rounded transition-all duration-300",
          darkMode ? "bg-gray-800" : "bg-gray-100",
          isLoading && hasInitialData ? "animate-pulse" : ""
        )}>
          <div className="text-[8px] text-muted-foreground">交易量</div>
          <div className={cn(
            "text-[9px] font-medium transition-all duration-300",
            isLoading && hasInitialData ? "opacity-70" : "opacity-100"
          )}>
            ${formatNumber(tokenDetails?.volume24h || 0)}
          </div>
        </div>
        
        <div className={cn(
          "p-1 rounded transition-all duration-300",
          darkMode ? "bg-gray-800" : "bg-gray-100",
          isLoading && hasInitialData ? "animate-pulse" : ""
        )}>
          <div className="text-[8px] text-muted-foreground">市值</div>
          <div className={cn(
            "text-[9px] font-medium transition-all duration-300",
            isLoading && hasInitialData ? "opacity-70" : "opacity-100"
          )}>
            ${formatNumber(tokenDetails?.marketCap || 0)}
          </div>
        </div>
        
        <div className={cn(
          "p-1 rounded transition-all duration-300",
          darkMode ? "bg-gray-800" : "bg-gray-100",
          isLoading && hasInitialData ? "animate-pulse" : ""
        )}>
          <div className="text-[8px] text-muted-foreground">总供应量</div>
          <div className={cn(
            "text-[9px] font-medium transition-all duration-300",
            isLoading && hasInitialData ? "opacity-70" : "opacity-100"
          )}>
            {formatNumber(tokenDetails?.totalSupply || 0)}
          </div>
        </div>
        
        <div className={cn(
          "p-1 rounded transition-all duration-300",
          darkMode ? "bg-gray-800" : "bg-gray-100",
          isLoading && hasInitialData ? "animate-pulse" : ""
        )}>
          <div className="text-[8px] text-muted-foreground">持有人数</div>
        <div className={cn(
            "text-[9px] font-medium transition-all duration-300",
            isLoading && hasInitialData ? "opacity-70" : "opacity-100"
        )}>
            {formatNumber(tokenDetails?.holders || 0)}
        </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          {/* Metric View Selector */}
          {enhancedData && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "text-[9px] h-6 px-3",
                  selectedMetricsView === "basic" ? 
                    darkMode ? "bg-blue-800 text-white" : "bg-blue-100 text-blue-800" : 
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                )}
                onClick={() => setSelectedMetricsView("basic")}
              >
                基本信息
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "text-[9px] h-6 px-3 flex items-center gap-1",
                  selectedMetricsView === "social" ? 
                    darkMode ? "bg-blue-800 text-white" : "bg-blue-100 text-blue-800" : 
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                )}
                onClick={() => setSelectedMetricsView("social")}
              >
                社交信息
                <Info className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {/* Conditional rendering of different views */}
          {enhancedData && (
            <>
              {/* Basic Information */}
              {selectedMetricsView === "basic" && (
                <div className="grid grid-cols-2 gap-1">
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">代币名称</div>
                    <div className="text-[9px] font-medium">{tokenDetails?.tokenInfo?.name || tokenDetails?.name || enhancedData?.name || "N/A"}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">代币符号</div>
                    <div className="text-[9px] font-medium">{tokenDetails?.tokenInfo?.symbol || tokenDetails?.symbol || enhancedData?.symbol || "N/A"}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">所在链</div>
                    <div className="text-[9px] font-medium">{tokenDetails?.chain || enhancedData?.chain || chain.toUpperCase()}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">当前价格</div>
                    <div className="text-[9px] font-medium">{formatPrice(tokenDetails?.price || enhancedData?.price || 0)}</div>
                  </div>

                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">24h涨跌幅</div>
                    <div className={cn(
                      "text-[9px] font-medium",
                      (tokenDetails?.priceChange || enhancedData?.priceChange || 0) >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatPriceChange(tokenDetails?.priceChange || enhancedData?.priceChange || 0)}
                    </div>
                  </div>

                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">创建时间</div>
                    <div className="text-[9px] font-medium">
                      {formatDate(tokenDetails?.created_at || enhancedData?.created_at || 0)}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">总供应量</div>
                    <div className="text-[9px] font-medium">{formatNumber(tokenDetails?.totalSupply || enhancedData?.totalSupply || 0)}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">持有人数</div>
                    <div className="text-[9px] font-medium">{formatNumber(tokenDetails?.holders || enhancedData?.holders || 0)}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">市值</div>
                    <div className="text-[9px] font-medium">${formatNumber(tokenDetails?.marketCap || enhancedData?.marketCap || 0)}</div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">合约地址</div>
                    <div className="text-[9px] font-medium truncate">{address?.slice(0, 6) + '...' + address?.slice(-4)}</div>
                  </div>
                  
                  {enhancedData?.burn_amount !== undefined && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">燃烧数量</div>
                      <div className="text-[9px] font-medium">{formatNumber(enhancedData?.burn_amount || 0)}</div>
                    </div>
                  )}
                  
                  {enhancedData?.locked_percent !== undefined && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">锁仓比例</div>
                      <div className="text-[9px] font-medium">{(enhancedData?.locked_percent || 0).toFixed(6)}%</div>
                    </div>
                  )}
                  
                  {enhancedData?.risk_level !== undefined && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">风险等级</div>
                      <div className={cn(
                        "text-[9px] font-medium",
                        enhancedData.risk_level > 2 ? "text-red-500" : 
                        enhancedData.risk_level > 1 ? "text-yellow-500" : "text-green-500"
                      )}>
                        {enhancedData.risk_level}/3
                      </div>
                    </div>
                  )}
                  
                  {enhancedData?.risk_score !== undefined && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">风险评分</div>
                      <div className={cn(
                        "text-[9px] font-medium",
                        parseInt(String(enhancedData.risk_score)) > 70 ? "text-red-500" : 
                        parseInt(String(enhancedData.risk_score)) > 30 ? "text-yellow-500" : "text-green-500"
                      )}>
                        {enhancedData.risk_score}/100
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Information */}
              {selectedMetricsView === "social" && (
                <div className="grid grid-cols-2 gap-1">
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">网站</div>
                    <div className="text-[9px] font-medium truncate">
                      {tokenDetails?.website || enhancedData?.website ? (
                        <a 
                          href={tokenDetails?.website || enhancedData?.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline truncate block"
                        >
                          {((tokenDetails?.website || enhancedData?.website) || "").replace(/https?:\/\//i, '').slice(0, 15)}...
                        </a>
                      ) : "N/A"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">Twitter</div>
                    <div className="text-[9px] font-medium">
                      {tokenDetails?.twitter || enhancedData?.twitter ? (
                        <a 
                          href={tokenDetails?.twitter || enhancedData?.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      ) : "N/A"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">Telegram</div>
                    <div className="text-[9px] font-medium">
                      {tokenDetails?.telegram || enhancedData?.telegram ? (
                        <a 
                          href={tokenDetails?.telegram || enhancedData?.telegram} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      ) : "N/A"}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-1 rounded",
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  )}>
                    <div className="text-[8px] text-muted-foreground">Discord</div>
                    <div className="text-[9px] font-medium">
                      {enhancedData?.discord ? (
                        <a 
                          href={enhancedData.discord} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      ) : "N/A"}
                    </div>
                  </div>

                  {/* GitHub */}
                  {enhancedData?.github && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">GitHub</div>
                      <div className="text-[9px] font-medium">
                        <a 
                          href={enhancedData.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Medium/Blog */}
                  {(enhancedData?.blog || enhancedData?.medium) && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">博客</div>
                      <div className="text-[9px] font-medium">
                        <a 
                          href={enhancedData.blog || enhancedData.medium} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Reddit */}
                  {enhancedData?.reddit && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">Reddit</div>
                      <div className="text-[9px] font-medium">
                        <a 
                          href={enhancedData.reddit} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* 白皮书 */}
                  {enhancedData?.whitepaper && (
                    <div className={cn(
                      "p-1 rounded",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">白皮书</div>
                      <div className="text-[9px] font-medium">
                        <a 
                          href={enhancedData.whitepaper} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          查看
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* 显示代币描述 */}
                  {enhancedData?.description && (
                    <div className={cn(
                      "p-1 rounded col-span-2",
                      darkMode ? "bg-gray-800" : "bg-gray-100"
                    )}>
                      <div className="text-[8px] text-muted-foreground">代币描述</div>
                      <div className="text-[9px] font-medium max-h-20 overflow-y-auto">
                        {enhancedData.description}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  )
} 