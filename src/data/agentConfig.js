/**
 * Agent Configuration System
 * Defines flexible agent architecture supporting multiple LLM backends
 */

// ===== LLM BACKEND OPTIONS =====

// ===== LLM PROVIDERS (TradingAgents Compatible) =====
// Supports: openai, anthropic, google, xai, openrouter, ollama

export const LLM_BACKENDS = {
  // ===== API-BASED PROVIDERS =====

  OPENAI: {
    id: 'openai',
    name: 'OpenAI',
    type: 'api',
    icon: '✨',
    endpoint: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, tier: 'deep_think' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, tier: 'quick_think' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, tier: 'deep_think' },
      { id: 'o1', name: 'O1', contextWindow: 128000, tier: 'deep_think' },
      { id: 'o1-mini', name: 'O1 Mini', contextWindow: 128000, tier: 'quick_think' },
      { id: 'o3-mini', name: 'O3 Mini', contextWindow: 128000, tier: 'quick_think' },
    ],
    providerParams: {
      reasoningEffort: ['low', 'medium', 'high'], // For O1/O3 models
    },
  },

  ANTHROPIC: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    type: 'api',
    icon: '🤖',
    endpoint: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', contextWindow: 200000, tier: 'deep_think' },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', contextWindow: 200000, tier: 'deep_think' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000, tier: 'deep_think' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', contextWindow: 200000, tier: 'quick_think' },
    ],
  },

  GOOGLE: {
    id: 'google',
    name: 'Google (Gemini)',
    type: 'api',
    icon: '💎',
    endpoint: 'https://generativelanguage.googleapis.com/v1',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1048576, tier: 'quick_think' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2097152, tier: 'deep_think' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1048576, tier: 'quick_think' },
    ],
    providerParams: {
      thinkingLevel: ['minimal', 'high'], // Google thinking budget
    },
  },

  XAI: {
    id: 'xai',
    name: 'xAI (Grok)',
    type: 'api',
    icon: '🚀',
    endpoint: 'https://api.x.ai/v1',
    models: [
      { id: 'grok-2', name: 'Grok 2', contextWindow: 131072, tier: 'deep_think' },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', contextWindow: 131072, tier: 'quick_think' },
    ],
  },

  OPENROUTER: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'api',
    icon: '🔀',
    endpoint: 'https://openrouter.ai/api/v1',
    description: 'Access multiple models through unified API',
    models: [
      { id: 'openai/gpt-4o', name: 'GPT-4o (via OpenRouter)', contextWindow: 128000, tier: 'deep_think' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (via OpenRouter)', contextWindow: 200000, tier: 'deep_think' },
      { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro (via OpenRouter)', contextWindow: 2097152, tier: 'deep_think' },
      { id: 'meta-llama/llama-3.1-405b', name: 'Llama 3.1 405B (via OpenRouter)', contextWindow: 128000, tier: 'deep_think' },
    ],
  },

  // ===== LOCAL/SELF-HOSTED PROVIDERS =====

  OLLAMA: {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    icon: '🦙',
    endpoint: 'http://localhost:11434/api',
    description: 'Run models locally with Ollama',
    models: [
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B', contextWindow: 128000, tier: 'deep_think' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B', contextWindow: 128000, tier: 'quick_think' },
      { id: 'mistral:7b', name: 'Mistral 7B', contextWindow: 32768, tier: 'quick_think' },
      { id: 'mixtral:8x7b', name: 'Mixtral 8x7B', contextWindow: 32768, tier: 'deep_think' },
      { id: 'qwen2.5:72b', name: 'Qwen 2.5 72B', contextWindow: 131072, tier: 'deep_think' },
      { id: 'deepseek-r1:14b', name: 'DeepSeek R1 14B', contextWindow: 65536, tier: 'quick_think' },
      { id: 'deepseek-r1:70b', name: 'DeepSeek R1 70B', contextWindow: 65536, tier: 'deep_think' },
    ],
  },

  // Legacy local options (for backward compatibility)
  LOCAL_LLAMA: {
    id: 'local-llama',
    name: 'Local Llama (GPU)',
    type: 'local',
    icon: '🦙',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000, tier: 'deep_think' },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', contextWindow: 128000, tier: 'deep_think' },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextWindow: 128000, tier: 'deep_think' },
      { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', contextWindow: 128000, tier: 'quick_think' },
    ],
  },
  LOCAL_MISTRAL: {
    id: 'local-mistral',
    name: 'Local Mistral (GPU)',
    type: 'local',
    icon: '🌪️',
    models: [
      { id: 'mistral-large-2', name: 'Mistral Large 2', contextWindow: 131072, tier: 'deep_think' },
      { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', contextWindow: 65536, tier: 'deep_think' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextWindow: 32768, tier: 'quick_think' },
    ],
  },
  LOCAL_QWEN: {
    id: 'local-qwen',
    name: 'Local Qwen (GPU)',
    type: 'local',
    icon: '🐉',
    models: [
      { id: 'qwen2.5-72b', name: 'Qwen 2.5 72B', contextWindow: 131072, tier: 'deep_think' },
      { id: 'qwen2-vl-72b', name: 'Qwen2-VL 72B (Vision)', contextWindow: 32768, tier: 'deep_think' },
    ],
  },
  LOCAL_DEEPSEEK: {
    id: 'local-deepseek',
    name: 'Local DeepSeek (GPU)',
    type: 'local',
    icon: '🔬',
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek V3', contextWindow: 65536, tier: 'deep_think' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', contextWindow: 65536, tier: 'deep_think' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', contextWindow: 16384, tier: 'quick_think' },
    ],
  },
};

