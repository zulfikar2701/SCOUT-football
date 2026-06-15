import { useEffect, useRef, useState } from 'react';
import type { Player } from '../../lib/types';
import { searchPlayers } from '../../lib/api';
import { PositionBadge } from '../primitives/PositionBadge';
import { LeagueFlag } from '../primitives/LeagueFlag';
import { CloseIcon, PlusIcon, SearchIcon } from '../primitives/Icons';

export function CompareSlot({ player, color, onPick, onRemove }: { player?: Player; color: string; onPick: (p: Player) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let on = true;
    searchPlayers(q, 30).then((r) => on && setResults(r));
    return () => {
      on = false;
    };
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (player) {
    return (
      <div className="panel" style={{ padding: 12, width: 220, borderTop: `2px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{player.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <LeagueFlag league={player.leagueKey} /> {player.team}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
              <PositionBadge pos={player.posGroup} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{player.age ?? '–'}y · {player.matches} apps</span>
            </div>
          </div>
          <button onClick={onRemove} aria-label="Remove" style={{ color: 'var(--color-text-muted)' }}>
            <CloseIcon size={12} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ width: 220, position: 'relative' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="label"
          style={{ width: '100%', height: 86, border: '1px dashed var(--color-border-hi)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11 }}
        >
          <PlusIcon size={18} />
          Add Player
        </button>
      ) : (
        <div className="panel" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderBottom: '1px solid var(--color-border-mid)' }}>
            <SearchIcon size={13} style={{ color: 'var(--color-accent-amber)' }} />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="mono"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--color-text-primary)' }}
            />
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto' }}>
            {results.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  onPick(p);
                  setOpen(false);
                  setQ('');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', textAlign: 'left' }}
                className="player-row"
              >
                <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-primary)' }}>{p.name}</span>
                <LeagueFlag league={p.leagueKey} />
                <PositionBadge pos={p.posGroup} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
