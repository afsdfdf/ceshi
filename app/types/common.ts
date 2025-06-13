/**
 * 通用工具类型定义
 */

// 基础ID类型
export type ID = string | number;

// 时间戳类型 (毫秒)
export type Timestamp = number;

// 状态枚举
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 排序方向
export type SortDirection = 'asc' | 'desc';

// 主题类型
export type Theme = 'light' | 'dark' | 'system';

// 语言类型
export type Language = 'en' | 'zh' | 'ja' | 'ko';

// 区块链网络类型
export type ChainType = 'eth' | 'bsc' | 'polygon' | 'arbitrum' | 'optimism' | 'avalanche' | 'fantom';

// 通用选项类型
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

// 排序参数
export interface SortParams {
  field: string;
  direction: SortDirection;
}

// 筛选参数
export interface FilterParams {
  [key: string]: any;
}

// 搜索参数
export interface SearchParams extends PaginationParams {
  query?: string;
  sort?: SortParams;
  filter?: FilterParams;
}

// 工具类型：深度可选
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 工具类型：排除某些字段
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 工具类型：提取Promise的值类型
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// 扩展环境变量类型 (仅添加新的变量)
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEXSCREENER_API_KEY?: string;
      COINGECKO_API_KEY?: string;
    }
  }
} 