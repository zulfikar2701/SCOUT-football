import { useFilterStore } from '../../store/filterStore';
import { CATEGORIES } from '../../lib/metrics';

export function StatCategoryTabs() {
  const { category, setCategory } = useFilterStore();
  return (
    <div style={{ display: 'flex', background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border-mid)', flexShrink: 0 }}>
      {CATEGORIES.map((c) => {
        const on = category === c.key;
        return (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className="label"
            style={{
              padding: '9px 18px',
              fontSize: 11,
              color: on ? 'var(--color-text-amber)' : 'var(--color-text-secondary)',
              borderBottom: on ? '2px solid var(--color-accent-amber)' : '2px solid transparent',
              transition: 'color 120ms',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
