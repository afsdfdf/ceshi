import React, { useState, useEffect, memo, useRef } from "react";
import Image from "next/image";
import { TokenRanking } from "@/app/types/token";
import { 
  formatPrice, 
  formatPercentChange
} from "@/app/lib/formatters";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { TrendingDown, TrendingUp } from "lucide-react";
import { FallbackImage } from "@/app/components/ui/fallback-image";

interface TokenRowProps {
  token: TokenRanking;
  index: number;
  darkMode: boolean;
  onClick: (token: TokenRanking) => void;
}

/**
 * 代币行组件 - 优化布局
 */
function TokenRow({ 
  token, 
  index, 
  darkMode,
  onClick 
}: TokenRowProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasValidLogo, setHasValidLogo] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);
  const [priceIncreased, setPriceIncreased] = useState(false);
  const prevPriceRef = useRef(token.current_price_usd);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || darkMode;
  
  // 检查logo_url是否有效
  useEffect(() => {
    try {
      // 检查是否为有效URL，且不是未配置的域名
      const isValidUrl = !!token.logo_url && token.logo_url.trim() !== '';
      
      // 检查是否包含不支持的域名
      const url = isValidUrl ? new URL(token.logo_url) : null;
      const disallowedDomains = ['example.com'];
      
      // 如果URL包含不允许的域名，则视为无效
      const isAllowedDomain = url && !disallowedDomains.some(domain => url.hostname.includes(domain));
      
      setHasValidLogo(isValidUrl && isAllowedDomain);
    } catch (e) {
      // URL解析错误，视为无效
      setHasValidLogo(false);
    }
  }, [token.logo_url]);
  
  // 价格变化检测
  useEffect(() => {
    if (prevPriceRef.current !== token.current_price_usd) {
      setPriceChanged(true);
      setPriceIncreased(token.current_price_usd > prevPriceRef.current);
      prevPriceRef.current = token.current_price_usd;
      
      // 1秒后重置动画状态
      const timer = setTimeout(() => {
        setPriceChanged(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [token.current_price_usd]);
  
  // 检查是否为XAI代币，使用特殊处理
  const isXaiToken = token.token && token.token.toLowerCase() === '0x1c864c55f0c5e0014e2740c36a1f2378bfabd487';

  // XAI代币的价格显示，确保始终使用当前的价格
  useEffect(() => {
    let isMounted = true;
    
    if (isXaiToken) {
      // 为XAI代币特别获取价格
      const fetchXaiPrice = async () => {
        try {
          // 尝试使用专用API，添加时间戳防止缓存
          const timestamp = Date.now();
          const xaiResponse = await fetch(`/api/prices?symbol=XAI&_t=${timestamp}`, {
            cache: 'no-store',
            next: { revalidate: 0 } // 禁用缓存
          });
          
          if (xaiResponse.ok) {
            const data = await xaiResponse.json();
            if (data && data.success && isMounted) {
              const newPrice = data.current_price_usd;
              
              // 仅当价格有实际变化时才更新UI
              if (newPrice !== prevPriceRef.current) {
                // 手动更新UI中的价格显示，不修改原始对象
                setPriceChanged(true);
                setPriceIncreased(newPrice > prevPriceRef.current);
                prevPriceRef.current = newPrice;
                
                // 在UI中直接更新为新价格
                const priceDisplayElement = document.querySelector(`[data-token-id="${token.token}"] .price-value`);
                if (priceDisplayElement) {
                  priceDisplayElement.textContent = getFormattedPrice(newPrice);
                }
                console.log('更新XAI价格:', newPrice, '数据源:', data.source);
                
                // 通过设置1秒后重置动画状态
                setTimeout(() => {
                  if (isMounted) {
                    setPriceChanged(false);
                  }
                }, 1000);
              } else {
                console.log('XAI价格未变化，保持当前显示:', newPrice);
              }
            }
          } else {
            console.error('获取XAI代币价格失败:', await xaiResponse.text());
          }
        } catch (error) {
          console.error('获取XAI代币价格失败:', error);
        }
      };
      
      fetchXaiPrice();
      
      // 每60秒更新一次XAI价格
      const intervalId = setInterval(fetchXaiPrice, 60000);
      
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
  }, [isXaiToken, token.token]);
  
  // 处理图片加载错误
  const handleImageError = () => {
    console.log(`Image failed to load: ${token.logo_url}`);
    setImageError(true);
  };

  // 生成默认图标，当图片加载失败时显示
  const getDefaultIcon = () => {
    // 首先尝试使用本地占位符图片
    if (process.env.NODE_ENV === "production") {
      return (
        <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm">
          <Image
            src="/placeholder-token.png"
            alt={token.symbol}
            width={28}
            height={28}
            className="w-full h-full object-cover"
            unoptimized={true}
          />
        </div>
      );
    }
    
    // 如果本地图片也失败或在开发环境中，使用渐变背景
    // 根据代币符号创建渐变背景
    const generateGradient = () => {
      // 使用代币符号的字符码生成颜色
      const char1 = token.symbol.charCodeAt(0) % 360;
      const char2 = (token.symbol.length > 1 ? token.symbol.charCodeAt(1) : 0) % 360;
      
      return {
        background: isDark
          ? `linear-gradient(135deg, hsl(${char1}, 80%, 40%), hsl(${char2}, 80%, 25%))`
          : `linear-gradient(135deg, hsl(${char1}, 90%, 60%), hsl(${char2}, 90%, 45%))`
      };
    };
    
    return (
      <div 
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm"
        style={generateGradient()}
      >
        {token.symbol.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  // 价格变化颜色和样式
  const getPriceChangeStyle = () => {
    const value = token.price_change_24h;
    
    // 基本文本颜色
    const textColor = value > 0 
      ? 'text-emerald-500' 
      : value < 0 
        ? 'text-rose-500' 
        : 'text-muted-foreground';
        
    // 背景色（只在有变化时添加）
    const bgColor = value === 0 ? '' : isDark
      ? value > 0 
          ? 'bg-emerald-500/15 border border-emerald-500/20' 
          : 'bg-rose-500/15 border border-rose-500/20'
      : value > 0 
          ? 'bg-emerald-500/15 border border-emerald-500/20' 
          : 'bg-rose-500/15 border border-rose-500/20';
      
    return cn(
      textColor,
      bgColor,
      "px-2 py-0.5 rounded-full text-xs font-medium flex items-center justify-center",
      "transition-all duration-200",
      "backdrop-blur-sm",
      "w-[82px] min-w-[82px] text-center"
    );
  };
  
  // 格式化价格显示
  const getFormattedPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    } else if (price >= 0.01) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })}`;
    } else if (price >= 0.000001) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })}`;
    } else {
      // 极小数值使用科学计数法
      return `$${price.toExponential(4)}`;
    }
  };

  // 显示链信息
  const chainDisplay = () => {
    const chainMap: Record<string, string> = {
      'ethereum': 'ETH',
      'bsc': 'BSC',
      'arbitrum': 'ARB',
      'polygon': 'POLY',
      'base': 'BASE',
      'avalanche': 'AVAX',
      'optimism': 'OP',
      'solana': 'SOL'
    };
    
    return (
      <span className="ml-1 text-xs py-0.5 px-1.5 bg-muted/40 rounded-sm border border-muted/30">
        {chainMap[token.chain.toLowerCase()] || token.chain.toUpperCase().substring(0, 4)}
      </span>
    );
  };

  // 价格动画样式
  const getPriceAnimationStyle = () => {
    if (!priceChanged) return "";
    
    return cn(
      "transition-all duration-700",
      priceIncreased 
        ? "text-emerald-500 animate-pulse-subtle" 
        : "text-rose-500 animate-pulse-subtle"
    );
  };

  return (
    <div 
      className={cn(
        "grid grid-cols-12 gap-1 py-1.5 px-3 text-sm items-center cursor-pointer rounded-lg transition-all duration-200",
        "transform-gpu hover:translate-x-1",
        isDark 
          ? "hover:bg-muted/80 hover:shadow-md hover:border-muted/40" 
          : "hover:bg-secondary/95 hover:shadow-md hover:border-muted/30",
        (index + 1) % 2 === 0 
          ? isDark 
            ? 'bg-muted/30 backdrop-blur-sm border border-muted/10' 
            : 'bg-secondary/70 backdrop-blur-sm border border-muted/10'
          : isDark
            ? 'bg-transparent border border-transparent'
            : 'bg-background/80 border border-transparent'
      )}
      onClick={() => onClick(token)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 代币LOGO和信息 - 占6列 */}
      <div className="flex items-center col-span-6">
        <div className={cn(
          "relative flex-shrink-0",
          "transition-all duration-200",
          isHovered ? "scale-110 rotate-3" : ""
        )}>
          {!hasValidLogo ? (
            getDefaultIcon()
          ) : (
            <div className={cn(
              "w-7 h-7 rounded-full overflow-hidden",
              "shadow-sm transition-all duration-200",
              isHovered ? "shadow-md scale-110 rotate-3" : "",
              "border-2",
              isDark ? "border-muted/30" : "border-background/80"
            )}>
              <FallbackImage
                src={token.logo_url}
                alt={token.name || token.symbol}
                width={28}
                height={28}
                className={cn(
                  "w-full h-full object-cover",
                  isHovered ? "scale-110" : ""
                )}
                fallbackSrc="/placeholder-token.png"
              />
            </div>
          )}
        </div>
        <div className="ml-2.5 flex flex-col">
          <div className="flex items-center">
            <span className={cn(
              "font-semibold transition-all text-[15px]",
              isHovered ? "text-primary" : ""
            )}>
              {token.symbol}
            </span>
            {chainDisplay()}
          </div>
        </div>
      </div>
      
      {/* 价格 - 占3列 */}
      <div className={cn(
        "col-span-3 font-medium transition-colors text-[13px]",
        "w-[88px] min-w-[88px] text-right pr-2",
        isHovered ? "text-foreground" : isDark ? "text-foreground/90" : "text-foreground/80",
        getPriceAnimationStyle()
      )}>
        <span className="price-value" data-token-id={token.token}>
          {getFormattedPrice(token.current_price_usd)}
        </span>
      </div>
      
      {/* 价格变化 - 占3列 */}
      <div className="col-span-3 font-medium flex items-center justify-end">
        <div className={getPriceChangeStyle()}>
          {token.price_change_24h > 0 && (
            <TrendingUp className="w-3 h-3 mr-0.5" />
          )}
          {token.price_change_24h < 0 && (
            <TrendingDown className="w-3 h-3 mr-0.5" />
          )}
          {formatPercentChange(token.price_change_24h)}
        </div>
      </div>
    </div>
  );
}

// 通过自定义相等比较函数进一步优化
const arePropsEqual = (prevProps: TokenRowProps, nextProps: TokenRowProps) => {
  // 如果token的关键字段没有变化，不重新渲染
  return (
    prevProps.token.token === nextProps.token.token &&
    prevProps.token.chain === nextProps.token.chain &&
    prevProps.token.current_price_usd === nextProps.token.current_price_usd &&
    prevProps.token.price_change_24h === nextProps.token.price_change_24h &&
    prevProps.index === nextProps.index &&
    prevProps.darkMode === nextProps.darkMode
  );
};

// 使用memo包装组件以提高性能
export default memo(TokenRow, arePropsEqual); 