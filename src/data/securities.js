// Dictionary of stocks, indices, and ETFs
export const SECURITIES = [
  // Major Indices
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'Index ETF', category: 'Indices' },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF', type: 'Index ETF', category: 'Indices' },
  { symbol: 'DIA', name: 'Dow Jones Industrial Average ETF', type: 'Index ETF', category: 'Indices' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', type: 'Index ETF', category: 'Indices' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'Index ETF', category: 'Indices' },

  // Tech Giants (Magnificent 7)
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', category: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', type: 'Stock', category: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc. (Facebook)', type: 'Stock', category: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Stock', category: 'Technology' },

  // Other Major Tech
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'Stock', category: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'Stock', category: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'Stock', category: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', type: 'Stock', category: 'Technology' },

  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Stock', category: 'Financials' },
  { symbol: 'BAC', name: 'Bank of America Corp.', type: 'Stock', category: 'Financials' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'Stock', category: 'Financials' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', type: 'Stock', category: 'Financials' },
  { symbol: 'MS', name: 'Morgan Stanley', type: 'Stock', category: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', type: 'Stock', category: 'Financials' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'Stock', category: 'Financials' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', type: 'Stock', category: 'Financials' },

  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Stock', category: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', type: 'Stock', category: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', type: 'Stock', category: 'Healthcare' },

  // Consumer
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'Stock', category: 'Consumer' },
  { symbol: 'HD', name: 'Home Depot Inc.', type: 'Stock', category: 'Consumer' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'Stock', category: 'Consumer' },
  { symbol: 'KO', name: 'Coca-Cola Company', type: 'Stock', category: 'Consumer' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'Stock', category: 'Consumer' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', type: 'Stock', category: 'Consumer' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'Stock', category: 'Consumer' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', type: 'Stock', category: 'Consumer' },

  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'Stock', category: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'Stock', category: 'Energy' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'Stock', category: 'Energy' },

  // Sector ETFs
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLV', name: 'Health Care Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLI', name: 'Industrial Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLU', name: 'Utilities Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'XLRE', name: 'Real Estate Select Sector SPDR', type: 'Sector ETF', category: 'ETFs' },

  // Bond ETFs
  { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'Bond ETF', category: 'ETFs' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'Bond ETF', category: 'ETFs' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'Bond ETF', category: 'ETFs' },
  { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF', type: 'Bond ETF', category: 'ETFs' },

  // International ETFs
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', type: 'International ETF', category: 'ETFs' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'International ETF', category: 'ETFs' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', type: 'International ETF', category: 'ETFs' },

  // Commodity ETFs
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'Commodity ETF', category: 'ETFs' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'Commodity ETF', category: 'ETFs' },
  { symbol: 'USO', name: 'United States Oil Fund', type: 'Commodity ETF', category: 'ETFs' },

  // Crypto-related
  { symbol: 'COIN', name: 'Coinbase Global Inc.', type: 'Stock', category: 'Crypto' },
  { symbol: 'MSTR', name: 'MicroStrategy Inc.', type: 'Stock', category: 'Crypto' },
  { symbol: 'RIOT', name: 'Riot Platforms Inc.', type: 'Stock', category: 'Crypto' },
  { symbol: 'MARA', name: 'Marathon Digital Holdings', type: 'Stock', category: 'Crypto' },

  // AI/Semiconductors
  { symbol: 'SMH', name: 'VanEck Semiconductor ETF', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', type: 'Sector ETF', category: 'ETFs' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing', type: 'Stock', category: 'Technology' },
  { symbol: 'ASML', name: 'ASML Holding N.V.', type: 'Stock', category: 'Technology' },

  // ARK Innovation ETFs
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'Thematic ETF', category: 'ETFs' },
  { symbol: 'ARKW', name: 'ARK Next Generation Internet ETF', type: 'Thematic ETF', category: 'ETFs' },
  { symbol: 'ARKG', name: 'ARK Genomic Revolution ETF', type: 'Thematic ETF', category: 'ETFs' },

  // Growth & Value ETFs
  { symbol: 'VUG', name: 'Vanguard Growth ETF', type: 'Style ETF', category: 'ETFs' },
  { symbol: 'VTV', name: 'Vanguard Value ETF', type: 'Style ETF', category: 'ETFs' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'Index ETF', category: 'ETFs' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'Index ETF', category: 'ETFs' },

  // Additional Popular Tech
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'SQ', name: 'Block Inc. (Square)', type: 'Stock', category: 'Technology' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'LYFT', name: 'Lyft Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'SNAP', name: 'Snap Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.', type: 'Stock', category: 'Technology' },
  { symbol: 'PINS', name: 'Pinterest Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'TWLO', name: 'Twilio Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'DDOG', name: 'Datadog Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', type: 'Stock', category: 'Technology' },
  { symbol: 'ZM', name: 'Zoom Video Communications', type: 'Stock', category: 'Technology' },
  { symbol: 'DOCU', name: 'DocuSign Inc.', type: 'Stock', category: 'Technology' },

  // Communications & Media
  { symbol: 'DIS', name: 'Walt Disney Company', type: 'Stock', category: 'Communications' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', type: 'Stock', category: 'Communications' },
  { symbol: 'T', name: 'AT&T Inc.', type: 'Stock', category: 'Communications' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', type: 'Stock', category: 'Communications' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Stock', category: 'Communications' },

  // Industrials
  { symbol: 'BA', name: 'Boeing Company', type: 'Stock', category: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', type: 'Stock', category: 'Industrials' },
  { symbol: 'GE', name: 'General Electric Company', type: 'Stock', category: 'Industrials' },
  { symbol: 'MMM', name: '3M Company', type: 'Stock', category: 'Industrials' },
  { symbol: 'UPS', name: 'United Parcel Service Inc.', type: 'Stock', category: 'Industrials' },
  { symbol: 'FDX', name: 'FedEx Corporation', type: 'Stock', category: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', type: 'Stock', category: 'Industrials' },
  { symbol: 'RTX', name: 'Raytheon Technologies Corp.', type: 'Stock', category: 'Industrials' },

  // Electric Vehicles
  { symbol: 'F', name: 'Ford Motor Company', type: 'Stock', category: 'Automotive' },
  { symbol: 'GM', name: 'General Motors Company', type: 'Stock', category: 'Automotive' },
  { symbol: 'RIVN', name: 'Rivian Automotive Inc.', type: 'Stock', category: 'Automotive' },
  { symbol: 'LCID', name: 'Lucid Group Inc.', type: 'Stock', category: 'Automotive' },
  { symbol: 'NIO', name: 'NIO Inc.', type: 'Stock', category: 'Automotive' },

  // Biotech & Pharma
  { symbol: 'MRNA', name: 'Moderna Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'BNTX', name: 'BioNTech SE', type: 'Stock', category: 'Healthcare' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', type: 'Stock', category: 'Healthcare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals', type: 'Stock', category: 'Healthcare' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals Inc.', type: 'Stock', category: 'Healthcare' },

  // Real Estate
  { symbol: 'AMT', name: 'American Tower Corporation', type: 'Stock', category: 'Real Estate' },
  { symbol: 'PLD', name: 'Prologis Inc.', type: 'Stock', category: 'Real Estate' },
  { symbol: 'SPG', name: 'Simon Property Group Inc.', type: 'Stock', category: 'Real Estate' },

  // Dividend ETFs
  { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', type: 'Dividend ETF', category: 'ETFs' },
  { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', type: 'Dividend ETF', category: 'ETFs' },
  { symbol: 'DVY', name: 'iShares Select Dividend ETF', type: 'Dividend ETF', category: 'ETFs' },

  // Leveraged/Inverse ETFs (Advanced)
  { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x)', type: 'Leveraged ETF', category: 'ETFs' },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ (-3x)', type: 'Inverse ETF', category: 'ETFs' },
  { symbol: 'UPRO', name: 'ProShares UltraPro S&P500 (3x)', type: 'Leveraged ETF', category: 'ETFs' },
  { symbol: 'SPXU', name: 'ProShares UltraPro Short S&P500 (-3x)', type: 'Inverse ETF', category: 'ETFs' },
];

// Helper function to search securities
export const searchSecurities = (query) => {
  if (!query || query.length < 1) return [];

  const searchTerm = query.toLowerCase();

  return SECURITIES.filter(security =>
    security.symbol.toLowerCase().includes(searchTerm) ||
    security.name.toLowerCase().includes(searchTerm) ||
    security.type.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Return top 10 matches
};

// Helper to get security by symbol
export const getSecurityBySymbol = (symbol) => {
  return SECURITIES.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
};