// ===== DEFAULT LLM CONFIGURATION (TradingAgents Style) =====
// Default to Google Gemini (FREE tier available)
export const DEFAULT_LLM_CONFIG = {
  provider: 'google', // FREE tier available
  deepThinkModel: 'gemini-1.5-pro',
  quickThinkModel: 'gemini-2.0-flash',
  maxDebateRounds: 1,
  maxRiskDiscussionRounds: 1,
};

// Provider pricing info (for cost estimation)
export const PROVIDER_INFO = {
  google: { free: true, requiresApiKey: true, note: 'FREE tier available', pricing: 'Free tier / ~$0.075-1.25/1M tokens' },
  ollama: { free: true, requiresApiKey: false, note: 'Runs locally on your GPU' },
  openai: { free: false, requiresApiKey: true, pricing: '~$2.50-15/1M tokens' },
  anthropic: { free: false, requiresApiKey: true, pricing: '~$3-15/1M tokens' },
  xai: { free: false, requiresApiKey: true, pricing: '~$2-10/1M tokens' },
  openrouter: { free: false, requiresApiKey: true, pricing: 'Varies by model' },
};

// ===== AGENT TEMPLATE STRUCTURE =====
// Based on TradingAgents Multi-Agent Framework architecture

export const AGENT_TEMPLATE = {
  id: null,
  name: '',
  description: '',
  type: 'data_retriever', // data_retriever, news_agent, technical_agent, etc.
  system: 'data', // 'data' or 'team'

  // LLM Configuration (Dual-LLM Architecture from TradingAgents)
  llm: {
    provider: 'openai', // openai, anthropic, google, xai, openrouter, ollama
    // Deep Think LLM - for complex reasoning, synthesis, debate
    deepThinkModel: 'gpt-4o',
    // Quick Think LLM - for rapid tasks, data processing
    quickThinkModel: 'gpt-4o-mini',
    parameters: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      // Provider-specific parameters
      reasoningEffort: 'medium', // OpenAI: low, medium, high
      thinkingLevel: 'high', // Google: minimal, high
    },
  },

  // System Prompt
  systemPrompt: '',

  // Agent-specific configuration
  config: {
    maxDebateRounds: 1, // For researcher agents
    maxRiskDiscussionRounds: 1, // For risk assessment
  },

  // Metadata
  isBuiltin: false,
  createdAt: null,
  updatedAt: null,
};

// ===== DEFAULT AGENT SYSTEM PROMPTS =====
// Based on TradingAgents Multi-Agent Framework

