import type { PositionGroup } from '../../lib/types';
import { POS_BADGE } from '../../lib/constants';

export function PositionBadge({ pos, large = false }: { pos: PositionGroup; large?: boolean }) {
  const c = POS_BADGE[pos];
  return (
    <span
      className="mono-bold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: c.bg,
        color: c.fg,
        borderRadius: 4,
        padding: large ? '3px 8px' : '2px 5px',
        fontSize: large ? 13 : 10,
        lineHeight: 1,
        letterSpacing: '0.04em',
        minWidth: large ? 32 : 24,
        height: large ? 24 : 'auto',
        animation: 'scout-fade-in 120ms ease-out',
      }}
    >
      {pos}
    </span>
  );
}
