/**
 * 代币排名主题
 */
export interface RankTopic {
  /** 主题ID */
  id: string;
  /** 英文名称 */
  name_en: string;
  /** 中文名称 */
  name_zh: string;
}

/**
 * 代币相关类型定义
 */

// 基础代币信息
export interface TokenInfo {
  address: string;
  chain: string;
  symbol: string;
  name: string;
  decimals: number;
  logo_url?: string;
  current_price_usd?: number;
  price_change_24h?: number;
  market_cap?: number;
  holders?: number;
  total_supply?: number;
  circulating_supply?: number;
}

// 代币详情 (扩展版本)
export interface TokenDetails extends TokenInfo {
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  tags?: string[];
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  verified?: boolean;
  contract_verified?: boolean;
  liquidity_usd?: number;
  volume_24h?: number;
  price_change_7d?: number;
  price_change_30d?: number;
  market_cap_rank?: number;
  created_at?: string;
  updated_at?: string;
}

// 代币排名
export interface TokenRanking {
  token: string;
  chain: string;
  symbol: string;
  name: string;
  logo_url?: string;
  current_price_usd: number;
  price_change_24h: number;
  tx_volume_u_24h: number;
  holders: number;
  market_cap?: number;
  rank?: number;
}

// 代币持有者
export interface TokenHolder {
  address: string;
  quantity: string;
  percent: string;
  is_contract: boolean;
  mark?: string | null;
  tag?: string;
  balance?: string;
  amount?: string;
  amount_cur?: string;
}

// 代币价格数据
export interface TokenPrice {
  token: string;
  chain: string;
  price_usd: number;
  price_change_24h: number;
  volume_24h?: number;
  market_cap?: number;
  last_updated: string;
  
  // 兼容字段 (为了向后兼容现有代码)
  symbol?: string;
  name?: string;
  logo_url?: string;
  current_price_usd?: number;
  tx_volume_u_24h?: number;
  holders?: number;
  
  // 扩展字段
  price?: number;
  priceChange24h?: number;
  marketCap?: number;
}

// K线数据
export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// 代币风险报告
export interface TokenRiskReport {
  address: string;
  chain: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  checks: {
    honeypot_risk: boolean;
    liquidity_risk: boolean;
    contract_risk: boolean;
    ownership_risk: boolean;
    trading_risk: boolean;
  };
  warnings: string[];
  recommendations: string[];
}

// 代币交易记录
export interface TokenTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  block_number: number;
  gas_used: number;
  gas_price: string;
  type: 'buy' | 'sell' | 'transfer';
  value_usd?: number;
}

/**
 * API响应状态
 */
export interface ApiResponse<T> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 代币列表响应
 */
export interface TokensResponse {
  /** 代币列表 */
  tokens: TokenRanking[];
  /** 总数 */
  count: number;
  /** 主题ID */
  topic?: string;
}

/**
 * 主题列表响应
 */
export interface TopicsResponse {
  /** 主题列表 */
  topics: RankTopic[];
} 