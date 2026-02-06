import { request } from './api';

export const horizonAgentApi = {
  async create(horizonId, data) {
    try {
      const response = await request.post('/agents', {
        horizonId,
        ...data,
      });
      return response;
    } catch (error) {
      console.error('[HorizonAgentAPI] Create error:', error);
      throw error;
    }
  },

  async getByHorizon(horizonId, options = {}) {
    try {
      const { system } = options;
      const response = await request.get(`/agents/horizon/${horizonId}`, {
        params: system ? { system } : {},
      });
      return response.data || [];
    } catch (error) {
      console.error('[HorizonAgentAPI] Get by horizon error:', error);
      throw error;
    }
  },

  async getByTeam(teamId) {
    try {
      const response = await request.get(`/agents/team/${teamId}`);
      return response.data || [];
    } catch (error) {
      console.error('[HorizonAgentAPI] Get by team error:', error);
      throw error;
    }
  },

  async getAll(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const response = await request.get('/agents', {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('[HorizonAgentAPI] Get all error:', error);
      throw error;
    }
  },

  async getById(agentId) {
    try {
      const response = await request.get(`/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('[HorizonAgentAPI] Get by ID error:', error);
      throw error;
    }
  },

  async update(agentId, data) {
    try {
      const response = await request.put(`/agents/${agentId}`, data);
      return response;
    } catch (error) {
      console.error('[HorizonAgentAPI] Update error:', error);
      throw error;
    }
  },

  async delete(agentId) {
    try {
      const response = await request.delete(`/agents/${agentId}`);
      return response;
    } catch (error) {
      console.error('[HorizonAgentAPI] Delete error:', error);
      throw error;
    }
  },

  async restore(agentId) {
    try {
      const response = await request.post(`/agents/${agentId}/restore`);
      return response;
    } catch (error) {
      console.error('[HorizonAgentAPI] Restore error:', error);
      throw error;
    }
  },
};

export default horizonAgentApi;
