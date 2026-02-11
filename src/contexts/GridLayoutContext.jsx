import { createContext, useContext } from 'react';

/**
 * Context to share grid layout state across component tree
 * This allows NodeHandles, CustomEdge, etc. to access grid state
 * without prop drilling
 */
export const GridLayoutContext = createContext({
  isGridLayoutEnabled: false,
});

export const useGridLayoutContext = () => useContext(GridLayoutContext);
