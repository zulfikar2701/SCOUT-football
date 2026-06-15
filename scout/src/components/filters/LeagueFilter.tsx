import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '../../store/filterStore';
import { LEAGUES } from '../../lib/constants';
import { LeagueFlag } from '../primitives/LeagueFlag';
import { metaLeagues } from '../../lib/api';

export function LeagueFilter() {
  const { leagues, toggleLeague } = useFilterStore();
  const { data } = useQuery({ queryKey: ['meta', 'leagues'], queryFn: () => metaLeagues() });
  const counts = Object.fromEntries((data ?? []).map((d) => [d.key, d.count]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {LEAGUES.map((l) => {
        const on = leagues.includes(l.key);
        return (
          <button
            key={l.key}
            onClick={() => toggleLeague(l.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', width: '100%' }}
          >
            <span
              style={{
                width: 13,
                height: 13,
                border: '1px solid var(--color-border-hi)',
                background: on ? 'var(--color-accent-amber)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {on && <span style={{ color: 'var(--color-bg-deep)', fontSize: 10, lineHeight: 1 }}>✓</span>}
            </span>
            <LeagueFlag league={l.key} title={l.country} />
            <span style={{ fontSize: 13, color: on ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
              {l.display}
            </span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-muted)' }}>
              {counts[l.key] ?? ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
