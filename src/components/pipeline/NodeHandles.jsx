import { Handle, Position } from 'reactflow';

const positions = [
  { pos: Position.Top, id: 'top' },
  { pos: Position.Right, id: 'right' },
  { pos: Position.Bottom, id: 'bottom' },
  { pos: Position.Left, id: 'left' },
];

/**
 * Renders 4 connection handles (top, right, bottom, left).
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

        return (
          <span key={id}>
            {showSource && (
              <Handle
                type="source"
                position={pos}
                id={`${id}-source`}
                className="node-handle node-handle--source"
                style={{ background: color, width: '12px', height: '12px' }}
              />
            )}
            {showTarget && (
              <Handle
                type="target"
                position={pos}
                id={`${id}-target`}
                className="node-handle node-handle--target"
                style={{ background: color, width: '12px', height: '12px' }}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
