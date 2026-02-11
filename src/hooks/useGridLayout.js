import { useCallback, useEffect, useState } from 'react';
import {
  buildOccupancyList,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
  findNearestFreePosition,
  GRID_SIZE,
  snapPositionToGrid
} from 'utils/gridUtils';

const GRID_LAYOUT_STORAGE_KEY = 'pipeline_grid_layout_enabled';

/**
 * Central grid layout hook - ALL grid logic in ONE place
 * When you need to change grid behavior, ONLY edit this file
 */
export const useGridLayout = () => {
  // Load from localStorage, default to true (Grid ON)
  const [isGridLayoutEnabled, setIsGridLayoutEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(GRID_LAYOUT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : true;
    } catch (error) {
      console.error('Failed to load grid layout preference:', error);
      return true;
    }
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, JSON.stringify(isGridLayoutEnabled));
    } catch (error) {
      console.error('Failed to save grid layout preference:', error);
    }
  }, [isGridLayoutEnabled]);

  /**
   * Snap position to grid (if enabled)
   */
  const snapPosition = useCallback((position) => {
    if (!isGridLayoutEnabled) return position;
    return snapPositionToGrid(position);
  }, [isGridLayoutEnabled]);

  /**
   * Find collision-free position (if enabled)
   */
  const findFreePosition = useCallback((position, nodes, width = DEFAULT_NODE_WIDTH, height = DEFAULT_NODE_HEIGHT) => {
    if (!isGridLayoutEnabled) return position;

    const occupancy = buildOccupancyList(nodes);
    return findNearestFreePosition(position, occupancy, width, height);
  }, [isGridLayoutEnabled]);

  /**
   * Get ReactFlow props based on grid state
   */
  const getReactFlowProps = useCallback(() => ({
    snapToGrid: isGridLayoutEnabled,
    snapGrid: isGridLayoutEnabled ? [GRID_SIZE, GRID_SIZE] : [1, 1],
  }), [isGridLayoutEnabled]);

  /**
   * Get edge routing mode based on grid state
   */
  const getDefaultEdgeRouting = useCallback(() => {
    return isGridLayoutEnabled ? 'elbow' : 'straight';
  }, [isGridLayoutEnabled]);

  /**
   * Toggle grid layout on/off
   */
  const toggleGridLayout = useCallback(() => {
    setIsGridLayoutEnabled(prev => !prev);
  }, []);

  return {
    isGridLayoutEnabled,
    toggleGridLayout,
    snapPosition,
    findFreePosition,
    getReactFlowProps,
    getDefaultEdgeRouting,
  };
};
