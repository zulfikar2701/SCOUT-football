import { useState, useMemo } from 'react';
import type { WCPlayerAgg } from '../../lib/worldcup/types';
import { Link } from 'react-router-dom';

type SortKey =
  | 'minutes_played' | 'appearances' | 'starts' | 'goals' | 'assists'
  | 'expected_goals' | 'expected_assists' | 'key_passes' | 'shots_on_target'
  | 'tackles' | 'interceptions' | 'clearances' | 'duels_won' | 'saves'
  | 'avg_rating' | 'goals_per_match' | 'assists_per_match' | 'xg_per_match' | 'xa_per_match';

const COLS: { key: SortKey; label: string; fmt?: (v: number) => string }[] = [
  { key: 'appearances', label: 'App' },
  { key: 'minutes_played', label: 'Min' },
  { key: 'goals', label: 'G' },
  { key: 'assists', label: 'A' },
  { key: 'expected_goals', label: 'xG', fmt: (v) => v.toFixed(2) },
  { key: 'expected_assists', label: 'xA', fmt: (v) => v.toFixed(2) },
  { key: 'key_passes', label: 'KP' },
  { key: 'shots_on_target', label: 'SoT' },
  { key: 'tackles', label: 'Tk' },
  { key: 'interceptions', label: 'Int' },
  { key: 'saves', label: 'Sv' },
  { key: 'avg_rating', label: 'Rtg', fmt: (v) => v.toFixed(1) },
];

interface Props {
  players: WCPlayerAgg[];
}

export function PlayerStatsTable({ players }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('minutes_played');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const rows = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...players].sort((a, b) => {
      const va = a[sortBy] ?? -1;
      const vb = b[sortBy] ?? -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return 0;
    });
  }, [players, sortBy, sortDir]);

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-mid)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-muted)', fontWeight: 400 }} className="label">Player</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-muted)', fontWeight: 400 }} className="label">Team</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-muted)', fontWeight: 400 }} className="label">Pos</th>
            {COLS.map((c) => (
              <th
                key={c.key}
                onClick={() => {
                  if (sortBy === c.key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                  else { setSortBy(c.key); setSortDir('desc'); }
                }}
                style={{
                  textAlign: 'right',
                  padding: '6px 8px',
                  color: sortBy === c.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: sortBy === c.key ? 700 : 400,
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
                className="mono"
              >
                {c.label} {sortBy === c.key ? (sortDir === 'desc' ? '▼' : '▲') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.player.id}
              className="player-row"
              style={{ borderBottom: '1px solid var(--color-border-dim)' }}
            >
              <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                <Link to={`/worldcup/players/${p.player.id}`} style={{ color: 'var(--color-accent-amber)', fontWeight: 500 }}>
                  {p.player.name}
                </Link>
              </td>
              <td className="mono" style={{ padding: '6px 8px', color: 'var(--color-text-secondary)', fontSize: 10 }}>
                {p.team_abbreviation ?? '–'}
              </td>
              <td className="mono" style={{ padding: '6px 8px', color: 'var(--color-text-muted)', fontSize: 10 }}>
                {p.player.position ?? '–'}
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="mono" style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--color-text-secondary)' }}>
                  {c.fmt ? c.fmt(p[c.key] as number) : p[c.key] ?? '–'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
