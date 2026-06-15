import type { LeagueKey } from '../../lib/types';
import { LEAGUE_FLAGS } from '../../lib/constants';

// 2-colour ISO rectangle badge (§4.2)
export function LeagueFlag({ league, title }: { league: LeagueKey; title?: string }) {
  const f = LEAGUE_FLAGS[league];
  return (
    <svg
      width={18}
      height={12}
      viewBox="0 0 18 12"
      role="img"
      aria-label={title || league}
      style={{
        border: '1px solid var(--color-border-mid)',
        borderRadius: 1,
        flexShrink: 0,
        display: 'block',
      }}
    >
      <rect x="0" y="0" width="18" height="6" fill={f.a} />
      <rect x="0" y="6" width="18" height="6" fill={f.b} />
      {league === 'ucl' && <circle cx="9" cy="6" r="2.2" fill="none" stroke={f.b} strokeWidth="0.8" />}
    </svg>
  );
}