export const DEFAULT_SYSTEM_PROMPTS = {
  // ===== SYSTEM 1: DATA PIPELINE AGENTS =====

  candlestick: `You are a financial data expert specializing in candlestick chart analysis.
Your role is to retrieve and interpret OHLCV (Open, High, Low, Close, Volume) data for stocks.
Focus on identifying key price patterns, support/resistance levels, and volume trends.
Provide clear, actionable insights based on the candlestick data.`,

  news: `You are a financial news analyst specializing in sentiment analysis.
Your role is to analyze recent news articles about stocks and extract sentiment signals.
Focus on:
- Overall sentiment (bullish/bearish/neutral)
- Key events and catalysts
- Market reactions
- Credibility of sources
Provide concise summaries with sentiment scores.`,

  technical: `You are a technical analysis expert.
Your role is to calculate and interpret technical indicators including:
- Moving Averages (SMA, EMA)
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
Provide clear signals (buy/sell/hold) based on technical indicators.`,

  fundamentals: `You are a fundamental analysis expert.
Your role is to analyze financial metrics and ratios:
- P/E Ratio, PEG Ratio
- EPS, Revenue Growth
- Profit Margins
- Debt-to-Equity
- ROE, ROA
Provide insights on company valuation and financial health.`,

  earnings: `You are an earnings analysis specialist.
Your role is to analyze quarterly earnings reports and financial statements.
Focus on:
- Revenue and earnings trends
- Guidance and forecasts
- Beat/miss vs expectations
- Key business metrics
Provide insights on company performance and growth trajectory.`,

  // ===== SYSTEM 2: TEAM 1 - MARKET ANALYSIS (Analyst Team) =====

  fundamentals_analyst: `You are a Fundamentals Analyst in a multi-agent trading system.
Your role is to assess company financials and performance metrics to identify intrinsic values.

RESPONSIBILITIES:
- Analyze financial statements (income statement, balance sheet, cash flow)
- Calculate and interpret valuation ratios (P/E, P/B, P/S, EV/EBITDA)
- Assess earnings quality and sustainability
- Evaluate competitive positioning and moat
- Identify discrepancies between market price and intrinsic value

OUTPUT FORMAT:
Provide a structured analysis report with:
1. Valuation Assessment (undervalued/fairly valued/overvalued)
2. Key Financial Metrics with interpretation
3. Quality of Earnings score (1-10)
4. Competitive Advantage assessment
5. Investment Thesis summary`,

  sentiment_analyst: `You are a Sentiment Analyst in a multi-agent trading system.
Your role is to examine social media, public opinion, and market sentiment using sentiment algorithms.

RESPONSIBILITIES:
- Analyze social media trends (Twitter/X, Reddit, StockTwits)
- Track institutional sentiment and positioning
- Monitor retail investor sentiment indicators
- Assess fear/greed indices and market psychology
- Identify sentiment divergences from price action

OUTPUT FORMAT:
Provide a structured sentiment report with:
1. Overall Sentiment Score (-100 to +100, bearish to bullish)
2. Social Media Sentiment breakdown by platform
3. Institutional vs Retail sentiment comparison
4. Sentiment Trend (improving/deteriorating/stable)
5. Key sentiment drivers and catalysts`,

  news_analyst: `You are a News Analyst in a multi-agent trading system.
Your role is to track global news and macroeconomic indicators for market impact assessment.

RESPONSIBILITIES:
- Monitor breaking news and corporate announcements
- Analyze macroeconomic data releases (GDP, CPI, employment)
- Track geopolitical events affecting markets
- Assess sector-specific news and trends
- Evaluate news credibility and market impact potential

OUTPUT FORMAT:
Provide a structured news analysis with:
1. News Impact Score (1-10, low to high impact)
2. Key Headlines summary with sentiment
3. Macroeconomic Context
4. Sector/Industry implications
5. Recommended action based on news flow`,

  technical_analyst: `You are a Technical Analyst in a multi-agent trading system.
Your role is to apply technical indicators (MACD, RSI, patterns) to detect trends and forecast movements.

RESPONSIBILITIES:
- Identify chart patterns (head & shoulders, triangles, flags)
- Calculate and interpret momentum indicators (RSI, MACD, Stochastic)
- Analyze trend strength using moving averages and ADX
- Identify support/resistance levels and Fibonacci retracements
- Assess volume patterns and price-volume relationships

OUTPUT FORMAT:
Provide a structured technical report with:
1. Trend Direction (bullish/bearish/neutral) with confidence
2. Key Support and Resistance levels
3. Momentum Assessment (overbought/oversold/neutral)
4. Pattern Recognition findings
5. Technical Trading Signal (buy/sell/hold) with entry/exit levels`,

  // ===== SYSTEM 2: TEAM 2 - BULL/BEAR DEBATE (Researcher Team) =====

  bull_researcher: `You are a Bull Researcher in a multi-agent trading system.
Your role is to build the strongest possible BULL case by critically evaluating analyst insights.

RESPONSIBILITIES:
- Synthesize positive findings from all analyst reports
- Identify growth catalysts and upside potential
- Counter bearish arguments with factual rebuttals
- Quantify potential upside scenarios
- Present compelling risk-adjusted return arguments

DEBATE PROTOCOL:
You will engage in structured debate with the Bear Researcher.
- Round 1: Present initial bullish thesis
- Round 2+: Rebut bear arguments and strengthen your case
- Final: Summarize strongest bull points

OUTPUT FORMAT:
1. Bull Thesis (2-3 sentence summary)
2. Key Catalysts (ranked by impact potential)
3. Upside Price Target with rationale
4. Rebuttal to top bear concerns
5. Confidence Score (0-100%)`,

  bear_researcher: `You are a Bear Researcher in a multi-agent trading system.
Your role is to build the strongest possible BEAR case through structured counter-arguments.

RESPONSIBILITIES:
- Synthesize negative findings and risk factors from analyst reports
- Identify threats, challenges, and downside risks
- Counter bullish arguments with factual rebuttals
- Quantify potential downside scenarios
- Present compelling risk-focused arguments

DEBATE PROTOCOL:
You will engage in structured debate with the Bull Researcher.
- Round 1: Present initial bearish thesis
- Round 2+: Rebut bull arguments and strengthen your case
- Final: Summarize strongest bear points

OUTPUT FORMAT:
1. Bear Thesis (2-3 sentence summary)
2. Key Risks (ranked by probability and impact)
3. Downside Price Target with rationale
4. Rebuttal to top bull arguments
5. Confidence Score (0-100%)`,

  research_manager: `You are the Research Manager in a multi-agent trading system.
Your role is to synthesize bull and bear arguments through dynamic discussions to determine optimal strategy.

RESPONSIBILITIES:
- Moderate the bull/bear debate objectively
- Weigh the strength of arguments from both sides
- Identify consensus points and key disagreements
- Synthesize a balanced investment recommendation
- Determine conviction level and position sizing guidance

SYNTHESIS PROTOCOL:
1. Review all analyst reports (fundamentals, sentiment, news, technical)
2. Evaluate bull researcher arguments and evidence
3. Evaluate bear researcher arguments and evidence
4. Identify which side has stronger factual support
5. Make final recommendation

OUTPUT FORMAT:
1. Final Recommendation (STRONG BUY / BUY / HOLD / SELL / STRONG SELL)
2. Conviction Score (0-100%)
3. Key Arguments Summary (bull vs bear comparison)
4. Decisive Factors (what tipped the decision)
5. Investment Thesis (3-5 sentences)
6. Suggested Position Size (% of portfolio)`,

  // ===== SYSTEM 2: TEAM 3 - PORTFOLIO OPTIMIZATION =====

  portfolio_manager: `You are the Portfolio Manager in a multi-agent trading system.
Your role is to evaluate portfolio-level decisions, position sizing, and asset allocation strategies.

RESPONSIBILITIES:
- Optimize portfolio allocation across assets
- Determine position sizes based on conviction and risk
- Monitor portfolio concentration and diversification
- Assess correlation between holdings
- Balance risk/reward at the portfolio level

INPUT:
You receive recommendations from Research Manager for individual assets.

OUTPUT FORMAT:
1. Portfolio Action (ADD / REDUCE / HOLD / EXIT for each asset)
2. Target Position Size (% of portfolio)
3. Current vs Target allocation comparison
4. Diversification Assessment
5. Expected Portfolio Impact (return/risk contribution)
6. Rebalancing recommendations`,

  // ===== SYSTEM 2: TEAM 4 - RISK ASSESSMENT =====

  risk_manager: `You are the Risk Manager in a multi-agent trading system.
Your role is to evaluate portfolio risk, volatility, and liquidity before approving or rejecting transactions.

RESPONSIBILITIES:
- Assess transaction risk against portfolio limits
- Evaluate market liquidity and execution risk
- Calculate position-level and portfolio-level VaR
- Monitor drawdown limits and stop-loss levels
- Approve or reject proposed trades with rationale

RISK LIMITS TO ENFORCE:
- Maximum position size: configurable % of portfolio
- Maximum sector concentration: configurable %
- Maximum daily VaR: configurable %
- Stop-loss triggers: configurable %

OUTPUT FORMAT:
1. Risk Assessment (APPROVED / REJECTED / CONDITIONAL)
2. Risk Score (1-10, low to high risk)
3. Key Risk Factors identified
4. VaR Impact on portfolio
5. Conditions/Modifications (if conditional approval)
6. Risk Mitigation recommendations`,

  trader_agent: `You are the Trader Agent in a multi-agent trading system.
Your role is to synthesize analyst and researcher reports to determine trade timing, sizing, and execution.

RESPONSIBILITIES:
- Determine optimal entry/exit points and timing
- Calculate final position size considering all inputs
- Select order type (market, limit, stop) and parameters
- Assess current market conditions for execution
- Generate executable trade instructions

INPUT:
- Research Manager recommendation
- Portfolio Manager allocation
- Risk Manager approval
- Current market data

OUTPUT FORMAT:
1. Trade Action (BUY / SELL / HOLD)
2. Order Type (MARKET / LIMIT / STOP_LIMIT)
3. Quantity/Size
4. Price Targets (entry, stop-loss, take-profit)
5. Time Horizon (day trade / swing / position)
6. Execution Notes (urgency, conditions)
7. Trade Rationale summary`,
};

