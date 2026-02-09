import { request } from './api';

// ===== Custom Agent CRUD Operations =====

export const createAgent = async (agentData) => {
  const response = await request.post('/agents', agentData);
  return response;
};

export const getAgents = async () => {
  const response = await request.get('/agents');
  return response;
};

export const getAgent = async (id) => {
  const response = await request.get(`/agents/${id}`);
  return response;
};

export const updateAgent = async (id, agentData) => {
  const response = await request.put(`/agents/${id}`, agentData);
  return response;
};

export const deleteAgent = async (id) => {
  const response = await request.delete(`/agents/${id}`);
  return response;
};

export const generateAgentSystemPrompt = async (name, description, category) => {
  const response = await request.post('/agents/generate-agent-system-prompt', {
    name,
    description,
    category,
  });
  return response;
};

// ===== Custom Agent Execution =====

export const runCustomAgentApi = async (stocks, systemPrompt, userPrompt = null, context = {}) => {
  // Use 180 second timeout for custom AI agent execution (thinking loop with tool calls needs time)
  const response = await request.withTimeout(180000).post('/ai/agents/custom', {
    stocks,
    system_prompt: systemPrompt,
    user_prompt: userPrompt,
    ...context,
  });
  return response;
};

// ===== System 1: Data Pipeline Agents =====

export const runCandlestickAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/candlestick', {
    stocks,
    timeframe: '1d',
    period: '30d',
    ...context,
  });
  return response;
};

export const runEarningsAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/earnings', {
    stocks,
    ...context,
  });
  return response;
};

export const runNewsAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/news', {
    stocks,
    days: 7,
    ...context,
  });
  return response;
};

export const runTechnicalAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/technical', {
    stocks,
    indicators: ['SMA', 'RSI', 'MACD'],
    ...context,
  });
  return response;
};

export const runFundamentalsAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/fundamentals', {
    stocks,
    ...context,
  });
  return response;
};

export const runWebSearchAgent = async (stocks, context = {}) => {
  const response = await request.post('/ai/agents/web-search', {
    stocks,
    ...context,
  });
  return response;
};

// ===== System 2 Team 1: Analyst Agents =====

export const runFundamentalsAnalystAgent = async (stocks, context = {}) => {
  // Use 90 second timeout for analyst agents (AI analysis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/fundamentals-analyst', {
    stocks,
    ...context,
  });
  return response;
};

export const runSentimentAnalystAgent = async (stocks, context = {}) => {
  // Use 90 second timeout for analyst agents (AI analysis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/sentiment-analyst', {
    stocks,
    ...context,
  });
  return response;
};

export const runNewsAnalystAgent = async (stocks, context = {}) => {
  // Use 90 second timeout for analyst agents (AI analysis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/news-analyst', {
    stocks,
    ...context,
  });
  return response;
};

export const runTechnicalAnalystAgent = async (stocks, context = {}) => {
  // Use 90 second timeout for analyst agents (AI analysis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/technical-analyst', {
    stocks,
    ...context,
  });
  return response;
};

// ===== System 2 Team 2: Researcher Agents =====

export const runBullResearcherAgent = async (data, context = {}) => {
  // Use 90 second timeout for researcher agents (AI research can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/bull-researcher', {
    data,
    ...context,
  });
  return response;
};

export const runBearResearcherAgent = async (data, context = {}) => {
  // Use 90 second timeout for researcher agents (AI research can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/bear-researcher', {
    data,
    ...context,
  });
  return response;
};

export const runResearchManagerAgent = async (bullThesis, bearThesis, context = {}) => {
  // Use 90 second timeout for research manager (AI synthesis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/research-manager', {
    bull_thesis: bullThesis,
    bear_thesis: bearThesis,
    ...context,
  });
  return response;
};

// ===== System 2 Team 3: Portfolio =====

export const runPortfolioManagerAgent = async (stocks, data, context = {}) => {
  // Use 90 second timeout for portfolio manager (AI portfolio construction can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/portfolio-manager', {
    stocks,
    data,
    ...context,
  });
  return response;
};

// ===== System 2 Team 4: Risk & Execution =====

export const runRiskManagerAgent = async (stocks, data, context = {}) => {
  // Use 90 second timeout for risk manager (AI risk analysis can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/risk-manager', {
    stocks,
    data,
    ...context,
  });
  return response;
};

export const runTraderAgent = async (stocks, data, context = {}) => {
  // Use 90 second timeout for trader agent (AI trade execution can be slow)
  const response = await request.withTimeout(90000).post('/ai/agents/trader', {
    stocks,
    data,
    ...context,
  });
  return response;
};

// ===== Thinking Agent (ReAct-style iterative reasoning) =====

export const runThinkingAgent = async (stocks, systemPrompt, inputData = null, maxIterations = 5) => {
  // Use 60 second timeout for thinking agent (iterative reasoning with multiple tool calls can take longer)
  const response = await request.withTimeout(60000).post('/ai/agents/think', {
    stocks,
    system_prompt: systemPrompt,
    input_data: inputData,
    max_iterations: maxIterations,
    available_tools: ['candlestick', 'earnings', 'news', 'technical', 'fundamentals'],
  });
  return response;
};

// ===== Main Agent Runner =====

