// 多语言支持配置
export type Language = 'zh' | 'en' | 'ja' | 'ko';

export interface Translations {
  // 通用
  common: {
    loading: string;
    error: string;
    retry: string;
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    sort: string;
    more: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    open: string;
    copy: string;
    copied: string;
    share: string;
    refresh: string;
  };
  
  // 导航
  navigation: {
    home: string;
    market: string;
    discover: string;
    mining: string;
    chat: string;
    wallet: string;
    trade: string;
    profile: string;
  };
  
  // 首页
  home: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    topTokens: string;
    featuredTokens: string;
    featuredTokensDesc: string;
    marketCap: string;
    volume24h: string;
    price: string;
    change24h: string;
    viewAll: string;
  };
  
  // 市场
  market: {
    title: string;
    allTokens: string;
    favorites: string;
    trending: string;
    gainers: string;
    losers: string;
    newListings: string;
    marketCap: string;
    volume: string;
    price: string;
    change: string;
    rank: string;
  };
  
  // 发现
  discover: {
    title: string;
    categories: string;
    featured: string;
    popular: string;
    newest: string;
    defi: string;
    nft: string;
    gaming: string;
    social: string;
    tools: string;
  };
  
  // 挖矿
  mining: {
    title: string;
    myMining: string;
    availablePools: string;
    earnings: string;
    hashrate: string;
    difficulty: string;
    reward: string;
    startMining: string;
    stopMining: string;
  };
  
  // 聊天
  chat: {
    title: string;
    plaza: string;
    newTokens: string;
    market: string;
    news: string;
    postNew: string;
    reply: string;
    like: string;
    share: string;
    report: string;
    delete: string;
    edit: string;
  };
  
  // 钱包
  wallet: {
    title: string;
    balance: string;
    assets: string;
    transactions: string;
    send: string;
    receive: string;
    swap: string;
    stake: string;
    history: string;
    address: string;
    amount: string;
    fee: string;
    confirm: string;
  };
  
  // 交易
  trade: {
    title: string;
    buy: string;
    sell: string;
    limit: string;
    market: string;
    stop: string;
    price: string;
    amount: string;
    total: string;
    available: string;
    orderBook: string;
    tradeHistory: string;
    myOrders: string;
  };
  
  // K线图
  chart: {
    title: string;
    timeframes: {
      '1m': string;
      '5m': string;
      '15m': string;
      '30m': string;
      '1h': string;
      '4h': string;
      '1d': string;
      '1w': string;
      '1M': string;
    };
    indicators: {
      ma: string;
      ema: string;
      bollinger: string;
      rsi: string;
      macd: string;
      kdj: string;
      volume: string;
    };
    drawing: string;
    fullscreen: string;
    settings: string;
  };
  
  // 错误信息
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    validationError: string;
    unknownError: string;
  };
  
  // 成功信息
  success: {
    saved: string;
    deleted: string;
    updated: string;
    sent: string;
    received: string;
    copied: string;
    shared: string;
  };
}