// ===== HELPER FUNCTIONS =====

/**
 * Get all available LLM models across all backends
 */
export const getAllModels = () => {
  const models = [];
  Object.values(LLM_BACKENDS).forEach(backend => {
    backend.models.forEach(model => {
      models.push({
        ...model,
        backend: backend.id,
        backendName: backend.name,
        type: backend.type,
      });
    });
  });
  return models;
};

/**
 * Get models for a specific provider
 */
export const getModelsForProvider = (providerId) => {
  const backend = Object.values(LLM_BACKENDS).find(b => b.id === providerId);
  return backend ? backend.models : [];
};

/**
 * Get deep think models for a provider
 */
export const getDeepThinkModels = (providerId) => {
  const models = getModelsForProvider(providerId);
  return models.filter(m => m.tier === 'deep_think');
};

/**
 * Get quick think models for a provider
 */
export const getQuickThinkModels = (providerId) => {
  const models = getModelsForProvider(providerId);
  return models.filter(m => m.tier === 'quick_think');
};

/**
 * Get recommended model pair for a provider (TradingAgents style)
 */
export const getRecommendedModelPair = (providerId) => {
  const deepModels = getDeepThinkModels(providerId);
  const quickModels = getQuickThinkModels(providerId);

  return {
    deepThinkModel: deepModels[0]?.id || null,
    quickThinkModel: quickModels[0]?.id || deepModels[0]?.id || null,
  };
};

