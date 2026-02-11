# Event Horizon

AI-powered financial analysis platform with a visual pipeline builder for creating multi-agent research workflows.

## Overview

Event Horizon lets you build and run financial analysis pipelines by wiring together data agents and AI-powered analyzers on a visual canvas. It supports multiple LLM providers (including free tiers) and ships with a library of pre-built agents for market data retrieval, technical analysis, earnings forecasting, and more.

## Key Features

- **Landing Page** — Search-first interface with AI-powered web search for financial queries, quick action buttons, and voice input
- **Horizon Builder** — Node-based visual pipeline editor (ReactFlow) for creating analysis workflows with drag-and-drop agent nodes, auto-layout, box selection, and real-time execution console
- **Agent Library** — Browse, activate/deactivate, and create custom agents; AI-generated system prompts from natural language descriptions
- **Market Dashboard** — Track stocks, crypto, and indices with sortable columns for price, market cap, P/E, YTD %, 1Y return, and 52-week high delta
- **Portfolio Analyzer** — Multi-stock analysis aggregating candlestick charts, news, technical indicators, earnings, and fundamentals across 20+ pre-defined tickers

## Agent System

### Data Agents (System 1)

| Agent | Description |
|---|---|
| Candlestick | OHLCV price data |
| Earnings | Quarterly earnings, EPS history, revenue |
| News | Recent articles, headlines, press releases |
| Technical | SMA, RSI, MACD, Bollinger Bands |
| Fundamentals | P/E ratio, EPS, dividend yield, market cap |
| Insider Trades | SEC insider transaction filings |
| Options Chain | Calls, puts, strike prices, implied volatility |
| SEC Filings | 10-K, 10-Q, 8-K regulatory documents |
| Macro Economics | GDP, CPI, unemployment, interest rates |
| Sentiment | Social media mentions, analyst ratings, short interest |

### Analyzer Agents (System 2)

| Agent | Description |
|---|---|
| Bull-Bear Analyzer | Debates bullish and bearish perspectives |
| Risk Manager | Evaluates portfolio risk and position sizing |
| Trend Analyzer | Price trends, support/resistance, chart patterns |
| Valuation Analyst | DCF, comparable company analysis, intrinsic value |
| Sector Rotator | Sector performance cycles and allocation shifts |
| Correlation Mapper | Cross-asset correlations and divergences |
| Earnings Forecaster | Predicts earnings surprises using historical patterns |

### Multi-LLM Backend

| Provider | Models | Notes |
|---|---|---|
| Google | Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash | FREE tier available |
| Ollama | Llama 3.3 70B, Mistral, Mixtral, Qwen, DeepSeek | Local, no API key |
| OpenAI | GPT-4o, GPT-4o Mini, GPT-4 Turbo, O1, O3-Mini | |
| Anthropic | Claude Opus 4.5, Sonnet 4.5, 3.5 Sonnet, 3.5 Haiku | |
| xAI | Grok 2, Grok 2 Mini | |
| OpenRouter | Unified access to multiple providers | |

Each pipeline node can use a **Deep Think** model (complex reasoning/debate) or **Quick Think** model (rapid data processing).

## Tech Stack

- **React 19** with React Router v6
- **Chakra UI** — component library and theming
- **ReactFlow** — node-based visual pipeline canvas
- **React Query** (TanStack) — server state management
- **ApexCharts** — candlestick and financial charts
- **Dagre** — automatic graph layout
- **Axios** — HTTP client
- **Framer Motion** — animations
- **Docker + Nginx** — production deployment

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

### Install & Run

```bash
git clone https://github.com/EventHorizon6626/FE.git
cd FE
yarn install
```

Create a `.env` file in the project root:

```env
REACT_APP_BE_API_URL=http://localhost:4000
REACT_APP_AI_API_URL=http://localhost:5000
```

Start the development server:

```bash
yarn start
```

The app runs at `http://localhost:3000` by default.

## Project Structure

```
src/
  assets/          Static images and icons
  auth/            Auth guard utilities
  components/      Shared UI components
  context/         React context providers (Auth)
  contexts/        Additional context providers
  data/            Agent configs, securities dictionary, library agents
  hooks/           Custom React hooks
  layouts/         Page layout shells
  lib/             API clients and env config
  routes.js        Route definitions
  theme/           Chakra UI theme overrides
  utils/           Helper utilities
  views/
    admin/
      landing/     Home search page
      pipeline/    Horizon list & visual builder canvas
      library/     Agent library (browse, activate, create)
      dashboard/   Market dashboard
      portfolio/   Portfolio analyzer
      profile/     User profile
    auth/
      signIn/      Sign-in page
```

## Docker Deployment

The app builds as a multi-stage Docker image (Node 18 build + Nginx serve) and exposes port 80.

```bash
# Build and start
yarn docker:up

# Rebuild after code changes
yarn docker:restart

# Stop
yarn docker:down

# View logs
yarn docker:logs

# Full production deploy (down + build + up)
yarn prod:deploy
```

Set `REACT_APP_BE_API_URL` in your environment or `.env` before building — it gets baked into the static bundle at build time.

## Scripts

| Command | Description |
|---|---|
| `yarn start` | Start dev server |
| `yarn build` | Production build |
| `yarn test` | Run tests |
| `yarn lint` | Lint `src/` |
| `yarn lint:fix` | Lint and auto-fix |
| `yarn docker:up` | Build and start Docker container |
| `yarn docker:down` | Stop Docker container |
| `yarn docker:restart` | Rebuild and restart |
| `yarn docker:logs` | Tail container logs |
| `yarn prod:deploy` | Full production deploy |