// 中文翻译
export const zhTranslations: Translations = {
  common: {
    loading: '加载中...',
    error: '错误',
    retry: '重试',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    more: '更多',
    back: '返回',
    next: '下一页',
    previous: '上一页',
    close: '关闭',
    open: '打开',
    copy: '复制',
    copied: '已复制',
    share: '分享',
    refresh: '刷新',
  },
  navigation: {
    home: '首页',
    market: '市场',
    discover: '发现',
    mining: '挖矿',
    chat: '聊天',
    wallet: '钱包',
    trade: '交易',
    profile: '个人',
  },
  home: {
    title: 'XAI Finance',
    subtitle: '专业的加密货币交易平台',
    searchPlaceholder: '搜索代币...',
    topTokens: '热门代币',
    featuredTokens: '热门代币',
    featuredTokensDesc: '发现最受欢迎的加密货币',
    marketCap: '市值',
    volume24h: '24小时成交量',
    price: '价格',
    change24h: '24小时涨跌',
    viewAll: '查看全部',
  },
  market: {
    title: '市场',
    allTokens: '全部代币',
    favorites: '自选',
    trending: '热门',
    gainers: '涨幅榜',
    losers: '跌幅榜',
    newListings: '新上线',
    marketCap: '市值',
    volume: '成交量',
    price: '价格',
    change: '涨跌幅',
    rank: '排名',
  },
  discover: {
    title: '发现',
    categories: '分类',
    featured: '精选',
    popular: '热门',
    newest: '最新',
    defi: 'DeFi',
    nft: 'NFT',
    gaming: '游戏',
    social: '社交',
    tools: '工具',
  },
  mining: {
    title: '挖矿',
    myMining: '我的挖矿',
    availablePools: '可用矿池',
    earnings: '收益',
    hashrate: '算力',
    difficulty: '难度',
    reward: '奖励',
    startMining: '开始挖矿',
    stopMining: '停止挖矿',
  },
  chat: {
    title: '聊天',
    plaza: '聊天广场',
    newTokens: '新币推荐',
    market: '二级市场',
    news: '新闻',
    postNew: '发布新帖',
    reply: '回复',
    like: '点赞',
    share: '分享',
    report: '举报',
    delete: '删除',
    edit: '编辑',
  },
  wallet: {
    title: '钱包',
    balance: '余额',
    assets: '资产',
    transactions: '交易记录',
    send: '发送',
    receive: '接收',
    swap: '兑换',
    stake: '质押',
    history: '历史',
    address: '地址',
    amount: '数量',
    fee: '手续费',
    confirm: '确认',
  },
  trade: {
    title: '交易',
    buy: '买入',
    sell: '卖出',
    limit: '限价',
    market: '市价',
    stop: '止损',
    price: '价格',
    amount: '数量',
    total: '总额',
    available: '可用',
    orderBook: '订单簿',
    tradeHistory: '交易历史',
    myOrders: '我的订单',
  },
  chart: {
    title: 'K线图',
    timeframes: {
      '1m': '1分钟',
      '5m': '5分钟',
      '15m': '15分钟',
      '30m': '30分钟',
      '1h': '1小时',
      '4h': '4小时',
      '1d': '1天',
      '1w': '1周',
      '1M': '1月',
    },
    indicators: {
      ma: '移动平均线',
      ema: '指数移动平均线',
      bollinger: '布林带',
      rsi: 'RSI',
      macd: 'MACD',
      kdj: 'KDJ',
      volume: '成交量',
    },
    drawing: '绘图工具',
    fullscreen: '全屏',
    settings: '设置',
  },
  errors: {
    networkError: '网络连接错误',
    serverError: '服务器错误',
    notFound: '页面未找到',
    unauthorized: '未授权访问',
    forbidden: '访问被禁止',
    validationError: '输入验证失败',
    unknownError: '未知错误',
  },
  success: {
    saved: '保存成功',
    deleted: '删除成功',
    updated: '更新成功',
    sent: '发送成功',
    received: '接收成功',
    copied: '复制成功',
    shared: '分享成功',
  },
};

