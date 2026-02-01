/**
 * Asset Database
 *
 * Comprehensive list of assets available for analysis:
 * - US Market Indices
 * - Individual Companies (Stocks)
 * - Sector ETFs
 * - International Markets
 */

export const US_INDICES = [
  {
    ticker: 'SPY',
    name: 'S&P 500',
    description: 'US Large Cap Stocks',
    type: 'index',
    category: 'us_indices',
    icon: '📊',
    holdings: 505,
    expense_ratio: 0.09,
  },
  {
    ticker: 'QQQ',
    name: 'NASDAQ-100',
    description: 'Tech-Heavy Index',
    type: 'index',
    category: 'us_indices',
    icon: '💻',
    holdings: 101,
    expense_ratio: 0.20,
  },
  {
    ticker: 'DIA',
    name: 'Dow Jones',
    description: '30 Blue Chip Stocks',
    type: 'index',
    category: 'us_indices',
    icon: '🏭',
    holdings: 30,
    expense_ratio: 0.16,
  },
  {
    ticker: 'IWM',
    name: 'Russell 2000',
    description: 'US Small Cap Stocks',
    type: 'index',
    category: 'us_indices',
    icon: '🏢',
    holdings: 1962,
    expense_ratio: 0.19,
  },
  {
    ticker: 'MDY',
    name: 'S&P 400 Mid Cap',
    description: 'US Mid Cap Stocks',
    type: 'index',
    category: 'us_indices',
    icon: '🌐',
    holdings: 400,
    expense_ratio: 0.23,
  },
  {
    ticker: 'VTI',
    name: 'Total Stock Market',
    description: 'Entire US Market',
    type: 'index',
    category: 'us_indices',
    icon: '📈',
    holdings: 3700,
    expense_ratio: 0.03,
  },
];

