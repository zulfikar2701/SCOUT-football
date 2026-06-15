import { useFilterStore } from '../../store/filterStore';
import { POSITIONS, POS_BADGE } from '../../lib/constants';

export function PositionChips() {
  const { positions, togglePosition } = useFilterStore();
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {POSITIONS.map((p) => {
        const on = positions.includes(p.group);
        const c = POS_BADGE[p.group];
        return (
          <button
            key={p.group}
            onClick={() => togglePosition(p.group)}
            className="mono-bold"
            aria-pressed={on}
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 11,
              borderRadius: 4,
              background: on ? c.bg : 'var(--color-bg-elevated)',
              color: on ? c.fg : 'var(--color-text-muted)',
              border: '1px solid',
              borderColor: on ? c.fg : 'var(--color-border-mid)',
              transition: 'all 120ms',
            }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
