import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { searchPlayers } from '../../lib/api';
import type { Player } from '../../lib/types';
import { SearchResultItem } from './SearchResultItem';
import { SearchIcon } from '../primitives/Icons';

export function SearchModal() {
  const searchOpen = useUIStore((s) => s.searchOpen);
  if (!searchOpen) return null;
  return <SearchModalInner />;
}

// Mounted only while open, so state starts fresh on every open.
function SearchModalInner() {
  const closeSearch = useUIStore((s) => s.closeSearch);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Player[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    let on = true;
    const t = setTimeout(() => {
      searchPlayers(q, 80).then((r) => {
        if (on) {
          setResults(r);
          setActive(0);
        }
      });
    }, 120);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [q]);

  const go = (p: Player) => {
    closeSearch();
    navigate(`/players/${p.key}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeSearch();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active]);
    }
  };

  return (
    <div
      onClick={closeSearch}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        className="panel"
        style={{ width: 480, maxWidth: '92vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', animation: 'modal-in 180ms ease-out' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderBottom: '1px solid var(--color-border-mid)' }}>
          <span style={{ color: 'var(--color-accent-amber)' }}>
            <SearchIcon size={16} />
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search players…"
            className="mono"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: 'var(--color-text-primary)',
              caretColor: 'var(--color-accent-amber)',
            }}
          />
          <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>ESC</span>
        </div>
        <div style={{ overflowY: 'auto' }}>
          {results.length === 0 && q.trim() && (
            <div className="mono" style={{ padding: 16, fontSize: 12, color: 'var(--color-text-muted)' }}>No players found.</div>
          )}
          {results.map((p, i) => (
            <SearchResultItem key={p.key} player={p} active={i === active} onClick={() => go(p)} />
          ))}
        </div>
      </div>
    </div>
  );
}