// 英文翻译
export const enTranslations: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    more: 'More',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share',
    refresh: 'Refresh',
  },
  navigation: {
    home: 'Home',
    market: 'Market',
    discover: 'Discover',
    mining: 'Mining',
    chat: 'Chat',
    wallet: 'Wallet',
    trade: 'Trade',
    profile: 'Profile',
  },
  home: {
    title: 'XAI Finance',
    subtitle: 'Professional Cryptocurrency Trading Platform',
    searchPlaceholder: 'Search tokens...',
    topTokens: 'Top Tokens',
    featuredTokens: 'Featured Tokens',
    featuredTokensDesc: 'Discover the most popular cryptocurrencies',
    marketCap: 'Market Cap',
    volume24h: '24h Volume',
    price: 'Price',
    change24h: '24h Change',
    viewAll: 'View All',
  },
  market: {
    title: 'Market',
    allTokens: 'All Tokens',
    favorites: 'Favorites',
    trending: 'Trending',
    gainers: 'Top Gainers',
    losers: 'Top Losers',
    newListings: 'New Listings',
    marketCap: 'Market Cap',
    volume: 'Volume',
    price: 'Price',
    change: 'Change',
    rank: 'Rank',
  },
  discover: {
    title: 'Discover',
    categories: 'Categories',
    featured: 'Featured',
    popular: 'Popular',
    newest: 'Newest',
    defi: 'DeFi',
    nft: 'NFT',
    gaming: 'Gaming',
    social: 'Social',
    tools: 'Tools',
  },
  mining: {
    title: 'Mining',
    myMining: 'My Mining',
    availablePools: 'Available Pools',
    earnings: 'Earnings',
    hashrate: 'Hashrate',
    difficulty: 'Difficulty',
    reward: 'Reward',
    startMining: 'Start Mining',
    stopMining: 'Stop Mining',
  },
  chat: {
    title: 'Chat',
    plaza: 'Chat Plaza',
    newTokens: 'New Tokens',
    market: 'Market',
    news: 'News',
    postNew: 'Post New',
    reply: 'Reply',
    like: 'Like',
    share: 'Share',
    report: 'Report',
    delete: 'Delete',
    edit: 'Edit',
  },
  wallet: {
    title: 'Wallet',
    balance: 'Balance',
    assets: 'Assets',
    transactions: 'Transactions',
    send: 'Send',
    receive: 'Receive',
    swap: 'Swap',
    stake: 'Stake',
    history: 'History',
    address: 'Address',
    amount: 'Amount',
    fee: 'Fee',
    confirm: 'Confirm',
  },
  trade: {
    title: 'Trade',
    buy: 'Buy',
    sell: 'Sell',
    limit: 'Limit',
    market: 'Market',
    stop: 'Stop',
    price: 'Price',
    amount: 'Amount',
    total: 'Total',
    available: 'Available',
    orderBook: 'Order Book',
    tradeHistory: 'Trade History',
    myOrders: 'My Orders',
  },
  chart: {
    title: 'Chart',
    timeframes: {
      '1m': '1m',
      '5m': '5m',
      '15m': '15m',
      '30m': '30m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
      '1w': '1w',
      '1M': '1M',
    },
    indicators: {
      ma: 'Moving Average',
      ema: 'Exponential Moving Average',
      bollinger: 'Bollinger Bands',
      rsi: 'RSI',
      macd: 'MACD',
      kdj: 'KDJ',
      volume: 'Volume',
    },
    drawing: 'Drawing Tools',
    fullscreen: 'Fullscreen',
    settings: 'Settings',
  },
  errors: {
    networkError: 'Network Error',
    serverError: 'Server Error',
    notFound: 'Page Not Found',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    validationError: 'Validation Error',
    unknownError: 'Unknown Error',
  },
  success: {
    saved: 'Saved Successfully',
    deleted: 'Deleted Successfully',
    updated: 'Updated Successfully',
    sent: 'Sent Successfully',
    received: 'Received Successfully',
    copied: 'Copied Successfully',
    shared: 'Shared Successfully',
  },
};

