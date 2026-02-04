// FE/src/hooks/useHorizonSync.js
import { useEffect, useRef, useCallback } from 'react';
import { request } from 'lib/api';

export const useHorizonSync = ({
  currentHorizonId,
  nodes,
  edges,
  viewport,
  onHorizonLoaded,
  onError,
  toast,
}) => {
  const saveTimeoutRef = useRef(null);
  const lastSavedStateRef = useRef(null);

  const autoSave = useCallback(async () => {
    if (!currentHorizonId) return;

    const currentState = JSON.stringify({
      nodes,
      edges,
      viewport,
    });

    // Skip if no changes
    if (currentState === lastSavedStateRef.current) return;

    try {
      // Update horizon with nodes and edges
      await request.put(`/horizons/${currentHorizonId}`, {
        nodes,
        edges,
        viewport,
      });

      lastSavedStateRef.current = currentState;
      console.log('[useHorizonSync] Auto-saved successfully');
    } catch (error) {
      console.error('[useHorizonSync] Auto-save failed:', error);
      onError?.(error);
    }
  }, [
    currentHorizonId,
    nodes,
    edges,
    viewport,
    onError,
  ]);

  useEffect(() => {
    if (!currentHorizonId) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentHorizonId, autoSave]);

  const loadHorizons = useCallback(async () => {
    try {
      const result = await request.get('/horizons');
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error('[useHorizonSync] Failed to load horizons:', error);
      onError?.(error);
      toast?.({
        title: 'Failed to load horizons',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
      return [];
    }
  }, [onError, toast]);

  const loadHorizon = useCallback(
    async (horizonId) => {
      try {
        const result = await request.get(`/horizons/${horizonId}`);
        if (result.success && result.data) {
          const horizon = result.data;

          // Nodes are already in React Flow format from backend
          const flowNodes = horizon.nodes || [];

          onHorizonLoaded?.({
            horizon,
            nodes: flowNodes,
          });

          return { horizon, nodes: flowNodes };
        }
        return null;
      } catch (error) {
        console.error('[useHorizonSync] Failed to load horizon:', error);
        onError?.(error);
        toast?.({
          title: 'Failed to load horizon',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
        return null;
      }
    },
    [onHorizonLoaded, onError, toast]
  );

  const createHorizon = useCallback(
    async (horizonData) => {
      try {
        const result = await request.post('/horizons', horizonData);
        if (result.success && result.data) {
          toast?.({
            title: 'Horizon created',
            description: `${horizonData.name} created successfully`,
            status: 'success',
            duration: 3000,
          });
          return result.data;
        }
        return null;
      } catch (error) {
        console.error('[useHorizonSync] Failed to create horizon:', error);
        onError?.(error);
        toast?.({
          title: 'Failed to create horizon',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
        return null;
      }
    },
    [onError, toast]
  );

  const updateHorizon = useCallback(
    async (horizonId, updates) => {
      try {
        const result = await request.put(`/horizons/${horizonId}`, updates);
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (error) {
        console.error('[useHorizonSync] Failed to update horizon:', error);
        onError?.(error);
        toast?.({
          title: 'Failed to update horizon',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
        return null;
      }
    },
    [onError, toast]
  );

  const deleteHorizon = useCallback(
    async (horizonId) => {
      try {
        const result = await request.delete(`/horizons/${horizonId}`);
        if (result.success) {
          toast?.({
            title: 'Horizon deleted',
            status: 'info',
            duration: 2000,
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('[useHorizonSync] Failed to delete horizon:', error);
        onError?.(error);
        toast?.({
          title: 'Failed to delete horizon',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
        return false;
      }
    },
    [onError, toast]
  );

  return {
    loadHorizons,
    loadHorizon,
    createHorizon,
    updateHorizon,
    deleteHorizon,
    autoSave,
  };
};
