import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { NavTabs } from './NavTabs';
import { ScoutMark, XLogo } from '../primitives/Icons';
import { SEASON_LABEL, X_URL } from '../../lib/constants';
import { loadPlayers } from '../../lib/data';

export function TopBar() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    loadPlayers().then((p) => setCount(p.length));
  }, []);

  return (
    <header
      style={{
        height: 44,
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border-mid)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 16,
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
      }}
    >
      <Link to="/players" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ScoutMark size={22} style={{ color: 'var(--color-accent-amber)' }} />
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.04em',
            color: 'var(--color-accent-amber)',
            lineHeight: 1,
          }}
        >
          SCOUT
        </span>
        <span className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 2 }}>
          Big 5 · By the Numbers
        </span>
      </Link>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', height: '100%' }}>
        <NavTabs />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span
          className="mono hide-mobile"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-secondary)' }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-accent-green)',
              boxShadow: '0 0 6px var(--color-accent-green)',
            }}
          />
          {count.toLocaleString('en-GB')} REC
        </span>
        <span className="label hide-mobile" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {SEASON_LABEL}
        </span>
        <a
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Creator on X"
          title="@zulfikarsenal on X"
          style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', minWidth: 28, minHeight: 28, justifyContent: 'center' }}
        >
          <XLogo size={14} />
        </a>
      </div>
    </header>
  );
}
