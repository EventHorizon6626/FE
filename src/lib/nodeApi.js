import { request } from './api';

const nodeApi = {
  /**
   * Create a new node
   */
  create: async (nodeData) => {
    return request.post('/nodes', nodeData);
  },

  /**
   * Update a node
   */
  update: async (nodeId, nodeData) => {
    return request.put(`/nodes/${nodeId}`, nodeData);
  },

  /**
   * Delete a node (soft delete)
   */
  delete: async (nodeId) => {
    return request.delete(`/nodes/${nodeId}`);
  },

  /**
   * Get all outputNodes (revisions) for a specific agent
   * @param {string} agentNodeId - The agent node ID
   * @param {string} horizonId - The horizon ID
   * @returns {Promise} Response with outputs array
   */
  getByAgent: async (agentNodeId, horizonId) => {
    // Use 30 second timeout for loading revision history (can be slow for agents with many outputs)
    return request.withTimeout(30000).get(`/nodes/by-agent/${agentNodeId}?horizonId=${horizonId}`);
  },

  reactivate: async (nodeId) => {
    return request.patch(`/nodes/${nodeId}/reactivate`);
  },
};

export default nodeApi;
