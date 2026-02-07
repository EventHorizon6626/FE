import { request } from './api';

/**
 * Web Search API - Uses Exa, Tavily, or Perplexity with intelligent fallback
 */

/**
 * Perform a web search
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return (default: 5)
 * @param {boolean} includeContent - Whether to include full content/snippets (default: true)
 * @returns {Promise<{success: boolean, data: object, provider: string}>}
 */
export const webSearch = async (query, maxResults = 5, includeContent = true) => {
  try {
    const response = await request.post('/search', {
      query,
      maxResults,
      includeContent,
    });
    return response;
  } catch (error) {
    console.error('[SearchAPI] Web search error:', error);
    throw error;
  }
};

/**
 * Perform a financial news search
 * Optimized for finding recent financial news and market information
 */
export const financialSearch = async (query, maxResults = 5) => {
  const enhancedQuery = `${query} site:(bloomberg.com OR reuters.com OR marketwatch.com OR cnbc.com OR seekingalpha.com)`;
  return webSearch(enhancedQuery, maxResults, true);
};

/**
 * Perform a stock analysis search
 * Optimized for finding stock analysis and research
 */
export const stockSearch = async (ticker, maxResults = 5) => {
  const query = `${ticker} stock analysis earnings price target`;
  return webSearch(query, maxResults, true);
};

/**
 * Perform a market trends search
 * Optimized for finding current market trends and sentiment
 */
export const marketTrendsSearch = async (maxResults = 5) => {
  const query = "current stock market trends sentiment analysis 2026";
  return webSearch(query, maxResults, true);
};

const searchApi = {
  webSearch,
  financialSearch,
  stockSearch,
  marketTrendsSearch,
};

export default searchApi;
