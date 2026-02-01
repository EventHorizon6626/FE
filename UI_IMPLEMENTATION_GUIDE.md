# Multi-Asset UI Implementation Guide

## 🎉 What Was Built

A comprehensive **multi-asset selection interface** that allows users to analyze:
- **US Market Indices** (SPY, QQQ, DIA, etc.)
- **Individual Companies** (AAPL, TSLA, NVDA, etc.)
- **Sector ETFs** (XLK, XLF, XLV, etc.)
- **International Markets** (EFA, FXI, EWJ, etc.)

---

## 📂 New Files Created

```
FE/
├── src/
│   ├── data/
│   │   └── assets.js                    ← Asset database (stocks, indices, ETFs)
│   │
│   ├── components/
│   │   └── assets/
│   │       ├── AssetTable.jsx           ← Table component with selection
│   │       └── AssetSelector.jsx        ← Main tabbed interface
│   │
│   └── views/
│       └── admin/
│           └── portfolio/
│               ├── PortfolioAnalyzer.jsx          ← New main page
│               └── components/
│                   └── StockAnalysisCard.jsx      ← Extracted card component
```

---

## 🚀 How to Use

### 1. Start the Frontend

```bash
cd FE
yarn install  # Install dependencies if needed
yarn start    # Start development server
```

### 2. Navigate to Portfolio Page

Go to: `http://localhost:3000/portfolio`

### 3. Select Assets

**Option A: Browse by Category**
- Click tabs: **US Indices**, **Companies**, **Sector ETFs**, **International**
- Click on any asset to select it
- Multiple selection supported

**Option B: Search**
- Use search bar to find assets by:
  - Ticker (AAPL, SPY, XLK)
  - Company name (Apple, Microsoft)
  - Sector (Technology, Finance)

**Option C: Bulk Select**
- Click checkbox in table header to select all visible assets

### 4. Analyze

- Click **"Analyze Selected"** button at bottom
- Or click **"Analyze"** button next to individual asset

---

## 🎨 UI Features

### Tabbed Interface
```
[US Indices (6)] [Companies (20)] [Sector ETFs (11)] [International (5)] [All (42)]
```

Each tab shows relevant assets with:
- Asset icon (emoji)
- Asset name and description
- Ticker badge
- Holdings count (for indices/ETFs)
- Sector (for stocks)
- Quick analyze button

### Search & Filter
- Real-time search across all fields
- Works across all tabs
- Shows match count

### Selection UI
- Checkbox selection (multi-select)
- Selected count badge
- Sticky action bar when items selected
- Visual feedback (teal highlight)

### Results Display
- Summary stats (Charts, News, Technical, etc.)
- Per-asset analysis cards
- Asset type badges (stock, index, etf)
- Collapsible sections

---

## 🔧 Customization

### Add More Assets

Edit `FE/src/data/assets.js`:

```javascript
export const COMPANIES = [
  // Add new stock
  {
    ticker: 'COIN',
    name: 'Coinbase',
    sector: 'Technology',
    description: 'Crypto Exchange',
    type: 'stock',
    icon: '💰'
  },
  // ... existing stocks
];
```

### Change Colors

Edit colors in components:

```javascript
const brandColor = 'teal.600';  // Change to 'blue.600', 'purple.600', etc.
```

### Modify Tabs

Edit `AssetSelector.jsx`:

```javascript
const tabs = [
  { name: 'US Indices', icon: MdShowChart, assets: US_INDICES },
  // Add new tab
  { name: 'Crypto', icon: MdCurrency, assets: CRYPTO_ASSETS },
];
```

---

## 🔌 Backend Integration

### Current API Calls

```javascript
// When user clicks "Analyze Selected"
POST /ai/portfolio/analyze
{
  "stocks": ["SPY", "AAPL", "XLK"],
  "asset_types": [
    { "ticker": "SPY", "type": "index" },
    { "ticker": "AAPL", "type": "stock" },
    { "ticker": "XLK", "type": "sector_etf" }
  ]
}

POST /ai/chart
{
  "stocks": ["SPY", "AAPL", "XLK"]
}
```

### Asset Type Detection

The UI automatically detects asset types using `detectAssetType()`:

