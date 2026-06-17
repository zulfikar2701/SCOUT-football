import { Link } from 'react-router-dom';

export function WorldCupHome() {
  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <span
          className="mono-bold"
          style={{
            fontSize: 'clamp(24px, 6vw, 40px)',
            color: 'var(--wc-accent-gold)',
            letterSpacing: '-0.02em',
            textShadow: '0 0 20px rgba(245,166,35,0.2)',
          }}
        >
          WORLD CUP 2026
        </span>
        <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
          48 TEAMS · 104 MATCHES · NORTH AMERICA
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <Link to="/worldcup/matches" style={navCardStyle}>
          <span className="mono-bold" style={{ fontSize: 18, color: 'var(--wc-accent-gold)' }}>MATCHES</span>
          <span className="label" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Schedule, scores, and play-by-play replay
          </span>
        </Link>

        <Link to="/worldcup/players" style={navCardStyle}>
          <span className="mono-bold" style={{ fontSize: 18, color: 'var(--wc-accent-cyan)' }}>PLAYERS</span>
          <span className="label" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Tournament stats, sortable and filterable
          </span>
        </Link>
      </div>
    </div>
  );
}

const navCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '28px 16px',
  background: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-mid)',
  textDecoration: 'none',
  textAlign: 'center',
  minHeight: 120,
  touchAction: 'manipulation',
};
