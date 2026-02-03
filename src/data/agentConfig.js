/**
 * Agent Configuration System
 * Defines flexible agent architecture supporting multiple LLM backends
 */

// ===== LLM BACKEND OPTIONS =====

export const LLM_BACKENDS = {
  // API-based LLMs
  CLAUDE: {
    id: 'claude',
    name: 'Claude (Anthropic API)',
    type: 'api',
    icon: '🤖',
    models: [
      { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', contextWindow: 200000 },
      { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', contextWindow: 200000 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', contextWindow: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', contextWindow: 200000 },
    ],
  },
  OPENAI: {
    id: 'openai',
    name: 'OpenAI (GPT)',
    type: 'api',
    icon: '✨',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000 },
      { id: 'gpt-4', name: 'GPT-4', contextWindow: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16384 },
      { id: 'o1', name: 'O1', contextWindow: 128000 },
      { id: 'o1-mini', name: 'O1 Mini', contextWindow: 128000 },
    ],
  },
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'api',
    icon: '💎',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', contextWindow: 1048576 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2097152 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1048576 },
    ],
  },

  // Local GPU-based LLMs
  LOCAL_LLAMA: {
    id: 'local-llama',
    name: 'Local Llama (GPU)',
    type: 'local',
    icon: '🦙',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', contextWindow: 128000 },
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', contextWindow: 128000 },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextWindow: 128000 },
      { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', contextWindow: 128000 },
    ],
  },
  LOCAL_MISTRAL: {
    id: 'local-mistral',
    name: 'Local Mistral (GPU)',
    type: 'local',
    icon: '🌪️',
    models: [
      { id: 'mistral-large-2', name: 'Mistral Large 2', contextWindow: 131072 },
      { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', contextWindow: 65536 },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextWindow: 32768 },
    ],
  },
  LOCAL_QWEN: {
    id: 'local-qwen',
    name: 'Local Qwen (GPU)',
    type: 'local',
    icon: '🐉',
    models: [
      { id: 'qwen2.5-72b', name: 'Qwen 2.5 72B', contextWindow: 131072 },
      { id: 'qwen2-vl-72b', name: 'Qwen2-VL 72B (Vision)', contextWindow: 32768 },
    ],
  },
  LOCAL_DEEPSEEK: {
    id: 'local-deepseek',
    name: 'Local DeepSeek (GPU)',
    type: 'local',
    icon: '🔬',
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek V3', contextWindow: 65536 },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', contextWindow: 16384 },
    ],
  },
};

// ===== AGENT TEMPLATE STRUCTURE =====

export const AGENT_TEMPLATE = {
  id: null,
  name: '',
  description: '',
  type: 'data_retriever', // data_retriever, news_agent, technical_agent, etc.
  system: 'data', // 'data' or 'team'

  // LLM Configuration
  llm: {
    backend: 'claude', // claude, openai, gemini, local-llama, etc.
    model: 'claude-3-sonnet',
    parameters: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
    },
  },

  // System Prompt
  systemPrompt: '',

  // Agent-specific configuration
  config: {},

  // Metadata
  isBuiltin: false,
  createdAt: null,
  updatedAt: null,
};

// ===== DEFAULT AGENT SYSTEM PROMPTS =====

export const DEFAULT_SYSTEM_PROMPTS = {
  // System 1: Data Agents
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

  // System 2: Decision Agents
  bull_researcher: `You are a bullish investment researcher.
Your role is to build the strongest possible BULL case for stocks.
Focus on:
- Growth opportunities and catalysts
- Competitive advantages
- Market expansion potential
- Positive trends and momentum
Present compelling arguments for why the stock will go UP.`,

  bear_researcher: `You are a bearish investment researcher.
Your role is to build the strongest possible BEAR case for stocks.
Focus on:
- Risks and challenges
- Competitive threats
- Overvaluation concerns
- Negative trends and headwinds
Present compelling arguments for why the stock will go DOWN.`,

  research_manager: `You are a senior investment manager.
Your role is to synthesize bull and bear research and make final recommendations.
Consider:
- Weighing both bull and bear arguments
- Risk/reward ratio
- Market conditions
- Portfolio fit
Provide balanced, actionable investment decisions.`,
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
 * Get models for a specific backend
 */
export const getModelsForBackend = (backendId) => {
  const backend = LLM_BACKENDS[backendId.toUpperCase().replace('-', '_')];
  return backend ? backend.models : [];
};

/**
 * Create a new agent with default configuration
 */
export const createAgentConfig = (agentType, llmBackend = 'claude') => {
  return {
    ...AGENT_TEMPLATE,
    id: `agent-${Date.now()}`,
    type: agentType,
    systemPrompt: DEFAULT_SYSTEM_PROMPTS[agentType] || '',
    llm: {
      ...AGENT_TEMPLATE.llm,
      backend: llmBackend,
    },
    createdAt: new Date().toISOString(),
  };
};

/**
 * Validate agent configuration
 */
export const validateAgentConfig = (agent) => {
  const errors = [];

  if (!agent.name || agent.name.trim() === '') {
    errors.push('Agent name is required');
  }

  if (!agent.systemPrompt || agent.systemPrompt.trim() === '') {
    errors.push('System prompt is required');
  }

  if (!agent.llm?.backend) {
    errors.push('LLM backend is required');
  }

  if (!agent.llm?.model) {
    errors.push('LLM model is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get cost estimate for agent execution
 * (Approximate costs, should be updated with real pricing)
 */
export const getAgentCostEstimate = (agent, inputTokens = 1000, outputTokens = 500) => {
  const costs = {
    // API costs (per 1M tokens)
    'claude-opus-4-5': { input: 15, output: 75 },
    'claude-sonnet-4-5': { input: 3, output: 15 },
    'gpt-4-turbo': { input: 10, output: 30 },
    'gemini-1.5-pro': { input: 3.5, output: 10.5 },

    // Local GPU costs (electricity + amortized hardware)
    'llama-3.3-70b': { input: 0, output: 0, note: 'Local GPU (~$0.50/hr electricity)' },
    'mistral-large-2': { input: 0, output: 0, note: 'Local GPU (~$0.50/hr electricity)' },
  };

  const modelCost = costs[agent.llm?.model];
  if (!modelCost) return { cost: 0, note: 'Cost unknown' };

  if (agent.llm.backend.includes('local')) {
    return { cost: 0, note: modelCost.note };
  }

  const cost = (inputTokens / 1000000 * modelCost.input) +
               (outputTokens / 1000000 * modelCost.output);

  return {
    cost: cost.toFixed(4),
    currency: 'USD',
    breakdown: {
      input: (inputTokens / 1000000 * modelCost.input).toFixed(4),
      output: (outputTokens / 1000000 * modelCost.output).toFixed(4),
    },
  };
};