```javascript
import { detectAssetType } from 'data/assets';

const type = detectAssetType('SPY');  // Returns: "index"
const type = detectAssetType('AAPL'); // Returns: "stock"
const type = detectAssetType('XLK');  // Returns: "sector_etf"
```

This can be used to:
- Adjust LLM prompts in backend
- Show different UI for different asset types
- Apply different analysis strategies

---

## 📊 Asset Categories

### US Indices (6 assets)
- SPY (S&P 500)
- QQQ (NASDAQ-100)
- DIA (Dow Jones)
- IWM (Russell 2000)
- MDY (S&P 400 Mid Cap)
- VTI (Total Stock Market)

### Companies (20 stocks)
- Tech: AAPL, MSFT, GOOGL, NVDA, META, etc.
- Finance: JPM, V, MA, BAC
- Healthcare: JNJ, UNH
- Retail: WMT, HD
- Entertainment: DIS, NFLX

### Sector ETFs (11 sectors)
- XLK (Technology)
- XLF (Financial)
- XLV (Healthcare)
- XLE (Energy)
- XLI (Industrials)
- XLRE (Real Estate)
- XLY (Consumer Discretionary)
- XLP (Consumer Staples)
- XLB (Materials)
- XLC (Communication)
- XLU (Utilities)

### International (5 markets)
- EFA (MSCI EAFE - Developed)
- FXI (China)
- VGK (Europe)
- EWJ (Japan)
- EEM (Emerging Markets)

**Total: 42 assets** ready for analysis!

---

## 🎯 Next Steps

### For Hackathon Demo:
1. **Test the UI** - Make sure all tabs work
2. **Add 2-3 indices to demo** - Show SPY + AAPL side-by-side
3. **Update backend** - Handle asset_types parameter
4. **Screenshot the UI** - For presentation slides

### Future Enhancements:
1. **Real-time prices** - Integrate live price API
2. **Watchlist** - Save favorite assets
3. **Portfolio builder** - Weight allocation
4. **Comparison view** - Side-by-side analysis
5. **Asset details page** - Click asset for deep dive

---

## 🐛 Troubleshooting

### Search not working?
- Check console for errors
- Verify search function in `data/assets.js`

### Assets not showing?
- Check import in `PortfolioAnalyzer.jsx`
- Verify asset data structure in `data/assets.js`

### Selection not highlighting?
- Check Chakra UI theme
- Verify `teal.50` color exists

### API errors?
- Backend might not support `asset_types` yet
- Check browser console
- Verify API endpoint `/ai/portfolio/analyze`

---

## 💡 Pro Tips

1. **Use "All" tab for cross-category selection**
   - Select SPY (index) + AAPL (stock) + XLK (sector)
   - Great for portfolio diversification demo

2. **Search is powerful**
   - Type "tech" to find all tech stocks + XLK sector
   - Type "international" to find all global assets

3. **Show asset type badges**
   - In results, each asset shows its type
   - Demonstrates multi-asset capability

4. **Sticky action bar**
   - Scrolls with user for easy access
   - Shows selected asset preview

---

## 🎨 UI Screenshots

### Main View (Tabs)
```
┌────────────────────────────────────────┐
│ [US Indices (6)] [Companies (20)] ... │
├────────────────────────────────────────┤
│ Search: [Apple, SPY, Tech...]          │
├────────────────────────────────────────┤
│ ☐ SPY  S&P 500          [Analyze]     │
│ ☐ QQQ  NASDAQ-100       [Analyze]     │
│ ☐ DIA  Dow Jones        [Analyze]     │
└────────────────────────────────────────┘
```

### Selection View
```
┌────────────────────────────────────────┐
│ 3 assets selected                      │
│ SPY, AAPL, XLK                         │
│                                        │
│ [Clear] [Analyze Selected]             │
└────────────────────────────────────────┘
```

### Results View
```
┌────────────────────────────────────────┐
│ [index] SPY                            │
│ ┌────────────────────────────────────┐ │
│ │ 📊 Price Chart                     │ │
│ │ 📰 News (25)                       │ │
│ │ 📈 Technical Indicators (5)        │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

Built for **Event Horizon x Opik Hackathon 2026** 🚀
