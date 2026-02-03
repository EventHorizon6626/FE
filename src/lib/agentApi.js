import aiApi from './aiApi';

/**
 * Agent API Service
 * Each agent has its own endpoint that processes portfolio data
 */

// ===== SYSTEM 1: Data Pipeline Agents =====

/**
 * Candlestick Agent - Fetch price data
 * @param {Array} stocks - List of stock tickers
 * @returns {Promise} Candlestick data
 */
export const runCandlestickAgent = async (stocks) => {
  const response = await aiApi.post('/agents/candlestick', {
    stocks,
    timeframe: '1d',
    period: '30d',
  });
  return response.data;
};

/**
 * Earnings Agent - Fetch earnings data
 * @param {Array} stocks - List of stock tickers
 * @returns {Promise} Earnings data
 */
export const runEarningsAgent = async (stocks) => {
  const response = await aiApi.post('/agents/earnings', {
    stocks,
  });
  return response.data;
};

/**
 * News Agent - Fetch and analyze news sentiment
 * @param {Array} stocks - List of stock tickers
 * @returns {Promise} News sentiment analysis
 */
export const runNewsAgent = async (stocks) => {
  const response = await aiApi.post('/agents/news', {
    stocks,
    days: 7, // Last 7 days of news
  });
  return response.data;
};

/**
 * Technical Analysis Agent - Calculate technical indicators
 * @param {Array} stocks - List of stock tickers
 * @returns {Promise} Technical indicators (RSI, MACD, MA, etc.)
 */
export const runTechnicalAgent = async (stocks) => {
  const response = await aiApi.post('/agents/technical', {
    stocks,
    indicators: ['RSI', 'MACD', 'SMA', 'EMA', 'BB'],
  });
  return response.data;
};

/**
 * Fundamentals Agent - Fetch fundamental metrics
 * @param {Array} stocks - List of stock tickers
 * @returns {Promise} Fundamental data (P/E, EPS, etc.)
 */
export const runFundamentalsAgent = async (stocks) => {
  const response = await aiApi.post('/agents/fundamentals', {
    stocks,
    metrics: ['PE', 'PB', 'EPS', 'DIVIDEND_YIELD', 'MARKET_CAP'],
  });
  return response.data;
};

// ===== SYSTEM 2: Decision-Making Agents =====

/**
 * Bull Researcher Agent - Generate bullish analysis
 * @param {Object} data - Input data from previous agents
 * @returns {Promise} Bullish investment thesis
 */
export const runBullResearcherAgent = async (data) => {
  const response = await aiApi.post('/agents/bull-researcher', {
    data,
  });
  return response.data;
};

/**
 * Bear Researcher Agent - Generate bearish analysis
 * @param {Object} data - Input data from previous agents
 * @returns {Promise} Bearish investment thesis
 */
export const runBearResearcherAgent = async (data) => {
  const response = await aiApi.post('/agents/bear-researcher', {
    data,
  });
  return response.data;
};

/**
 * Research Manager Agent - Synthesize bull/bear research
 * @param {Object} bullThesis - Bull research results
 * @param {Object} bearThesis - Bear research results
 * @returns {Promise} Final investment recommendation
 */
export const runResearchManagerAgent = async (bullThesis, bearThesis) => {
  const response = await aiApi.post('/agents/research-manager', {
    bull_thesis: bullThesis,
    bear_thesis: bearThesis,
  });
  return response.data;
};

// ===== Agent Runner =====

/**
 * Run an agent based on its type
 * @param {string} agentType - The type of agent to run
 * @param {Object} inputData - Input data (portfolio or previous agent output)
 * @returns {Promise} Agent execution results
 */
export const runAgent = async (agentType, inputData) => {
  const { stocks, data } = inputData;

  switch (agentType) {
    // System 1 - Data Agents
    case 'candlestick':
    case 'data_retriever':
      return await runCandlestickAgent(stocks);

    case 'earnings':
      return await runEarningsAgent(stocks);

    case 'news':
    case 'news_agent':
      return await runNewsAgent(stocks);

    case 'technical':
    case 'technical_agent':
      return await runTechnicalAgent(stocks);

    case 'fundamentals':
    case 'financial_metrics':
      return await runFundamentalsAgent(stocks);

    // System 2 - Decision Agents
    case 'bull_researcher':
      return await runBullResearcherAgent(data);

    case 'bear_researcher':
      return await runBearResearcherAgent(data);

    case 'research_manager':
      return await runResearchManagerAgent(data.bullThesis, data.bearThesis);

    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
};

/**
 * Get input data for an agent from connected nodes
 * @param {Object} node - The agent node
 * @param {Array} edges - All edges in the flow
 * @param {Array} nodes - All nodes in the flow
 * @returns {Object} Input data for the agent
 */
export const getAgentInputData = (node, edges, nodes) => {
  console.log('[getAgentInputData] Node ID:', node.id);
  console.log('[getAgentInputData] Total edges:', edges.length);
  console.log('[getAgentInputData] All edges:', edges);

  // Find incoming edges to this node
  const incomingEdges = edges.filter(edge => edge.target === node.id);
  console.log('[getAgentInputData] Incoming edges:', incomingEdges);

  if (incomingEdges.length === 0) {
    throw new Error(`No input connected to agent "${node.data.agent?.name}". Please connect a portfolio or data source to this agent.`);
  }

  // Get source nodes
  const sourceNodes = incomingEdges.map(edge =>
    nodes.find(n => n.id === edge.source)
  ).filter(Boolean); // Remove undefined nodes

  console.log('[getAgentInputData] Source nodes:', sourceNodes);

  // Extract data from source nodes
  const inputData = {
    stocks: [],
    data: {},
  };

  sourceNodes.forEach(sourceNode => {
    console.log('[getAgentInputData] Processing source node:', sourceNode.type, sourceNode.data);

    if (sourceNode.type === 'portfolioNode') {
      // Portfolio node provides stock list
      const stocks = sourceNode.data.portfolio?.stocks || [];
      console.log('[getAgentInputData] Found portfolio with stocks:', stocks);
      inputData.stocks = stocks;
    } else if (sourceNode.type === 'agentNode') {
      // Agent node provides processed data
      inputData.data = {
        ...inputData.data,
        [sourceNode.data.agent?.type]: sourceNode.data.output,
      };
    }
  });

  console.log('[getAgentInputData] Final input data:', inputData);

  // Validate we have stocks
  if (inputData.stocks.length === 0) {
    throw new Error('No stocks found in connected portfolio. Please ensure the portfolio has stocks.');
  }

  return inputData;
};