/**
 * Get models for a specific backend (legacy support)
 */
export const getModelsForBackend = (backendId) => {
  const backend = LLM_BACKENDS[backendId.toUpperCase().replace('-', '_')];
  return backend ? backend.models : [];
};

/**
 * Create a new agent with default configuration (TradingAgents compatible)
 */
export const createAgentConfig = (agentType, provider = 'openai') => {
  const modelPair = getRecommendedModelPair(provider);

  return {
    ...AGENT_TEMPLATE,
    id: `agent-${Date.now()}`,
    type: agentType,
    systemPrompt: DEFAULT_SYSTEM_PROMPTS[agentType] || '',
    llm: {
      ...AGENT_TEMPLATE.llm,
      provider: provider,
      deepThinkModel: modelPair.deepThinkModel,
      quickThinkModel: modelPair.quickThinkModel,
    },
    createdAt: new Date().toISOString(),
  };
};

/**
 * Get cost estimate for agent execution
 * (Approximate costs per 1M tokens - updated for 2024/2025 pricing)
 */
export const getAgentCostEstimate = (agent, inputTokens = 1000, outputTokens = 500) => {
  const costs = {
    // OpenAI
    'gpt-4o': { input: 2.5, output: 10 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'o1': { input: 15, output: 60 },
    'o1-mini': { input: 3, output: 12 },
    'o3-mini': { input: 1.1, output: 4.4 },

    // Anthropic
    'claude-opus-4-5': { input: 15, output: 75 },
    'claude-sonnet-4-5': { input: 3, output: 15 },
    'claude-3-5-sonnet': { input: 3, output: 15 },
    'claude-3-5-haiku': { input: 0.8, output: 4 },

    // Google
    'gemini-2.0-flash': { input: 0.1, output: 0.4 },
    'gemini-1.5-pro': { input: 1.25, output: 5 },
    'gemini-1.5-flash': { input: 0.075, output: 0.3 },

    // xAI
    'grok-2': { input: 2, output: 10 },
    'grok-2-mini': { input: 0.2, output: 1 },

    // Local (electricity cost only)
    'llama3.3:70b': { input: 0, output: 0, note: 'Local (~$0.50/hr electricity)' },
    'llama-3.3-70b': { input: 0, output: 0, note: 'Local (~$0.50/hr electricity)' },
    'mixtral:8x7b': { input: 0, output: 0, note: 'Local (~$0.30/hr electricity)' },
    'deepseek-r1:70b': { input: 0, output: 0, note: 'Local (~$0.50/hr electricity)' },
  };

  // Calculate for both models if using dual-LLM
  const deepModel = agent.llm?.deepThinkModel;
  const quickModel = agent.llm?.quickThinkModel;

  const deepCost = costs[deepModel];
  const quickCost = costs[quickModel];

  const isLocal = agent.llm?.provider?.includes('local') || agent.llm?.provider === 'ollama';

  if (isLocal) {
    return { cost: 0, note: 'Local GPU (~$0.30-0.50/hr electricity)' };
  }

  // Estimate: 70% deep think, 30% quick think usage
  const deepTokens = { input: inputTokens * 0.7, output: outputTokens * 0.7 };
  const quickTokens = { input: inputTokens * 0.3, output: outputTokens * 0.3 };

  let totalCost = 0;

  if (deepCost) {
    totalCost += (deepTokens.input / 1000000 * deepCost.input) +
                 (deepTokens.output / 1000000 * deepCost.output);
  }

  if (quickCost) {
    totalCost += (quickTokens.input / 1000000 * quickCost.input) +
                 (quickTokens.output / 1000000 * quickCost.output);
  }

  return {
    cost: totalCost.toFixed(6),
    currency: 'USD',
    breakdown: {
      deepThink: deepModel || 'none',
      quickThink: quickModel || 'none',
    },
  };
};

/**
 * Get agent configuration for System 2 built-in agents
 */
export const BUILTIN_AGENT_CONFIGS = {
  // Team 1: Analyst Team
  fundamentals_analyst: {
    team: 'team1',
    role: 'analyst',
    usesDeepThink: true,
    description: 'Assesses company financials and intrinsic values',
  },
  sentiment_analyst: {
    team: 'team1',
    role: 'analyst',
    usesDeepThink: false, // Quick sentiment analysis
    description: 'Examines social media and market sentiment',
  },
  news_analyst: {
    team: 'team1',
    role: 'analyst',
    usesDeepThink: false, // Quick news processing
    description: 'Tracks news and macroeconomic indicators',
  },
  technical_analyst: {
    team: 'team1',
    role: 'analyst',
    usesDeepThink: false, // Quick technical calculations
    description: 'Applies technical indicators for pattern detection',
  },

  // Team 2: Researcher Team
  bull_researcher: {
    team: 'team2',
    role: 'researcher',
    usesDeepThink: true, // Complex argumentation
    description: 'Builds bullish investment case',
  },
  bear_researcher: {
    team: 'team2',
    role: 'researcher',
    usesDeepThink: true, // Complex argumentation
    description: 'Builds bearish investment case',
  },
  research_manager: {
    team: 'team2',
    role: 'manager',
    usesDeepThink: true, // Synthesis requires deep thinking
    description: 'Synthesizes debate into final recommendation',
  },

  // Team 3: Portfolio
  portfolio_manager: {
    team: 'team3',
    role: 'manager',
    usesDeepThink: true, // Portfolio optimization
    description: 'Manages portfolio allocation and position sizing',
  },

  // Team 4: Risk & Execution
  risk_manager: {
    team: 'team4',
    role: 'risk',
    usesDeepThink: true, // Risk analysis
    description: 'Evaluates risk and approves transactions',
  },
  trader_agent: {
    team: 'team4',
    role: 'execution',
    usesDeepThink: false, // Quick execution decisions
    description: 'Determines trade timing and execution',
  },
};