// 日文翻译
export const jaTranslations: Translations = {
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    retry: '再試行',
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    search: '検索',
    filter: 'フィルター',
    sort: 'ソート',
    more: 'もっと',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    close: '閉じる',
    open: '開く',
    copy: 'コピー',
    copied: 'コピーしました',
    share: '共有',
    refresh: '更新',
  },
  navigation: {
    home: 'ホーム',
    market: 'マーケット',
    discover: '発見',
    mining: 'マイニング',
    chat: 'チャット',
    wallet: 'ウォレット',
    trade: '取引',
    profile: 'プロフィール',
  },
  home: {
    title: 'XAI Finance',
    subtitle: 'プロフェッショナル暗号通貨取引プラットフォーム',
    searchPlaceholder: 'トークンを検索...',
    topTokens: '人気トークン',
    featuredTokens: '注目トークン',
    featuredTokensDesc: '最も人気のある暗号通貨を発見',
    marketCap: '時価総額',
    volume24h: '24時間取引量',
    price: '価格',
    change24h: '24時間変動',
    viewAll: 'すべて表示',
  },
  market: {
    title: 'マーケット',
    allTokens: 'すべてのトークン',
    favorites: 'お気に入り',
    trending: 'トレンド',
    gainers: '上昇率ランキング',
    losers: '下落率ランキング',
    newListings: '新規上場',
    marketCap: '時価総額',
    volume: '取引量',
    price: '価格',
    change: '変動率',
    rank: 'ランク',
  },
  discover: {
    title: '発見',
    categories: 'カテゴリー',
    featured: '注目',
    popular: '人気',
    newest: '最新',
    defi: 'DeFi',
    nft: 'NFT',
    gaming: 'ゲーム',
    social: 'ソーシャル',
    tools: 'ツール',
  },
  mining: {
    title: 'マイニング',
    myMining: 'マイマイニング',
    availablePools: '利用可能なプール',
    earnings: '収益',
    hashrate: 'ハッシュレート',
    difficulty: '難易度',
    reward: '報酬',
    startMining: 'マイニング開始',
    stopMining: 'マイニング停止',
  },
  chat: {
    title: 'チャット',
    plaza: 'チャット広場',
    newTokens: '新しいトークン',
    market: 'マーケット',
    news: 'ニュース',
    postNew: '新規投稿',
    reply: '返信',
    like: 'いいね',
    share: '共有',
    report: '報告',
    delete: '削除',
    edit: '編集',
  },
  wallet: {
    title: 'ウォレット',
    balance: '残高',
    assets: '資産',
    transactions: '取引履歴',
    send: '送信',
    receive: '受信',
    swap: 'スワップ',
    stake: 'ステーク',
    history: '履歴',
    address: 'アドレス',
    amount: '数量',
    fee: '手数料',
    confirm: '確認',
  },
  trade: {
    title: '取引',
    buy: '買い',
    sell: '売り',
    limit: '指値',
    market: '成行',
    stop: 'ストップ',
    price: '価格',
    amount: '数量',
    total: '合計',
    available: '利用可能',
    orderBook: '注文板',
    tradeHistory: '取引履歴',
    myOrders: 'マイオーダー',
  },
  chart: {
    title: 'チャート',
    timeframes: {
      '1m': '1分',
      '5m': '5分',
      '15m': '15分',
      '30m': '30分',
      '1h': '1時間',
      '4h': '4時間',
      '1d': '1日',
      '1w': '1週',
      '1M': '1月',
    },
    indicators: {
      ma: '移動平均線',
      ema: '指数移動平均線',
      bollinger: 'ボリンジャーバンド',
      rsi: 'RSI',
      macd: 'MACD',
      kdj: 'KDJ',
      volume: '出来高',
    },
    drawing: '描画ツール',
    fullscreen: 'フルスクリーン',
    settings: '設定',
  },
  errors: {
    networkError: 'ネットワークエラー',
    serverError: 'サーバーエラー',
    notFound: 'ページが見つかりません',
    unauthorized: '認証されていません',
    forbidden: 'アクセスが禁止されています',
    validationError: '入力検証エラー',
    unknownError: '不明なエラー',
  },
  success: {
    saved: '保存しました',
    deleted: '削除しました',
    updated: '更新しました',
    sent: '送信しました',
    received: '受信しました',
    copied: 'コピーしました',
    shared: '共有しました',
  },
};

