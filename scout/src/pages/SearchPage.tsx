import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPlayers } from '../lib/api';
import type { Player } from '../lib/types';
import { SearchIcon } from '../components/primitives/Icons';
import { LeagueFlag } from '../components/primitives/LeagueFlag';
import { PositionBadge } from '../components/primitives/PositionBadge';
import { DiamondRating } from '../components/primitives/DiamondRating';

export function SearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Player[]>([]);

  useEffect(() => {
    let on = true;
    const t = setTimeout(() => searchPlayers(q, 60).then((r) => on && setResults(r)), 120);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
      <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, maxWidth: 620, margin: '0 auto 20px' }}>
        <span style={{ color: 'var(--color-accent-amber)' }}>
          <SearchIcon size={18} />
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search players by name or club…"
          className="mono"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 18, color: 'var(--color-text-primary)', caretColor: 'var(--color-accent-amber)' }}
        />
        <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Ctrl+K anywhere</span>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {results.map((p) => (
          <button
            key={p.key}
            onClick={() => navigate(`/players/${p.key}`)}
            className="panel player-row"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, textAlign: 'left' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <LeagueFlag league={p.leagueKey} /> {p.team}
              </div>
            </div>
            <PositionBadge pos={p.posGroup} />
            <div style={{ textAlign: 'right' }}>
              <div className="mono-bold" style={{ fontSize: 15, color: 'var(--color-text-amber)' }}>{(p.rating ?? 0).toFixed(2)}</div>
              <DiamondRating value={p.rating ?? 0} size={9} />
            </div>
          </button>
        ))}
        {q.trim() && results.length === 0 && (
          <div className="mono" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-muted)', padding: 30 }}>No players found.</div>
        )}
      </div>
    </div>
  );
}
