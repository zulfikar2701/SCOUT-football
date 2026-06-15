import { barColor } from '../../lib/percentiles';

// Circular ring, arc fill proportional to rating/10 (§9.4.2)
export function RatingRing({ rating, percentile, size = 72 }: { rating: number; percentile: number; size?: number }) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, rating / 10));
  const color = barColor(percentile);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border-mid)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${c * frac} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 600ms ease-out' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="mono-bold" style={{ fontSize: 22, fill: color }}>
        {rating.toFixed(1)}
      </text>
    </svg>
  );
}
