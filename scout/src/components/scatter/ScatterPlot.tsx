import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ScatterPoint } from '../../lib/api';
import { POS_BADGE } from '../../lib/constants';

const W = 720;
const H = 460;
const M = { top: 16, right: 20, bottom: 44, left: 56 };

export function ScatterPlot({
  points,
  xLabel,
  yLabel,
  onBrush,
  onPick,
  selected,
}: {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  onBrush: (keys: Set<string>) => void;
  onPick: (key: string) => void;
  selected: Set<string>;
}) {
  const brushRef = useRef<SVGGElement>(null);
  const [hover, setHover] = useState<ScatterPoint | null>(null);

  const { x, y } = useMemo(() => {
    const xExt = d3.extent(points, (p) => p.x) as [number, number];
    const yExt = d3.extent(points, (p) => p.y) as [number, number];
    const xs = d3.scaleLinear().domain([Math.min(0, xExt[0]), xExt[1] || 1]).nice().range([M.left, W - M.right]);
    const ys = d3.scaleLinear().domain([Math.min(0, yExt[0]), yExt[1] || 1]).nice().range([H - M.bottom, M.top]);
    return { x: xs, y: ys };
  }, [points]);

  useEffect(() => {
    if (!brushRef.current) return;
    const brush = d3
      .brush<unknown>()
      .extent([
        [M.left, M.top],
        [W - M.right, H - M.bottom],
      ])
      .on('end', (ev) => {
        if (!ev.selection) {
          onBrush(new Set());
          return;
        }
        const [[x0, y0], [x1, y1]] = ev.selection as [[number, number], [number, number]];
        const keys = new Set<string>();
        for (const p of points) {
          const px = x(p.x);
          const py = y(p.y);
          if (px >= x0 && px <= x1 && py >= y0 && py <= y1) keys.add(p.key);
        }
        onBrush(keys);
      });
    const g = d3.select(brushRef.current);
    g.call(brush);
    g.selectAll('.selection').attr('fill', 'rgba(0,212,255,0.08)').attr('stroke', 'var(--color-accent-cyan)');
    return () => {
      g.on('.brush', null);
    };
  }, [points, x, y, onBrush]);

  const xTicks = x.ticks(6);
  const yTicks = y.ticks(6);
  const brushing = selected.size > 0;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* grid */}
        {xTicks.map((t) => (
          <line key={`x${t}`} x1={x(t)} x2={x(t)} y1={M.top} y2={H - M.bottom} stroke="var(--color-border-dim)" strokeDasharray="2 3" />
        ))}
        {yTicks.map((t) => (
          <line key={`y${t}`} x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--color-border-dim)" strokeDasharray="2 3" />
        ))}
        {/* axes */}
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="var(--color-border-hi)" />
        <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="var(--color-border-hi)" />
        {xTicks.map((t) => (
          <text key={`xt${t}`} x={x(t)} y={H - M.bottom + 16} textAnchor="middle" className="mono" style={{ fontSize: 9, fill: 'var(--color-text-muted)' }}>{t}</text>
        ))}
        {yTicks.map((t) => (
          <text key={`yt${t}`} x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" className="mono" style={{ fontSize: 9, fill: 'var(--color-text-muted)' }}>{t}</text>
        ))}
        <text x={(W + M.left) / 2} y={H - 6} textAnchor="middle" className="label" style={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}>{xLabel}</text>
        <text transform={`translate(14,${(H - M.bottom + M.top) / 2}) rotate(-90)`} textAnchor="middle" className="label" style={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}>{yLabel}</text>

        {/* brush layer (under points so points stay clickable) */}
        <g ref={brushRef} />

        {/* points */}
        {points.map((p) => {
          const sel = !brushing || selected.has(p.key);
          return (
            <circle
              key={p.key}
              cx={x(p.x)}
              cy={y(p.y)}
              r={hover?.key === p.key ? 6 : 3.4}
              fill={POS_BADGE[p.pos].fg}
              fillOpacity={sel ? 0.85 : 0.12}
              stroke={hover?.key === p.key ? 'var(--color-text-primary)' : 'none'}
              strokeWidth={1}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onPick(p.key)}
            />
          );
        })}
      </svg>
      {hover && (
        <div
          className="panel"
          style={{
            position: 'absolute',
            left: `${(x(hover.x) / W) * 100}%`,
            top: `${(y(hover.y) / H) * 100}%`,
            transform: 'translate(10px, -50%)',
            padding: '6px 10px',
            pointerEvents: 'none',
            zIndex: 5,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{hover.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{hover.team}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{xLabel}: {hover.x.toFixed(2)} · {yLabel}: {hover.y.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
