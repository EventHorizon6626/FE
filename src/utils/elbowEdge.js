import { GRID_SIZE } from './gridUtils';

/**
 * Compute a Manhattan (right-angle / elbow) SVG path between two points.
 *
 * Returns [svgPath, labelX, labelY] — same shape as ReactFlow's getBezierPath.
 *
 * Routing:
 *  - Same row → straight horizontal line
 *  - Different rows → horizontal to midpoint X, vertical turn, horizontal to target
 *  - Midpoint X snapped to GRID_SIZE boundaries for alignment
 */
export function getElbowPath({ sourceX, sourceY, targetX, targetY }) {
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  // Same row (within small tolerance)
  if (Math.abs(sourceY - targetY) < 4) {
    const path = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    return [path, labelX, labelY];
  }

  // Compute midpoint X snapped to GRID_SIZE boundary
  const rawMidX = (sourceX + targetX) / 2;
  const midX = Math.round(rawMidX / GRID_SIZE) * GRID_SIZE;

  const path = [
    `M ${sourceX},${sourceY}`,
    `L ${midX},${sourceY}`,
    `L ${midX},${targetY}`,
    `L ${targetX},${targetY}`,
  ].join(' ');

  return [path, midX, labelY];
}
