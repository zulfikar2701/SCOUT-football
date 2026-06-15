import { useFilterStore } from '../../store/filterStore';
import { MIN_APPS_OPTIONS } from '../../lib/constants';

export function MinAppsControl() {
  const { minApps, setMinApps } = useFilterStore();
  return (
    <div style={{ display: 'flex', border: '1px solid var(--color-border-mid)' }}>
      {MIN_APPS_OPTIONS.map((n, i) => {
        const on = minApps === n;
        return (
          <button
            key={n}
            onClick={() => setMinApps(n)}
            className="mono-bold"
            style={{
              flex: 1,
              padding: '5px 0',
              fontSize: 12,
              background: on ? 'var(--color-accent-amber)' : 'transparent',
              color: on ? 'var(--color-bg-deep)' : 'var(--color-text-secondary)',
              borderLeft: i ? '1px solid var(--color-border-mid)' : 'none',
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
