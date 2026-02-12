import { Handle, Position } from 'reactflow';

const positions = [
  { pos: Position.Top, id: 'top' },
  { pos: Position.Right, id: 'right' },
  { pos: Position.Bottom, id: 'bottom' },
  { pos: Position.Left, id: 'left' },
];

// Helper function to get position offset based on handle position
const getPositionStyle = (position, isSource) => {
  // Equal spacing from edge (-28px) + centered on middle of each edge
  const offset = '-28px';

  switch (position) {
    case Position.Top:
      // Top edge: -28px above, centered horizontally
      return { top: offset, left: '50%', transform: 'translateX(-50%)' };
    case Position.Right:
      // Right edge: -28px to right, centered vertically
      return { right: offset, top: '50%', transform: 'translateY(-50%)' };
    case Position.Bottom:
      // Bottom edge: -28px below, centered horizontally
      return { bottom: offset, left: '50%', transform: 'translateX(-50%)' };
    case Position.Left:
      // Left edge: -28px to left, centered vertically
      return { left: offset, top: '50%', transform: 'translateY(-50%)' };
    default:
      return {};
  }
};

/**
 * Renders 4 connection handles (top, right, bottom, left).
 * Both source and target at same position for bidirectional connections.
 *
 * @param {"bidirectional"|"source-only"|"target-only"} role
 * @param {string} color  Handle background colour
 */
export function NodeHandles({ role = 'bidirectional', color = '#555' }) {
  return (
    <>
      {positions.map(({ pos, id }) => {
        const showSource = role === 'bidirectional' || role === 'source-only';
        const showTarget = role === 'bidirectional' || role === 'target-only';

        const handleStyle = {
          background: color,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2px solid white',
          ...getPositionStyle(pos, true) // same position for both
        };

        return (
          <span key={id}>
            {/* Target handle (receives connections) - render first (bottom layer) */}
            {showTarget && (
              <Handle
                type="target"
                position={pos}
                id={`${id}-target`}
                className="node-handle node-handle--target"
                style={handleStyle}
                isConnectable={true}
              />
            )}
            {/* Source handle (starts connections) - render second (top layer) */}
            {showSource && (
              <Handle
                type="source"
                position={pos}
                id={`${id}-source`}
                className="node-handle node-handle--source"
                style={handleStyle}
                isConnectable={true}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
