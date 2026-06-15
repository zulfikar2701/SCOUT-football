import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div className="mono-bold" style={{ fontSize: 40, color: 'var(--color-accent-red)', letterSpacing: '0.1em' }}>
        CONNECTION LOST
      </div>
      <div className="mono" style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
        ERR 404 · the requested record could not be reached
      </div>
      <Link
        to="/players"
        className="label"
        style={{ fontSize: 12, color: 'var(--color-accent-cyan)', border: '1px solid var(--color-accent-cyan-dim)', padding: '8px 16px' }}
      >
        ↺ Reconnect to database
      </Link>
    </div>
  );
}
