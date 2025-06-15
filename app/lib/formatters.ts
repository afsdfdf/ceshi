/**
 * 格式化价格显示
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (price: number): string => {
  if (price === 0) return "$0.00";
  
  // 处理非常小的数字
  if (price < 0.000001) {
    return "$" + price.toExponential(2);
  }
  
  // 处理小于1的数字，保留更多小数位
  if (price < 0.01) {
    return "$" + price.toFixed(6);
  }
  
  if (price < 1) {
    return "$" + price.toFixed(4);
  }
  
  // 处理大于1的数字
  if (price < 1000) {
    return "$" + price.toFixed(2);
  }
  
  // 处理大数字，使用千位分隔符
  return "$" + price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * 格式化百分比变化
 * @param change 变化百分比
 * @returns 格式化后的百分比字符串
 */
export const formatPercentChange = (change: number): string => {
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(2)}%`;
};

/**
 * 格式化交易量
 * @param volume 交易量数值
 * @returns 格式化后的交易量字符串
 */
export const formatVolume = (volume: number): string => {
  if (volume === 0) return "$0";
  
  // 使用国际单位制缩写
  if (volume >= 1000000000) {
    return "$" + (volume / 1000000000).toFixed(2) + "B";
  }
  
  if (volume >= 1000000) {
    return "$" + (volume / 1000000).toFixed(2) + "M";
  }
  
  if (volume >= 1000) {
    return "$" + (volume / 1000).toFixed(2) + "K";
  }
  
  return "$" + volume.toFixed(2);
};

/**
 * 格式化持有者数量
 * @param holders 持有者数量
 * @returns 格式化后的持有者数量字符串
 */
export const formatHolders = (holders: number): string => {
  if (holders === 0) return "0";
  
  // 使用国际单位制缩写
  if (holders >= 1000000) {
    return (holders / 1000000).toFixed(2) + "M";
  }
  
  if (holders >= 1000) {
    return (holders / 1000).toFixed(1) + "K";
  }
  
  return holders.toString();
};

/**
 * 格式化市值
 * @param marketCap 市值字符串
 * @returns 格式化后的市值字符串
 */
export const formatMarketCap = (marketCap: string | undefined): string => {
  if (!marketCap) return "N/A";
  
  const value = parseFloat(marketCap);
  if (isNaN(value)) return "N/A";
  
  return formatVolume(value);
};

/**
 * 生成区块链浏览器链接
 * @param chain 区块链名称
 * @param token 代币合约地址
 * @returns 区块链浏览器链接
 */
export const getExplorerLink = (chain: string, token: string): string => {
  switch (chain.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return `https://etherscan.io/token/${token}`;
    case 'bsc':
    case 'binance':
      return `https://bscscan.com/token/${token}`;
    case 'polygon':
      return `https://polygonscan.com/token/${token}`;
    case 'arbitrum':
      return `https://arbiscan.io/token/${token}`;
    case 'optimism':
      return `https://optimistic.etherscan.io/token/${token}`;
    case 'avalanche':
    case 'avax':
      return `https://snowtrace.io/token/${token}`;
    case 'fantom':
    case 'ftm':
      return `https://ftmscan.com/token/${token}`;
    case 'solana':
    case 'sol':
      return `https://solscan.io/token/${token}`;
    default:
      return `https://etherscan.io/token/${token}`;
  }
};

export const formatUpdatedTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  
  // 不到1分钟
  if (diffSec < 60) {
    return `${diffSec}秒前`;
  }
  
  // 不到1小时
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  
  // 不到24小时
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }
  
  // 时间格式化
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 格式化代币价格，特别处理小数价格显示
 * 当价格低于0.0001时，显示为 0.(N)个0 的格式
 */
export function formatTokenPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice) || numPrice === 0) {
    return '$0.00';
  }
  
  // 如果价格大于等于0.0001，使用常规格式
  if (numPrice >= 0.0001) {
    if (numPrice >= 1) {
      return `$${numPrice.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 6 
      })}`;
    } else {
      return `$${numPrice.toFixed(6)}`;
    }
  }
  
  // 处理小于0.0001的价格
  const priceStr = numPrice.toExponential();
  const [mantissa, exponent] = priceStr.split('e');
  const exp = parseInt(exponent);
  
  if (exp >= -4) {
    // 如果指数大于等于-4，直接显示小数
    return `$${numPrice.toFixed(Math.abs(exp) + 2)}`;
  }
  
  // 计算0的个数
  const zerosCount = Math.abs(exp) - 1;
  const significantDigits = parseFloat(mantissa).toFixed(2);
  
  return `$0.(${zerosCount})${significantDigits.replace('.', '')}`;
}

/**
 * 格式化价格变化百分比
 */
export function formatPriceChange(change: number | string): {
  value: string;
  isPositive: boolean;
} {
  const numChange = typeof change === 'string' ? parseFloat(change) : change;
  
  if (isNaN(numChange)) {
    return { value: '0.00%', isPositive: true };
  }
  
  const isPositive = numChange >= 0;
  const formattedValue = `${isPositive ? '+' : ''}${numChange.toFixed(2)}%`;
  
  return { value: formattedValue, isPositive };
} 