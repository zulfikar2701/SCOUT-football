import { useWCPlayersStore } from '../../store/worldcupStore';
import { listPlayers } from '../../lib/worldcup/api';
import { useQuery } from '@tanstack/react-query';
import { PlayerFilterBar } from '../../components/worldcup/PlayerFilterBar';
import { PlayerStatsTable } from '../../components/worldcup/PlayerStatsTable';

export function PlayersExplorer() {
  const store = useWCPlayersStore();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['wc-players-list', store.position, store.team, store.ageMin, store.ageMax, store.search, store.sortBy, store.sortDir],
    queryFn: () => listPlayers(store),
  });

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className="mono-bold" style={{ fontSize: 16, color: 'var(--wc-accent-gold)' }}>PLAYERS</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {players.length} shown
        </span>
      </div>

      <PlayerFilterBar />

      {isLoading ? (
        <div className="mono" style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading players…</div>
      ) : (
        <PlayerStatsTable players={players} />
      )}

      {players.length === 0 && !isLoading && (
        <div className="mono" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
          No players match your filters.
        </div>
      )}
    </div>
  );
}