export const runAgent = async (agentType, inputData, customAgentConfig = null, executionContext = null) => {
  const { stocks, data } = inputData;

  // Execution context for auto-saving outputNode
  const context = executionContext || {};

  // Handle custom agents with optional thinking mode
  // BUT skip for built-in data agents — they have their own dedicated endpoints
  const BUILTIN_DATA_AGENTS = new Set([
    'candlestick', 'data_retriever', 'earnings', 'news', 'news_agent',
    'technical', 'technical_agent', 'fundamentals', 'financial_metrics',
    'web_search',
  ]);

  if (customAgentConfig && customAgentConfig.systemPrompt && !BUILTIN_DATA_AGENTS.has(agentType)) {
    // Check if thinking mode is enabled
    if (customAgentConfig.enableThinking) {
      return await runThinkingAgent(
        stocks,
        customAgentConfig.systemPrompt,
        data,
        customAgentConfig.maxIterations || 5
      );
    }
    return await runCustomAgentApi(stocks, customAgentConfig.systemPrompt, customAgentConfig.userPrompt, context);
  }

  switch (agentType) {
    // ===== Custom Agent =====
    case 'custom_agent':
      if (data?.systemPrompt) {
        return await runCustomAgentApi(stocks, data.systemPrompt, data.userPrompt, context);
      }
      throw new Error(
        'Custom agent requires a system prompt. ' +
        'Please edit this agent and add a system prompt before running it.'
      );

    // ===== System 1: Data Pipeline Agents =====
    case 'candlestick':
    case 'data_retriever':
      return await runCandlestickAgent(stocks, context);

    case 'earnings':
      return await runEarningsAgent(stocks, context);

    case 'news':
    case 'news_agent':
      return await runNewsAgent(stocks, context);

    case 'technical':
    case 'technical_agent':
      return await runTechnicalAgent(stocks, context);

    case 'fundamentals':
    case 'financial_metrics':
      return await runFundamentalsAgent(stocks, context);

    case 'web_search':
      return await runWebSearchAgent(stocks, context);

    // ===== System 2 Team 1: Analyst Agents =====
    case 'fundamentals_analyst':
      return await runFundamentalsAnalystAgent(stocks, context);

    case 'sentiment_analyst':
      return await runSentimentAnalystAgent(stocks, context);

    case 'news_analyst':
      return await runNewsAnalystAgent(stocks, context);

    case 'technical_analyst':
      return await runTechnicalAnalystAgent(stocks, context);

    // ===== System 2 Team 2: Researcher Agents =====
    case 'bull_researcher':
      return await runBullResearcherAgent(data || { stocks }, context);

    case 'bear_researcher':
      return await runBearResearcherAgent(data || { stocks }, context);

    case 'research_manager':
      return await runResearchManagerAgent(data?.bullThesis, data?.bearThesis, context);

    case 'bull_bear_analyzer':
      // Use 120 second timeout for bull-bear analyzer (Stage 2/3 processing + debate)
      return await request.withTimeout(120000).post('/ai/agents/bull-bear-analyzer', {
        stocks,
        raw_data: data,
        ...context,
      });

    // ===== System 2 Team 3: Portfolio =====
    case 'portfolio_manager':
      return await runPortfolioManagerAgent(stocks, data, context);

    // ===== System 2 Team 4: Risk & Execution =====
    case 'risk_manager':
      return await runRiskManagerAgent(stocks, data, context);

    case 'trader_agent':
      return await runTraderAgent(stocks, data, context);

    default:
      // Fallback: if the agent has a systemPrompt in data, treat as custom agent
      if (data?.systemPrompt) {
        return await runCustomAgentApi(stocks, data.systemPrompt, data.userPrompt, context);
      }
      throw new Error(`Unknown agent type: ${agentType}`);
  }
};

// ===== Helper Function =====

export const getAgentInputData = (node, edges, nodes) => {
  console.log('[getAgentInputData] Node ID:', node.id);
  console.log('[getAgentInputData] Total edges:', edges.length);
  console.log('[getAgentInputData] All edges:', edges);

  const incomingEdges = edges.filter(edge => edge.target === node.id);
  console.log('[getAgentInputData] Incoming edges:', incomingEdges);

  if (incomingEdges.length === 0) {
    throw new Error(`No input connected to agent "${node.data.agent?.name}". Please connect a portfolio or data source to this agent.`);
  }

  const sourceNodes = incomingEdges.map(edge =>
    nodes.find(n => n.id === edge.source)
  ).filter(Boolean);

  console.log('[getAgentInputData] Source nodes:', sourceNodes);

  const inputData = {
    stocks: [],
    data: {},
  };

  sourceNodes.forEach(sourceNode => {
    console.log('[getAgentInputData] Processing source node:', sourceNode.type, sourceNode.data);

    if (sourceNode.type === 'portfolioNode') {
      const stocks = sourceNode.data.portfolio?.stocks || [];
      console.log('[getAgentInputData] Found portfolio with stocks:', stocks);
      inputData.stocks = stocks;
    } else if (sourceNode.type === 'agentNode') {
      inputData.data = {
        ...inputData.data,
        [sourceNode.data.agent?.name || sourceNode.id]: sourceNode.data.output,
      };
    }
  });

  // If no portfolio found among direct parents, traverse upstream through agent chain
  if (inputData.stocks.length === 0) {
    const visited = new Set();
    const findStocksUpstream = (nodeId) => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);
      const incoming = edges.filter(e => e.target === nodeId);
      for (const edge of incoming) {
        const src = nodes.find(n => n.id === edge.source);
        if (!src) continue;
        if (src.type === 'portfolioNode') return src.data.portfolio?.stocks || [];
        const upstream = findStocksUpstream(src.id);
        if (upstream.length > 0) return upstream;
      }
      return [];
    };
    inputData.stocks = findStocksUpstream(node.id);
  }

  console.log('[getAgentInputData] Final input data:', inputData);

  if (inputData.stocks.length === 0) {
    throw new Error('No stocks found in connected portfolio. Please ensure the portfolio has stocks.');
  }

  return inputData;
};
