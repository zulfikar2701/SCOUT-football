import { useMemo } from 'react';
import { useWCMatchesStore } from '../../store/worldcupStore';
import { listMatches } from '../../lib/worldcup/api';
import { loadWCTeams } from '../../lib/worldcup/data';
import { useQuery } from '@tanstack/react-query';
import { MatchCard } from '../../components/worldcup/MatchCard';

export function MatchesExplorer() {
  const store = useWCMatchesStore();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['wc-matches-list', store.stage, store.group, store.team, store.status, store.search],
    queryFn: () => listMatches(store),
  });

  const { data: teams = [] } = useQuery({ queryKey: ['wc-teams'], queryFn: () => loadWCTeams() });

  const stages = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((m) => { if (m.stage?.name) s.add(m.stage.name); });
    return Array.from(s).sort();
  }, [matches]);

  const groups = useMemo(() => {
    const g = new Set<string>();
    matches.forEach((m) => { if (m.group?.name) g.add(m.group.name); });
    return Array.from(g).sort();
  }, [matches]);

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span className="mono-bold" style={{ fontSize: 16, color: 'var(--wc-accent-gold)' }}>MATCHES</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          {matches.length} shown
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <select
          value={store.stage ?? ''}
          onChange={(e) => store.setStage(e.target.value || null)}
          className="mono"
          style={selectStyle}
        >
          <option value="">All Stages</option>
          {stages.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={store.group ?? ''}
          onChange={(e) => store.setGroup(e.target.value || null)}
          className="mono"
          style={selectStyle}
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>Group {g}</option>
          ))}
        </select>

        <select
          value={store.team ?? ''}
          onChange={(e) => store.setTeam(e.target.value ? Number(e.target.value) : null)}
          className="mono"
          style={selectStyle}
        >
          <option value="">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.abbreviation ?? t.name}</option>
          ))}
        </select>

        <select
          value={store.status ?? ''}
          onChange={(e) => store.setStatus(e.target.value || null)}
          className="mono"
          style={selectStyle}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">Live</option>
          <option value="scheduled">Scheduled</option>
        </select>

        <input
          type="text"
          placeholder="Search team…"
          value={store.search}
          onChange={(e) => store.setSearch(e.target.value)}
          className="mono"
          style={{
            ...selectStyle,
            flex: 1,
            minWidth: 140,
          }}
        />

        <button onClick={() => store.reset()} className="mono" style={btnStyle}>Reset</button>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="mono" style={{ padding: 20, color: 'var(--color-text-muted)', fontSize: 12 }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      {matches.length === 0 && !isLoading && (
        <div className="mono" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
          No matches match your filters.
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  fontSize: 11,
  padding: '6px 8px',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-mid)',
  color: 'var(--color-text-secondary)',
  minHeight: 36,
};

const btnStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '6px 10px',
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border-mid)',
  color: 'var(--color-text-muted)',
  minHeight: 36,
};