// 韩文翻译
export const koTranslations: Translations = {
  common: {
    loading: '로딩 중...',
    error: '오류',
    retry: '다시 시도',
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    more: '더보기',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    close: '닫기',
    open: '열기',
    copy: '복사',
    copied: '복사됨',
    share: '공유',
    refresh: '새로고침',
  },
  navigation: {
    home: '홈',
    market: '마켓',
    discover: '발견',
    mining: '마이닝',
    chat: '채팅',
    wallet: '지갑',
    trade: '거래',
    profile: '프로필',
  },
  home: {
    title: 'XAI Finance',
    subtitle: '전문 암호화폐 거래 플랫폼',
    searchPlaceholder: '토큰 검색...',
    topTokens: '인기 토큰',
    featuredTokens: '주요 토큰',
    featuredTokensDesc: '가장 인기 있는 암호화폐를 발견하세요',
    marketCap: '시가총액',
    volume24h: '24시간 거래량',
    price: '가격',
    change24h: '24시간 변동',
    viewAll: '전체 보기',
  },
  market: {
    title: '마켓',
    allTokens: '모든 토큰',
    favorites: '즐겨찾기',
    trending: '트렌딩',
    gainers: '상승률 순위',
    losers: '하락률 순위',
    newListings: '신규 상장',
    marketCap: '시가총액',
    volume: '거래량',
    price: '가격',
    change: '변동률',
    rank: '순위',
  },
  discover: {
    title: '발견',
    categories: '카테고리',
    featured: '추천',
    popular: '인기',
    newest: '최신',
    defi: 'DeFi',
    nft: 'NFT',
    gaming: '게임',
    social: '소셜',
    tools: '도구',
  },
  mining: {
    title: '마이닝',
    myMining: '내 마이닝',
    availablePools: '사용 가능한 풀',
    earnings: '수익',
    hashrate: '해시레이트',
    difficulty: '난이도',
    reward: '보상',
    startMining: '마이닝 시작',
    stopMining: '마이닝 중지',
  },
  chat: {
    title: '채팅',
    plaza: '채팅 광장',
    newTokens: '신규 토큰',
    market: '마켓',
    news: '뉴스',
    postNew: '새 글 작성',
    reply: '답글',
    like: '좋아요',
    share: '공유',
    report: '신고',
    delete: '삭제',
    edit: '편집',
  },
  wallet: {
    title: '지갑',
    balance: '잔액',
    assets: '자산',
    transactions: '거래 내역',
    send: '전송',
    receive: '받기',
    swap: '스왑',
    stake: '스테이킹',
    history: '내역',
    address: '주소',
    amount: '수량',
    fee: '수수료',
    confirm: '확인',
  },
  trade: {
    title: '거래',
    buy: '매수',
    sell: '매도',
    limit: '지정가',
    market: '시장가',
    stop: '손절',
    price: '가격',
    amount: '수량',
    total: '총액',
    available: '사용 가능',
    orderBook: '호가창',
    tradeHistory: '거래 내역',
    myOrders: '내 주문',
  },
  chart: {
    title: '차트',
    timeframes: {
      '1m': '1분',
      '5m': '5분',
      '15m': '15분',
      '30m': '30분',
      '1h': '1시간',
      '4h': '4시간',
      '1d': '1일',
      '1w': '1주',
      '1M': '1월',
    },
    indicators: {
      ma: '이동평균선',
      ema: '지수이동평균선',
      bollinger: '볼린저 밴드',
      rsi: 'RSI',
      macd: 'MACD',
      kdj: 'KDJ',
      volume: '거래량',
    },
    drawing: '그리기 도구',
    fullscreen: '전체화면',
    settings: '설정',
  },
  errors: {
    networkError: '네트워크 오류',
    serverError: '서버 오류',
    notFound: '페이지를 찾을 수 없습니다',
    unauthorized: '인증되지 않음',
    forbidden: '접근 금지',
    validationError: '입력 검증 오류',
    unknownError: '알 수 없는 오류',
  },
  success: {
    saved: '저장되었습니다',
    deleted: '삭제되었습니다',
    updated: '업데이트되었습니다',
    sent: '전송되었습니다',
    received: '받았습니다',
    copied: '복사되었습니다',
    shared: '공유되었습니다',
  },
};

// 所有翻译
export const translations: Record<Language, Translations> = {
  zh: zhTranslations,
  en: enTranslations,
  ja: zhTranslations,
  ko: zhTranslations,
};

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 获取浏览器语言
export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('ko')) return 'ko';
  
  return DEFAULT_LANGUAGE;
}

// 语言存储键
export const LANGUAGE_STORAGE_KEY = 'xai-language';

// 保存语言设置
export function saveLanguage(language: Language) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

// 获取保存的语言设置
export function getSavedLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved as Language || null;
}

// 获取当前语言
export function getCurrentLanguage(): Language {
  return getSavedLanguage() || getBrowserLanguage();
} 