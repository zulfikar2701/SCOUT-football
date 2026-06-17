import { useWCPlayersStore } from '../../store/worldcupStore';
import { loadWCTeams } from '../../lib/worldcup/data';
import { useQuery } from '@tanstack/react-query';

const POSITIONS = ['GK', 'DF', 'MF', 'FW'];

export function PlayerFilterBar() {
  const store = useWCPlayersStore();
  const { data: teams = [] } = useQuery({ queryKey: ['wc-teams'], queryFn: () => loadWCTeams() });

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        padding: '10px 12px',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-mid)',
        alignItems: 'center',
      }}
    >
      {/* Position chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {POSITIONS.map((pos) => {
          const active = store.position === pos;
          return (
            <button
              key={pos}
              onClick={() => store.setPosition(active ? null : pos)}
              className="mono-bold"
              style={{
                fontSize: 10,
                padding: '6px 10px',
                background: active ? 'var(--color-accent-amber)' : 'var(--color-bg-elevated)',
                color: active ? 'var(--color-bg-deep)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-mid)',
                minHeight: 36,
                minWidth: 40,
              }}
            >
              {pos}
            </button>
          );
        })}
      </div>

      {/* Team select */}
      <select
        value={store.team ?? ''}
        onChange={(e) => store.setTeam(e.target.value ? Number(e.target.value) : null)}
        className="mono"
        style={{
          fontSize: 11,
          padding: '6px 8px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-mid)',
          color: 'var(--color-text-secondary)',
          minHeight: 36,
          minWidth: 100,
        }}
      >
        <option value="">All Teams</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.abbreviation ?? t.name}</option>
        ))}
      </select>

      {/* Age range */}
      <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <span>Age</span>
        <input
          type="number"
          min={16}
          max={45}
          value={store.ageMin}
          onChange={(e) => store.setAge(Number(e.target.value), store.ageMax)}
          style={{
            width: 40,
            fontSize: 11,
            padding: '4px 6px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-mid)',
            color: 'inherit',
            minHeight: 32,
          }}
        />
        <span>–</span>
        <input
          type="number"
          min={16}
          max={45}
          value={store.ageMax}
          onChange={(e) => store.setAge(store.ageMin, Number(e.target.value))}
          style={{
            width: 40,
            fontSize: 11,
            padding: '4px 6px',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-mid)',
            color: 'inherit',
            minHeight: 32,
          }}
        />
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search player…"
        value={store.search}
        onChange={(e) => store.setSearch(e.target.value)}
        className="mono"
        style={{
          flex: 1,
          minWidth: 140,
          fontSize: 11,
          padding: '6px 10px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-mid)',
          color: 'var(--color-text-primary)',
          minHeight: 36,
        }}
      />

      {/* Reset */}
      <button
        onClick={() => store.reset()}
        className="mono"
        style={{
          fontSize: 10,
          padding: '6px 10px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-mid)',
          color: 'var(--color-text-muted)',
          minHeight: 36,
        }}
      >
        Reset
      </button>
    </div>
  );
}
