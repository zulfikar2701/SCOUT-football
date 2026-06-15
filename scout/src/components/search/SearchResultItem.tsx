import type { Player } from '../../lib/types';
import { LeagueFlag } from '../primitives/LeagueFlag';
import { PositionBadge } from '../primitives/PositionBadge';

export function SearchResultItem({ player, active, onClick }: { player: Player; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 12px',
        background: active ? 'var(--color-bg-selected)' : 'transparent',
        borderLeft: active ? '3px solid var(--color-accent-cyan)' : '3px solid transparent',
        textAlign: 'left',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {player.name}
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{player.team}</span>
      <LeagueFlag league={player.leagueKey} />
      <PositionBadge pos={player.posGroup} />
    </button>
  );
}
