import { useFilterStore } from '../../store/filterStore';
import { KEY_TO_LEAGUE, SEASON_LABEL, X_URL } from '../../lib/constants';
import { XLogo } from '../primitives/Icons';
import { countPlayersSync } from '../../lib/api';

export function StatusBar() {
  const filters = useFilterStore();
  const { leagues, positions, minApps, resultCount, loading } = filters;

  const leaguePart = leagues.length
    ? leagues.map((l) => KEY_TO_LEAGUE[l].display).join('+')
    : 'ALL LEAGUES';
  const posPart = positions.length ? positions.join('/') : 'ALL POS';
  const liveCount = countPlayersSync(filters);
  const count = liveCount ?? resultCount;
  const summary = `${leaguePart} · ${SEASON_LABEL} · ${posPart} · min ${minApps} apps · ${count} players`;

  return (
    <footer
      style={{
        height: 22,
        background: 'var(--color-bg-deep)',
        borderTop: '1px solid var(--color-border-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0,
      }}
    >
      <span className="mono" style={{ fontWeight: 300, fontSize: 10, color: 'var(--color-text-secondary)' }}>
        {summary}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {loading && (
          <span className="mono spinner" style={{ fontSize: 10, color: 'var(--color-accent-cyan)' }} />
        )}
        <a
          href={X_URL}
          target="_blank"
          rel="noreferrer"
          className="mono"
          style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <XLogo size={9} /> @zulfikarsenal
        </a>
        <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          SCOUT v2.1
        </span>
      </span>
    </footer>
  );
}
