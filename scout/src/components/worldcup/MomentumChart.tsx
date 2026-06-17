import { useMemo } from 'react';
import type { FIFAMatch, FIFAMatchMomentumPoint } from '../../lib/worldcup/types';
import { loadWCMatchDetail } from '../../lib/worldcup/data';
import { useQuery } from '@tanstack/react-query';

interface Props {
  match: FIFAMatch;
  currentMinute?: number;
}

export function MomentumChart({ match, currentMinute = 90 }: Props) {
  const { data: bundle, isLoading } = useQuery({
    queryKey: ['wc-match-detail', match.id],
    queryFn: () => loadWCMatchDetail(match.id),
  });

  const points = useMemo<FIFAMatchMomentumPoint[]>(() => bundle?.momentum?.data ?? [], [bundle?.momentum?.data]);

  const { minV, maxV, svgPoints, zeroY } = useMemo(() => {
    if (!points.length) return { minV: 0, maxV: 0, svgPoints: '', zeroY: 50 };
    const vals = points.map((p) => p.value);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const W = 300;
    const H = 80;
    const zeroY = H - ((0 - minV) / range) * H;
    const d = points
      .map((p, i) => {
        const x = (i / (points.length - 1 || 1)) * W;
        const y = H - ((p.value - minV) / range) * H;
        return `${x},${y}`;
      })
      .join(' ');
    return { minV, maxV, svgPoints: d, zeroY };
  }, [points]);

  if (isLoading) {
    return <div className="mono" style={{ padding: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>Loading momentum…</div>;
  }

  if (!points.length) {
    return <div className="mono" style={{ padding: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>No momentum data</div>;
  }

  const W = 300;
  const H = 80;
  const playheadX = (Math.min(currentMinute, points.length - 1) / (points.length - 1 || 1)) * W;

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span className="label" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>MOMENTUM</span>
        <span className="mono" style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>
          {minV.toFixed(1)} … {maxV.toFixed(1)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="none">
        {/* Zero line */}
        <line x1={0} y1={zeroY} x2={W} y2={zeroY} stroke="var(--color-border-hi)" strokeWidth={0.5} strokeDasharray="2 2" />
        {/* Area */}
        <polygon
          points={`0,${zeroY} ${svgPoints} ${W},${zeroY}`}
          fill="var(--color-accent-cyan-glow)"
        />
        {/* Line */}
        <polyline
          points={svgPoints}
          fill="none"
          stroke="var(--color-accent-cyan)"
          strokeWidth={1.5}
        />
        {/* Playhead */}
        {currentMinute >= 0 && (
          <line x1={playheadX} y1={0} x2={playheadX} y2={H} stroke="var(--color-accent-amber)" strokeWidth={1} />
        )}
      </svg>
    </div>
  );
}
