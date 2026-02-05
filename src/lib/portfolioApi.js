import { request } from './api';

export const portfolioApi = {
  async create(horizonId, data) {
    try {
      const response = await request.post('/portfolios', {
        horizonId,
        ...data,
      });
      return response;
    } catch (error) {
      console.error('[PortfolioAPI] Create error:', error);
      throw error;
    }
  },

  async getByHorizon(horizonId) {
    try {
      const response = await request.get(`/portfolios/horizon/${horizonId}`);
      return response.data || [];
    } catch (error) {
      console.error('[PortfolioAPI] Get by horizon error:', error);
      throw error;
    }
  },

  async getAll(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const response = await request.get('/portfolios', {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('[PortfolioAPI] Get all error:', error);
      throw error;
    }
  },

  async getById(portfolioId) {
    try {
      const response = await request.get(`/portfolios/${portfolioId}`);
      return response.data;
    } catch (error) {
      console.error('[PortfolioAPI] Get by ID error:', error);
      throw error;
    }
  },

  async update(portfolioId, data) {
    try {
      const response = await request.put(`/portfolios/${portfolioId}`, data);
      return response;
    } catch (error) {
      console.error('[PortfolioAPI] Update error:', error);
      throw error;
    }
  },

  async delete(portfolioId) {
    try {
      const response = await request.delete(`/portfolios/${portfolioId}`);
      return response;
    } catch (error) {
      console.error('[PortfolioAPI] Delete error:', error);
      throw error;
    }
  },

  async restore(portfolioId) {
    try {
      const response = await request.post(`/portfolios/${portfolioId}/restore`);
      return response;
    } catch (error) {
      console.error('[PortfolioAPI] Restore error:', error);
      throw error;
    }
  },
};

export default portfolioApi;
