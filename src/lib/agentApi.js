import { request } from './api';

export const runCandlestickAgent = async (stocks) => {
  const response = await request.post('/ai/agents/candlestick', {
    stocks,
    timeframe: '1d',
    period: '30d',
  });
  return response;
};

export const runEarningsAgent = async (stocks) => {
  const response = await request.post('/ai/agents/earnings', {
    stocks,
  });
  return response;
};

export const runNewsAgent = async (stocks) => {
  const response = await request.post('/ai/agents/news', {
    stocks,
    days: 7,
  });
  return response;
};

export const runTechnicalAgent = async (stocks) => {
  const response = await request.post('/ai/agents/technical', {
    stocks,
    indicators: ['RSI', 'MACD', 'SMA', 'EMA', 'BB'],
  });
  return response;
};

export const runFundamentalsAgent = async (stocks) => {
  const response = await request.post('/ai/agents/fundamentals', {
    stocks,
    metrics: ['PE', 'PB', 'EPS', 'DIVIDEND_YIELD', 'MARKET_CAP'],
  });
  return response;
};

export const runBullResearcherAgent = async (data) => {
  const response = await request.post('/ai/agents/bull-researcher', {
    data,
  });
  return response;
};

export const runBearResearcherAgent = async (data) => {
  const response = await request.post('/ai/agents/bear-researcher', {
    data,
  });
  return response;
};

export const runResearchManagerAgent = async (bullThesis, bearThesis) => {
  const response = await request.post('/ai/agents/research-manager', {
    bull_thesis: bullThesis,
    bear_thesis: bearThesis,
  });
  return response;
};

export const runAgent = async (agentType, inputData) => {
  const { stocks, data } = inputData;

  switch (agentType) {
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
        [sourceNode.data.agent?.type]: sourceNode.data.output,
      };
    }
  });

  console.log('[getAgentInputData] Final input data:', inputData);

  if (inputData.stocks.length === 0) {
    throw new Error('No stocks found in connected portfolio. Please ensure the portfolio has stocks.');
  }

  return inputData;
};
