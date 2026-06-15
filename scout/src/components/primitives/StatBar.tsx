import { barColor } from '../../lib/percentiles';

// FM-style attribute bar (§4.6): label · bar (fill by percentile) · value
export function StatBar({
  label,
  value,
  percentile,
  delay = 0,
  height = 6,
}: {
  label: string;
  value: string;
  percentile: number;
  delay?: number;
  height?: number;
}) {
  const color = barColor(percentile);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}>
      <span
        style={{
          width: 140,
          flexShrink: 0,
          fontSize: 12,
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          flexGrow: 1,
          height,
          background: 'var(--color-bg-elevated)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            width: `${Math.max(2, percentile * 100)}%`,
            background: color,
            borderTop: '1px solid rgba(255,255,255,0.3)',
            transformOrigin: 'left',
            animation: `bar-grow 400ms ease-out ${delay}ms both`,
            willChange: 'transform',
          }}
        />
      </span>
      <span
        className="mono-bold"
        style={{ width: 48, textAlign: 'right', fontSize: 13, color }}
      >
        {value}
      </span>
    </div>
  );
}
