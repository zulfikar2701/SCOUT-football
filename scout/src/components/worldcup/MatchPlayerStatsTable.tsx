import { useState, useMemo } from 'react';
import type { FIFAMatch, FIFAPlayerMatchStats } from '../../lib/worldcup/types';
import { loadWCMatchDetail } from '../../lib/worldcup/data';
import { useQuery } from '@tanstack/react-query';
import { getTeamMap } from '../../lib/worldcup/api';

interface Props {
  match: FIFAMatch;
}

type SortKey = 'rating' | 'minutes_played' | 'goals' | 'assists' | 'expected_goals' | 'expected_assists' | 'key_passes' | 'shots_on_target' | 'tackles' | 'interceptions';

const COLS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Rtg' },
  { key: 'minutes_played', label: 'Min' },
  { key: 'goals', label: 'G' },
  { key: 'assists', label: 'A' },
  { key: 'expected_goals', label: 'xG' },
  { key: 'expected_assists', label: 'xA' },
  { key: 'key_passes', label: 'KP' },
  { key: 'shots_on_target', label: 'SoT' },
  { key: 'tackles', label: 'Tk' },
  { key: 'interceptions', label: 'Int' },
];

export function MatchPlayerStatsTable({ match }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['wc-match-detail', match.id],
    queryFn: () => loadWCMatchDetail(match.id),
  });

  const { data: teamMap } = useQuery({
    queryKey: ['wc-teams-map'],
    queryFn: () => getTeamMap(),
  });

  const rows = useMemo(() => {
    const stats: FIFAPlayerMatchStats[] = bundle?.player_match_stats?.data ?? [];
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...stats].sort((a, b) => {
      const va = a[sortBy] ?? -1;
      const vb = b[sortBy] ?? -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return 0;
    });
  }, [bundle, sortBy, sortDir]);

  if (isLoading) return <div className="mono" style={{ padding: 16, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading stats…</div>;

  const homeTeamName = teamMap?.[match.home_team?.id ?? 0]?.abbreviation ?? match.home_team?.name ?? 'Home';
  const awayTeamName = teamMap?.[match.away_team?.id ?? 0]?.abbreviation ?? match.away_team?.name ?? 'Away';

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 520 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border-mid)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--color-text-muted)', fontWeight: 400 }} className="label">Player</th>
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
          {rows.map((r, i) => {
            const isHome = r.is_home;
            return (
              <tr
                key={`${r.player_id}-${i}`}
                style={{
                  borderBottom: '1px solid var(--color-border-dim)',
                  background: isHome ? 'rgba(245,166,35,0.02)' : 'rgba(0,212,255,0.02)',
                }}
              >
                <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginRight: 6 }}>
                    {isHome ? homeTeamName : awayTeamName}
                  </span>
                  <span style={{ fontSize: 11 }}>Player {r.player_id}</span>
                </td>
                {COLS.map((c) => (
                  <td key={c.key} className="mono" style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--color-text-secondary)' }}>
                    {typeof r[c.key] === 'number' ? (r[c.key] as number).toFixed(c.key === 'rating' ? 1 : c.key.startsWith('expected') ? 2 : 0) : '–'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
