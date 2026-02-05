import { request } from './api';

export const teamApi = {
  async create(horizonId, data) {
    try {
      const response = await request.post('/teams', {
        horizonId,
        ...data,
      });
      return response;
    } catch (error) {
      console.error('[TeamAPI] Create error:', error);
      throw error;
    }
  },

  async getByHorizon(horizonId) {
    try {
      const response = await request.get(`/teams/horizon/${horizonId}`);
      return response.data || [];
    } catch (error) {
      console.error('[TeamAPI] Get by horizon error:', error);
      throw error;
    }
  },

  async getAll(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const response = await request.get('/teams', {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('[TeamAPI] Get all error:', error);
      throw error;
    }
  },

  async getById(teamId) {
    try {
      const response = await request.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('[TeamAPI] Get by ID error:', error);
      throw error;
    }
  },

  async update(teamId, data) {
    try {
      const response = await request.put(`/teams/${teamId}`, data);
      return response;
    } catch (error) {
      console.error('[TeamAPI] Update error:', error);
      throw error;
    }
  },

  async delete(teamId) {
    try {
      const response = await request.delete(`/teams/${teamId}`);
      return response;
    } catch (error) {
      console.error('[TeamAPI] Delete error:', error);
      throw error;
    }
  },

  async restore(teamId) {
    try {
      const response = await request.post(`/teams/${teamId}/restore`);
      return response;
    } catch (error) {
      console.error('[TeamAPI] Restore error:', error);
      throw error;
    }
  },
};

export default teamApi;
