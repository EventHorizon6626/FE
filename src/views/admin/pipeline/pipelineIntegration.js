// FE/src/views/admin/pipeline/pipelineIntegration.js

import { request } from 'lib/api';

export const loadHorizonsFromBackend = async (toast) => {
  try {
    const result = await request.get('/horizons');
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('[pipelineIntegration] Failed to load horizons:', error);
    toast?.({
      title: 'Failed to load horizons',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    return [];
  }
};

export const loadHorizonFromBackend = async (horizonId, toast) => {
  try {
    const result = await request.get(`/horizons/${horizonId}`);
    if (result.success && result.data) {
      const horizon = result.data;
      
      // Backend returns nodes in React Flow format already
      return {
        id: horizon.id,
        name: horizon.name,
        nodes: horizon.nodes || [],
        edges: horizon.edges || [],
        availableAgents: horizon.availableAgents || [],
        availableTeams: horizon.availableTeams || [],
        customAgents: horizon.customAgents || [],
        portfolios: horizon.portfolios || [],
        savedAt: horizon.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.error('[pipelineIntegration] Failed to load horizon:', error);
    toast?.({
      title: 'Failed to load horizon',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    return null;
  }
};

export const saveHorizonToBackend = async (horizon, existingId, toast) => {
  try {
    const horizonData = {
      name: horizon.name,
      nodes: horizon.nodes || [],
      edges: horizon.edges || [],
      viewport: horizon.viewport || { x: 0, y: 0, zoom: 0.9 },
    };

    let result;
    if (existingId) {
      // Update existing horizon
      result = await request.put(`/horizons/${existingId}`, horizonData);
    } else {
      // Create new horizon
      result = await request.post('/horizons', horizonData);
    }

    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('[pipelineIntegration] Failed to save horizon:', error);
    toast?.({
      title: 'Auto-save failed',
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return null;
  }
};

export const deleteHorizonFromBackend = async (horizonId, toast) => {
  try {
    const result = await request.delete(`/horizons/${horizonId}`);
    if (result.success) {
      toast?.({
        title: 'Horizon deleted',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[pipelineIntegration] Failed to delete horizon:', error);
    toast?.({
      title: 'Delete failed',
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return false;
  }
};

export const createDebouncedSave = (saveFunction, delay = 2000) => {
  let timeoutId = null;
  let lastSavedState = null;

  return async (currentState) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Check if state changed
    const stateString = JSON.stringify(currentState);
    if (stateString === lastSavedState) {
      return; // No changes, skip save
    }

    // Set new timeout
    timeoutId = setTimeout(async () => {
      await saveFunction(currentState);
      lastSavedState = stateString;
    }, delay);
  };
};
