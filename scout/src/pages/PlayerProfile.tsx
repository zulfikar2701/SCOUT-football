import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMatchLog, getRadarIndex } from '../lib/api';
import { loadPlayers } from '../lib/data';
import { buildPercentileIndex } from '../lib/api';
import { useFilterStore } from '../store/filterStore';
import { METRIC_BY_KEY, METRICS, RADAR_AXES, metricValue } from '../lib/metrics';
import { PlayerHeader } from '../components/profile/PlayerHeader';
import { RadarChart } from '../components/profile/RadarChart';
import { StatAttributeGrid } from '../components/profile/StatAttributeGrid';
import { MatchLog } from '../components/profile/MatchLog';
import { RetroButton } from '../components/primitives/RetroButton';
import { betterThan, fmtNum } from '../lib/formatters';
import { barColor } from '../lib/percentiles';

export function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const per90 = useFilterStore((s) => s.per90);
  const [hover, setHover] = useState<number | null>(null);

  const { data: players } = useQuery({ queryKey: ['allPlayers'], queryFn: () => loadPlayers() });
  const { data: radarIdx } = useQuery({ queryKey: ['radarIndex'], queryFn: () => getRadarIndex([...RADAR_AXES]) });
  const { data: matchLog } = useQuery({ queryKey: ['matchlog', id], queryFn: () => getMatchLog(id!), enabled: !!id });

  const player = players?.find((p) => p.key === id);

  const gridIndex = useMemo(
    () => (players ? buildPercentileIndex(players, METRICS.map((m) => m.key), per90) : null),
    [players, per90],
  );

  const radar = useMemo(() => {
    if (!player || !radarIdx) return null;
    const values = RADAR_AXES.map((k) => radarIdx.pct(k, metricValue(METRIC_BY_KEY[k], player, true), true));
    return values;
  }, [player, radarIdx]);

  if (!players || !radarIdx) {
    return <div className="mono" style={{ padding: 40, color: 'var(--color-text-muted)' }}>Loading profile…</div>;
  }
  if (!player) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div className="mono" style={{ color: 'var(--color-text-red)', fontSize: 14 }}>PLAYER NOT FOUND</div>
        <Link to="/players" className="label" style={{ display: 'inline-block', marginTop: 12, color: 'var(--color-accent-cyan)', fontSize: 12 }}>← Back to players</Link>
      </div>
    );
  }

  const ratingPct = gridIndex ? gridIndex.pct('rating', player.rating ?? 0, true) : 0.5;
  const axisLabels = RADAR_AXES.map((k) => METRIC_BY_KEY[k].label);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <PlayerHeader player={player} ratingPct={ratingPct} />

      <div style={{ display: 'flex', gap: 22, padding: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Radar + tooltip */}
        <div className="panel" style={{ padding: 18, width: 360, flexShrink: 0 }}>
          <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Percentile Radar · per 90</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {radar && (
              <RadarChart
                axes={axisLabels}
                series={[{ color: 'var(--color-accent-amber)', fill: 'rgba(245,166,35,0.18)', values: radar }]}
                size={300}
                hoveredAxis={hover}
                onHoverAxis={setHover}
              />
            )}
          </div>
          <div style={{ minHeight: 56, marginTop: 8, borderTop: '1px solid var(--color-border-dim)', paddingTop: 8 }}>
            {hover != null && radar ? (
              <RadarTip player={player} axisKey={RADAR_AXES[hover]} pct={radar[hover]} />
            ) : (
              <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Hover a vertex for the percentile breakdown.</div>
            )}
          </div>
        </div>

        {/* Match log */}
        <div className="panel" style={{ padding: 18, flex: 1, minWidth: 360 }}>
          <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10 }}>Recent Matches</div>
          <MatchLog entries={matchLog ?? []} />
        </div>

        {/* Attribute grid */}
        <div className="panel" style={{ padding: 18, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              Attribute Breakdown {per90 ? '· per 90' : '· season totals'} · percentile vs all players
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <RetroButton accent="cyan" onClick={() => navigate(`/compare?ids=${player.key}`)}>+ Compare</RetroButton>
              <RetroButton onClick={() => navigate('/players')}>← Table</RetroButton>
            </div>
          </div>
          {gridIndex && <StatAttributeGrid player={player} index={gridIndex} per90={per90} />}
        </div>
      </div>
    </div>
  );
}

function RadarTip({ player, axisKey, pct }: { player: import('../lib/types').Player; axisKey: string; pct: number }) {
  const m = METRIC_BY_KEY[axisKey];
  const v = metricValue(m, player, true);
  return (
    <div style={{ animation: 'scout-fade-in 120ms ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{m.full} /90</span>
        <span className="mono-bold" style={{ fontSize: 15, color: barColor(pct) }}>{fmtNum(v, 2)}</span>
      </div>
      <div className="mono" style={{ fontSize: 11, color: barColor(pct), marginTop: 2 }}>{betterThan(pct)}</div>
    </div>
  );
}
