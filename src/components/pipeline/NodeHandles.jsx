import { Handle, Position } from 'reactflow';
import { useGridLayoutContext } from 'contexts/GridLayoutContext';

// 4-direction handles (grid layout mode)
const positions4Way = [
  { pos: Position.Top, id: 'top' },
  { pos: Position.Right, id: 'right' },
  { pos: Position.Bottom, id: 'bottom' },
  { pos: Position.Left, id: 'left' },
];

// 2-direction handles (classic layout mode)
const positions2Way = [
  { pos: Position.Right, id: 'right' },
  { pos: Position.Left, id: 'left' },
];

/**
 * Renders connection handles - auto-detects layout mode from context
 *
 * @param {"bidirectional"|"source-only"|"target-only"} role
 * @param {string} color  Handle background colour
 */
export function NodeHandles({ role = 'bidirectional', color = '#555' }) {
  const { isGridLayoutEnabled } = useGridLayoutContext();
  const positions = isGridLayoutEnabled ? positions4Way : positions2Way;
  
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
                style={{ background: color }}
              />
            )}
            {showTarget && (
              <Handle
                type="target"
                position={pos}
                id={`${id}-target`}
                className="node-handle node-handle--target"
                style={{ background: color }}
              />
            )}
          </span>
        );
      })}
    </>
  );
}
