import type { MatchLogEntry } from '../../lib/types';
import { barColor } from '../../lib/percentiles';

export function MatchLog({ entries }: { entries: MatchLogEntry[] }) {
  if (!entries.length) {
    return (
      <div className="mono" style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '12px 0' }}>
        No recent match data available.
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', fontSize: 9, letterSpacing: '0.1em', color: 'var(--color-text-muted)', padding: '4px 0', borderBottom: '1px solid var(--color-border-dim)' }} className="label">
        <span style={{ width: 78 }}>Date</span>
        <span style={{ width: 28 }}>V</span>
        <span style={{ flex: 1 }}>Opponent</span>
        <span style={{ width: 50, textAlign: 'right' }}>Score</span>
        <span style={{ width: 44, textAlign: 'right' }}>Min</span>
        <span style={{ width: 26, textAlign: 'right' }}>G</span>
        <span style={{ width: 26, textAlign: 'right' }}>A</span>
        <span style={{ width: 44, textAlign: 'right' }}>Rtg</span>
      </div>
      {entries.map((e, i) => (
        <div key={i} className="mono" style={{ display: 'flex', fontSize: 12, padding: '5px 0', borderBottom: '1px solid var(--color-border-dim)', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: 78, color: 'var(--color-text-muted)' }}>{e.date}</span>
          <span style={{ width: 28, color: e.venue === 'H' ? 'var(--color-text-cyan)' : 'var(--color-text-amber)' }}>{e.venue}</span>
          <span style={{ flex: 1, color: 'var(--color-text-primary)' }}>{e.opp}</span>
          <span style={{ width: 50, textAlign: 'right' }}>{e.score}</span>
          <span style={{ width: 44, textAlign: 'right' }}>{e.mins}'</span>
          <span style={{ width: 26, textAlign: 'right', color: e.g ? 'var(--color-text-green)' : 'var(--color-text-muted)' }}>{e.g}</span>
          <span style={{ width: 26, textAlign: 'right', color: e.a ? 'var(--color-text-cyan)' : 'var(--color-text-muted)' }}>{e.a}</span>
          <span className="mono-bold" style={{ width: 44, textAlign: 'right', color: e.rating != null ? barColor((e.rating - 5.5) / 4) : 'var(--color-text-muted)' }}>
            {e.rating != null ? e.rating.toFixed(1) : '–'}
          </span>
        </div>
      ))}
    </div>
  );
}
