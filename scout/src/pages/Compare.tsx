import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getRadarIndex } from '../lib/api';
import { loadPlayers } from '../lib/data';
import type { Player, StatCategory } from '../lib/types';
import { METRIC_BY_KEY, RADAR_AXES, metricValue, CATEGORIES } from '../lib/metrics';
import { CompareSlot } from '../components/compare/CompareSlot';
import { CompareGrid } from '../components/compare/CompareGrid';
import { CompareBars } from '../components/compare/CompareBars';
import { RadarChart, type RadarSeries } from '../components/profile/RadarChart';
import { RetroButton } from '../components/primitives/RetroButton';
import { useFilterStore } from '../store/filterStore';
import { RetroToggle } from '../components/primitives/RetroToggle';

const COLORS = ['#f5a623', '#00d4ff', '#39d353'];
const FILLS = ['rgba(245,166,35,0.14)', 'rgba(0,212,255,0.14)', 'rgba(57,211,83,0.12)'];

export function Compare() {
  const [params, setParams] = useSearchParams();
  const per90 = useFilterStore((s) => s.per90);
  const setPer90 = useFilterStore((s) => s.setPer90);
  const [barCat, setBarCat] = useState<StatCategory>('attacking');

  const { data: players } = useQuery({ queryKey: ['allPlayers'], queryFn: () => loadPlayers() });
  const { data: radarIdx } = useQuery({ queryKey: ['radarIndex'], queryFn: () => getRadarIndex([...RADAR_AXES]) });

  const ids = useMemo(() => (params.get('ids') ? params.get('ids')!.split(',').filter(Boolean) : []), [params]);
  const selected: (Player | undefined)[] = useMemo(() => {
    const arr: (Player | undefined)[] = ids.map((k) => players?.find((p) => p.key === k));
    while (arr.length < 3) arr.push(undefined);
    return arr.slice(0, 3);
  }, [ids, players]);

  const setIds = (next: string[]) => {
    if (next.length) setParams({ ids: next.join(',') });
    else setParams({});
  };
  const pick = (slot: number, p: Player) => {
    const next = [...ids];
    next[slot] = p.key;
    setIds(next.filter(Boolean));
  };
  const remove = (slot: number) => {
    const present = selected.filter(Boolean) as Player[];
    const next = present.filter((_, i) => i !== slot).map((p) => p.key);
    setIds(next);
  };

  const chosen = selected.filter(Boolean) as Player[];

  const radarSeries: RadarSeries[] = useMemo(() => {
    if (!radarIdx) return [];
    return chosen.map((p, i) => ({
      color: COLORS[i],
      fill: FILLS[i],
      values: RADAR_AXES.map((k) => radarIdx.pct(k, metricValue(METRIC_BY_KEY[k], p, true), true)),
    }));
  }, [chosen, radarIdx]);

  const axisLabels = RADAR_AXES.map((k) => METRIC_BY_KEY[k].label);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
        <h2 className="label" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>Compare Players</h2>
        <div style={{ marginLeft: 'auto', width: 150 }}>
          <RetroToggle on={per90} onChange={setPer90} label="Per 90" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
        {[0, 1, 2].map((i) => (
          <CompareSlot
            key={i}
            player={selected[i]}
            color={COLORS[i]}
            onPick={(p) => pick(i, p)}
            onRemove={() => remove(i)}
          />
        ))}
      </div>

      {chosen.length === 0 ? (
        <div className="mono" style={{ color: 'var(--color-text-muted)', fontSize: 13, padding: 40, textAlign: 'center' }}>
          Add up to three players to compare their shapes and stats side by side.
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="panel" style={{ padding: 18, width: 380, flexShrink: 0 }}>
            <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>Overlaid Radar · per 90 percentile</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart axes={axisLabels} series={radarSeries} size={320} />
            </div>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8 }}>
              {chosen.map((p, i) => (
                <span key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  <span style={{ width: 9, height: 9, background: COLORS[i] }} /> {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 18, flex: 1, minWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Grouped Bars {per90 ? '· per 90' : ''}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                {CATEGORIES.map((c) => (
                  <RetroButton key={c.key} active={barCat === c.key} onClick={() => setBarCat(c.key)}>{c.label}</RetroButton>
                ))}
              </div>
            </div>
            <CompareBars players={chosen} colors={COLORS} category={barCat} per90={per90} />
          </div>

          <div className="panel" style={{ padding: 18, width: '100%' }}>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div className="label" style={{ flex: 1, fontSize: 11, color: 'var(--color-text-muted)' }}>Full Stat Comparison {per90 ? '· per 90' : '· season totals'}</div>
              {chosen.map((p, i) => (
                <span key={p.key} className="label" style={{ width: 92, textAlign: 'right', fontSize: 10, color: COLORS[i] }}>{p.name.split(' ').slice(-1)[0]}</span>
              ))}
            </div>
            <CompareGrid players={chosen} colors={COLORS} per90={per90} />
          </div>
        </div>
      )}
    </div>
  );
}