export const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', description: 'iPhone, Mac, Services', type: 'stock', icon: '🍎' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', description: 'Cloud, OS, AI', type: 'stock', icon: '🪟' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', description: 'Search, Cloud, AI', type: 'stock', icon: '🔍' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', description: 'E-commerce, AWS, Cloud', type: 'stock', icon: '📦' },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', description: 'EVs, Solar, AI', type: 'stock', icon: '⚡' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', description: 'Social, VR, AI', type: 'stock', icon: '👥' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', description: 'GPUs, AI Chips', type: 'stock', icon: '🎮' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial', description: 'Investment Banking', type: 'stock', icon: '💰' },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Financial', description: 'Payment Processing', type: 'stock', icon: '💳' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', description: 'Pharmaceuticals', type: 'stock', icon: '🏥' },
  { ticker: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive', description: 'Retail Chain', type: 'stock', icon: '🛒' },
  { ticker: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', description: 'Consumer Goods', type: 'stock', icon: '🧴' },
  { ticker: 'MA', name: 'Mastercard Inc.', sector: 'Financial', description: 'Payment Processing', type: 'stock', icon: '💳' },
  { ticker: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare', description: 'Health Insurance', type: 'stock', icon: '🏥' },
  { ticker: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical', description: 'Home Improvement', type: 'stock', icon: '🔨' },
  { ticker: 'DIS', name: 'Walt Disney Co.', sector: 'Communication', description: 'Entertainment, Streaming', type: 'stock', icon: '🎬' },
  { ticker: 'BAC', name: 'Bank of America Corp.', sector: 'Financial', description: 'Banking Services', type: 'stock', icon: '🏦' },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Communication', description: 'Streaming Platform', type: 'stock', icon: '📺' },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', description: 'Creative Software', type: 'stock', icon: '🎨' },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', description: 'CRM Software', type: 'stock', icon: '☁️' },
];

export const SECTOR_ETFS = [
  {
    ticker: 'XLK',
    name: 'Technology',
    description: 'Tech Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '💻',
    holdings: 75,
    top_holdings: ['AAPL', 'MSFT', 'NVDA'],
  },
  {
    ticker: 'XLF',
    name: 'Financial',
    description: 'Finance Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '💰',
    holdings: 68,
    top_holdings: ['JPM', 'BAC', 'WFC'],
  },
  {
    ticker: 'XLV',
    name: 'Healthcare',
    description: 'Health Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🏥',
    holdings: 63,
    top_holdings: ['UNH', 'JNJ', 'LLY'],
  },
  {
    ticker: 'XLE',
    name: 'Energy',
    description: 'Energy Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '⚡',
    holdings: 21,
    top_holdings: ['XOM', 'CVX', 'COP'],
  },
  {
    ticker: 'XLI',
    name: 'Industrials',
    description: 'Industrial Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🏭',
    holdings: 77,
    top_holdings: ['CAT', 'GE', 'UPS'],
  },
  {
    ticker: 'XLRE',
    name: 'Real Estate',
    description: 'Real Estate ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🏠',
    holdings: 30,
    top_holdings: ['AMT', 'PLD', 'CCI'],
  },
  {
    ticker: 'XLY',
    name: 'Consumer Discretionary',
    description: 'Consumer Disc. ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🛒',
    holdings: 52,
    top_holdings: ['AMZN', 'TSLA', 'HD'],
  },
  {
    ticker: 'XLP',
    name: 'Consumer Staples',
    description: 'Consumer Staple ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🛍️',
    holdings: 31,
    top_holdings: ['PG', 'KO', 'PEP'],
  },
  {
    ticker: 'XLB',
    name: 'Materials',
    description: 'Materials Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '🔬',
    holdings: 28,
    top_holdings: ['LIN', 'APD', 'SHW'],
  },
  {
    ticker: 'XLC',
    name: 'Communication',
    description: 'Comm Services ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '📡',
    holdings: 22,
    top_holdings: ['META', 'GOOGL', 'NFLX'],
  },
  {
    ticker: 'XLU',
    name: 'Utilities',
    description: 'Utilities Sector ETF',
    type: 'sector_etf',
    category: 'sector_etfs',
    icon: '⚙️',
    holdings: 30,
    top_holdings: ['NEE', 'DUK', 'SO'],
  },
];

export const INTERNATIONAL = [
  {
    ticker: 'EFA',
    name: 'MSCI EAFE',
    description: 'Developed Markets (Europe, Asia)',
    type: 'international',
    category: 'international',
    icon: '🌎',
    holdings: 900,
    region: 'Developed Markets',
  },
  {
    ticker: 'FXI',
    name: 'China Large Cap',
    description: 'China Large Cap Stocks',
    type: 'international',
    category: 'international',
    icon: '🇨🇳',
    holdings: 50,
    region: 'China',
  },
  {
    ticker: 'VGK',
    name: 'European Stocks',
    description: 'European Markets',
    type: 'international',
    category: 'international',
    icon: '🇪🇺',
    holdings: 1300,
    region: 'Europe',
  },
  {
    ticker: 'EWJ',
    name: 'Japan',
    description: 'Japanese Stocks',
    type: 'international',
    category: 'international',
    icon: '🇯🇵',
    holdings: 320,
    region: 'Japan',
  },
  {
    ticker: 'EEM',
    name: 'Emerging Markets',
    description: 'Developing Markets',
    type: 'international',
    category: 'international',
    icon: '🌏',
    holdings: 1400,
    region: 'Emerging',
  },
];

// Helper function to get all assets
export const getAllAssets = () => {
  return [
    ...US_INDICES,
    ...COMPANIES,
    ...SECTOR_ETFS,
    ...INTERNATIONAL,
  ];
};

// Helper function to get assets by category
export const getAssetsByCategory = (category) => {
  const categoryMap = {
    us_indices: US_INDICES,
    companies: COMPANIES,
    sector_etfs: SECTOR_ETFS,
    international: INTERNATIONAL,
  };
  return categoryMap[category] || [];
};

// Helper function to search assets
export const searchAssets = (query) => {
  const allAssets = getAllAssets();
  const lowerQuery = query.toLowerCase();

  return allAssets.filter(
    (asset) =>
      asset.ticker.toLowerCase().includes(lowerQuery) ||
      asset.name.toLowerCase().includes(lowerQuery) ||
      (asset.description && asset.description.toLowerCase().includes(lowerQuery)) ||
      (asset.sector && asset.sector.toLowerCase().includes(lowerQuery))
  );
};

// Helper to detect asset type
export const detectAssetType = (ticker) => {
  const allAssets = getAllAssets();
  const asset = allAssets.find((a) => a.ticker === ticker);
  return asset ? asset.type : 'stock';
};
