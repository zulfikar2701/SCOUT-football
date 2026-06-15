import { useFilterStore } from '../../store/filterStore';
import { CollapsibleGroup } from './CollapsibleGroup';
import { LeagueFilter } from './LeagueFilter';
import { PositionChips } from './PositionChips';
import { AgeRangeSlider } from './AgeRangeSlider';
import { MinAppsControl } from './MinAppsControl';
import { Per90Toggle } from './Per90Toggle';
import { SearchIcon } from '../primitives/Icons';

export function FilterPanel() {
  const { search, setSearch, reset } = useFilterStore();
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border-mid)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border-dim)' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <SearchIcon size={13} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or club…"
            className="mono"
            style={{
              width: '100%',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-mid)',
              padding: '6px 8px 6px 28px',
              fontSize: 12,
              color: 'var(--color-text-primary)',
            }}
          />
        </div>
      </div>

      <CollapsibleGroup title="League">
        <LeagueFilter />
      </CollapsibleGroup>
      <CollapsibleGroup title="Position">
        <PositionChips />
      </CollapsibleGroup>
      <CollapsibleGroup title="Age">
        <AgeRangeSlider />
      </CollapsibleGroup>
      <CollapsibleGroup title="Min. Appearances">
        <MinAppsControl />
      </CollapsibleGroup>
      <CollapsibleGroup title="Normalisation">
        <Per90Toggle />
      </CollapsibleGroup>

      <div style={{ padding: 12, marginTop: 'auto' }}>
        <button
          onClick={reset}
          className="label"
          style={{
            width: '100%',
            padding: '7px 0',
            fontSize: 11,
            border: '1px solid var(--color-border-hi)',
            color: 'var(--color-text-secondary)',
            transition: 'border-color 120ms, color 120ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-amber)';
            e.currentTarget.style.color = 'var(--color-text-amber)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-hi)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
