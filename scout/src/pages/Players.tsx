import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '../store/filterStore';
import { queryPlayers } from '../lib/api';
import { FilterPanel } from '../components/filters/FilterPanel';
import { StatCategoryTabs } from '../components/table/StatCategoryTabs';
import { PlayerTable } from '../components/table/PlayerTable';
import { SkeletonRows } from '../components/table/SkeletonRows';

export function Players() {
  const filters = useFilterStore();
  const { setResultCount, setLoading } = filters;

  const { data, isFetching } = useQuery({
    queryKey: [
      'players',
      filters.leagues,
      filters.positions,
      filters.ageMin,
      filters.ageMax,
      filters.minApps,
      filters.per90,
      filters.search,
      filters.sortBy,
      filters.sortDir,
    ],
    queryFn: () => queryPlayers(filters),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (data) setResultCount(data.total);
  }, [data, setResultCount]);
  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching, setLoading]);

  const rows = data?.rows ?? [];

  return (
    <div className="players-layout">
      <FilterPanel />
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--color-bg-base)' }}>
        <StatCategoryTabs />
        {!data ? <SkeletonRows /> : <PlayerTable rows={rows} />}
        <div
          style={{
            height: 28,
            flexShrink: 0,
            borderTop: '1px solid var(--color-border-mid)',
            background: 'var(--color-bg-surface)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: 12,
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
            {rows.length.toLocaleString('en-GB')} players
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            sorted by {filters.sortBy} {filters.sortDir === 'desc' ? '↓' : '↑'}
            {filters.per90 ? ' · per 90' : ''}
          </span>
          <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-muted)' }}>
            click a row for full profile
          </span>
        </div>
      </section>
    </div>
  );
}
