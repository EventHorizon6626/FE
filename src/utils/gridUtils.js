// ── Visual grid ──────────────────────────────────────────────────────────────
export const GRID_SIZE = 40; // 40px dot grid for easier alignment

// ── Default / constraint dimensions (must be multiples of GRID_SIZE) ─────────
export const DEFAULT_NODE_WIDTH = 240;
export const DEFAULT_NODE_HEIGHT = 120;
export const MIN_NODE_WIDTH = 120;
export const MIN_NODE_HEIGHT = 80;
export const MAX_NODE_WIDTH = 480;
export const MAX_NODE_HEIGHT = 360;

// ── Auto-layout spacing (independent of visual grid) ─────────────────────────
export const LAYOUT_COL_SPACING = 320;
export const LAYOUT_ROW_SPACING = 200;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Snap a value to the nearest multiple of GRID_SIZE (40px). */
export function snapDimension(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/** Read width/height from node.data (or node.style), falling back to defaults. */
export function getNodeDimensions(node) {
  return {
    width: node?.data?.width || node?.style?.width || DEFAULT_NODE_WIDTH,
    height: node?.data?.height || node?.style?.height || DEFAULT_NODE_HEIGHT,
  };
}

/**
 * Snap a node's top-left position to the nearest grid point.
 * With dimensions that are multiples of GRID_SIZE, all four edges land on grid lines.
 */
export function snapPositionToGrid(position) {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
}

// ── Bounding-box occupancy ───────────────────────────────────────────────────

/**
 * Build a list of { x, y, w, h } bounding boxes for all nodes.
 * Used for collision detection instead of the old cell-key approach.
 */
export function buildOccupancyList(nodes) {
  return nodes.map((node) => {
    const { width, height } = getNodeDimensions(node);
    return {
      x: node.position.x,
      y: node.position.y,
      w: width,
      h: height,
    };
  });
}

/** Check whether two axis-aligned bounding boxes overlap (with a small margin). */
function boxesOverlap(a, b, margin = 10) {
  return !(
    a.x + a.w + margin <= b.x ||
    b.x + b.w + margin <= a.x ||
    a.y + a.h + margin <= b.y ||
    b.y + b.h + margin <= a.y
  );
}

/**
 * Spiral search outward from `position` to find the nearest non-overlapping spot.
 * `width`/`height` are for the node being placed.
 */
export function findNearestFreePosition(position, occupancyList, width = DEFAULT_NODE_WIDTH, height = DEFAULT_NODE_HEIGHT) {
  const candidate = { x: position.x, y: position.y, w: width, h: height };

  // Check original position
  if (!occupancyList.some((box) => boxesOverlap(candidate, box))) {
    return { x: position.x, y: position.y };
  }

  // Spiral outward in GRID_SIZE steps
  for (let radius = 1; radius <= 40; radius++) {
    const step = GRID_SIZE * radius;
    for (let dx = -step; dx <= step; dx += GRID_SIZE) {
      for (let dy = -step; dy <= step; dy += GRID_SIZE) {
        if (Math.abs(dx) !== step && Math.abs(dy) !== step) continue;
        const test = {
          x: position.x + dx,
          y: position.y + dy,
          w: width,
          h: height,
        };
        if (!occupancyList.some((box) => boxesOverlap(test, box))) {
          return { x: test.x, y: test.y };
        }
      }
    }
  }

  // Fallback
  return { x: position.x + GRID_SIZE * 2, y: position.y };
}

// ── Auto-layout coordinate helpers ───────────────────────────────────────────

/** Convert logical (col, row) to pixel position for auto-layout. */
export function layoutGridToPosition(col, row) {
  return {
    x: col * LAYOUT_COL_SPACING,
    y: row * LAYOUT_ROW_SPACING,
  };
}

// ── Migration ────────────────────────────────────────────────────────────────

/**
 * One-time migration: snap all node positions to the grid, resolving
 * collisions via bounding-box checks. Mutates node positions in place and
 * returns the list of nodes whose positions changed.
 */
export function migratePositionsToGrid(nodes) {
  const movedNodes = [];
  const placed = []; // bounding boxes of already-placed nodes

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    const snapped = snapPositionToGrid(node.position);

    const box = { x: snapped.x, y: snapped.y, w: width, h: height };

    if (placed.some((b) => boxesOverlap(box, b))) {
      const free = findNearestFreePosition(snapped, placed, width, height);
      if (node.position.x !== free.x || node.position.y !== free.y) {
        node.position = free;
        movedNodes.push(node);
      }
      placed.push({ x: free.x, y: free.y, w: width, h: height });
    } else {
      if (node.position.x !== snapped.x || node.position.y !== snapped.y) {
        node.position = snapped;
        movedNodes.push(node);
      }
      placed.push(box);
    }
  });

  return movedNodes;
}
