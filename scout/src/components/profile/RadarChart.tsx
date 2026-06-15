export interface RadarSeries {
  color: string;
  fill: string;
  values: number[]; // 0..1 per axis, same length as axes
}

interface Props {
  axes: string[];
  series: RadarSeries[];
  size?: number;
  onHoverAxis?: (index: number | null) => void;
  hoveredAxis?: number | null;
}

export function RadarChart({ axes, series, size = 280, onHoverAxis, hoveredAxis }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 46;
  const n = axes.length;

  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const point = (i: number, v: number): [number, number] => [
    cx + r * v * Math.cos(angle(i)),
    cy + r * v * Math.sin(angle(i)),
  ];

  const rings = [0.2, 0.4, 0.6, 0.8, 1];

  const polyPoints = (values: number[]) =>
    values.map((v, i) => `${r * v * Math.cos(angle(i))},${r * v * Math.sin(angle(i))}`).join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
      <g transform={`translate(${cx},${cy})`}>
        {/* rings */}
        {rings.map((ring) => (
          <polygon
            key={ring}
            points={axes.map((_, i) => `${r * ring * Math.cos(angle(i))},${r * ring * Math.sin(angle(i))}`).join(' ')}
            fill="none"
            stroke="var(--color-border-dim)"
            strokeDasharray="2 3"
            strokeWidth={1}
          />
        ))}
        {/* axis lines */}
        {axes.map((_, i) => {
          const [x, y] = [r * Math.cos(angle(i)), r * Math.sin(angle(i))];
          return <line key={i} x1={0} y1={0} x2={x} y2={y} stroke="var(--color-border-mid)" strokeWidth={hoveredAxis === i ? 1.5 : 1} />;
        })}
      </g>

      {/* series polygons */}
      <g transform={`translate(${cx},${cy})`}>
        {series.map((s, si) => (
          <polygon
            key={si}
            points={polyPoints(s.values)}
            fill={s.fill}
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'radar-grow 600ms cubic-bezier(0.34,1.56,0.64,1) both' }}
          />
        ))}
      </g>

      {/* vertices (hover targets on first series) */}
      {series[0] &&
        series[0].values.map((v, i) => {
          const [x, y] = point(i, v);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={hoveredAxis === i ? 5 : 3}
              fill={series[0].color}
              stroke="var(--color-bg-deep)"
              strokeWidth={1}
              style={{ cursor: onHoverAxis ? 'pointer' : 'default' }}
              onMouseEnter={() => onHoverAxis?.(i)}
              onMouseLeave={() => onHoverAxis?.(null)}
            />
          );
        })}

      {/* axis labels */}
      {axes.map((label, i) => {
        const lr = r + 22;
        const x = cx + lr * Math.cos(angle(i));
        const y = cy + lr * Math.sin(angle(i));
        const anchor = Math.abs(Math.cos(angle(i))) < 0.3 ? 'middle' : Math.cos(angle(i)) > 0 ? 'start' : 'end';
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="mono"
            style={{ fontSize: 9, fill: hoveredAxis === i ? 'var(--color-accent-amber)' : 'var(--color-text-secondary)' }}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
