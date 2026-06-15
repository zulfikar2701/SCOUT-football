import { useFilterStore } from '../../store/filterStore';
import { AGE_CEIL, AGE_FLOOR } from '../../lib/constants';

export function AgeRangeSlider() {
  const { ageMin, ageMax, setAge } = useFilterStore();
  const pct = (v: number) => ((v - AGE_FLOOR) / (AGE_CEIL - AGE_FLOOR)) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-amber)' }}>{ageMin}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-amber)' }}>{ageMax}</span>
      </div>
      <div style={{ position: 'relative', height: 18 }}>
        <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 2, background: 'var(--color-border-mid)' }} />
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: `${pct(ageMin)}%`,
            right: `${100 - pct(ageMax)}%`,
            height: 2,
            background: 'var(--color-accent-amber)',
          }}
        />
        <input
          type="range"
          min={AGE_FLOOR}
          max={AGE_CEIL}
          value={ageMin}
          aria-label="Minimum age"
          onChange={(e) => setAge(Math.min(+e.target.value, ageMax), ageMax)}
          className="age-thumb"
        />
        <input
          type="range"
          min={AGE_FLOOR}
          max={AGE_CEIL}
          value={ageMax}
          aria-label="Maximum age"
          onChange={(e) => setAge(ageMin, Math.max(+e.target.value, ageMin))}
          className="age-thumb"
        />
      </div>
    </div>
  );
}
