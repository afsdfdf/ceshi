/**
 * 钱包相关类型定义
 */

// 钱包连接状态
export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  provider?: any; // 钱包提供者对象
}

// 支持的区块链网络
export interface ChainInfo {
  id: number;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrl?: string;
}

// 钱包连接错误类型
export type WalletError = 
  | 'NO_WALLET'        // 没有检测到钱包
  | 'USER_REJECTED'    // 用户拒绝连接
  | 'UNSUPPORTED_CHAIN' // 不支持的区块链
  | 'UNKNOWN';          // 未知错误

// 钱包事件
export interface WalletEvents {
  accountsChanged: (accounts: string[]) => void;
  chainChanged: (chainId: string) => void;
  connect: (connectInfo: { chainId: string }) => void;
  disconnect: () => void;
}

// 钱包操作结果
export interface WalletActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: WalletError;
  message?: string;
} 