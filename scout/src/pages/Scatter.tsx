import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScatter } from '../lib/api';
import { METRICS, METRIC_BY_KEY, isPer90Active } from '../lib/metrics';
import { useFilterStore } from '../store/filterStore';
import { ScatterPlot } from '../components/scatter/ScatterPlot';
import { RetroSelect } from '../components/primitives/RetroSelect';
import { RetroToggle } from '../components/primitives/RetroToggle';
import { POSITIONS, POS_BADGE } from '../lib/constants';

const opts = METRICS.map((m) => ({ value: m.key, label: m.full }));

export function Scatter() {
  const navigate = useNavigate();
  const filters = useFilterStore();
  const { per90, setPer90 } = filters;
  const [xKey, setXKey] = useState('xg');
  const [yKey, setYKey] = useState('goals');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: points } = useQuery({
    queryKey: ['scatter', xKey, yKey, filters.leagues, filters.positions, filters.ageMin, filters.ageMax, filters.minApps, per90],
    queryFn: () => getScatter(xKey, yKey, 'none', filters),
  });

  const xm = METRIC_BY_KEY[xKey];
  const ym = METRIC_BY_KEY[yKey];
  const xLabel = xm.full + (isPer90Active(xm, per90) ? ' /90' : '');
  const yLabel = ym.full + (isPer90Active(ym, per90) ? ' /90' : '');

  const selList = useMemo(() => (points ?? []).filter((p) => selected.has(p.key)), [points, selected]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
        <h2 className="label" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>Scatter Explorer</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="label" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>X</span>
          <RetroSelect value={xKey} options={opts} onChange={setXKey} ariaLabel="X axis metric" width={170} />
          <span className="label" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Y</span>
          <RetroSelect value={yKey} options={opts} onChange={setYKey} ariaLabel="Y axis metric" width={170} />
        </div>
        <div style={{ width: 130 }}>
          <RetroToggle on={per90} onChange={setPer90} label="Per 90" />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          {POSITIONS.map((p) => (
            <span key={p.group} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: POS_BADGE[p.group].fg }} /> {p.label}
            </span>
          ))}
        </div>
      </div>

      <div className="scatter-layout" style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="panel" style={{ padding: 16, minWidth: 0 }}>
          {points ? (
            <ScatterPlot
              points={points}
              xLabel={xLabel}
              yLabel={yLabel}
              onBrush={setSelected}
              onPick={(k) => navigate(`/players/${k}`)}
              selected={selected}
            />
          ) : (
            <div className="mono" style={{ padding: 40, color: 'var(--color-text-muted)' }}>Loading…</div>
          )}
          <div className="mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 6 }}>
            Drag to brush a region · click a point to open the profile · {points?.length ?? 0} players (current filters)
          </div>
        </div>

        <div className="panel" style={{ padding: 16, flexShrink: 0 }}>
          <div className="label" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Selection {selList.length ? `(${selList.length})` : ''}
          </div>
          {selList.length === 0 ? (
            <div className="mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Brush the plot to list players here.</div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {selList
                .sort((a, b) => b.y - a.y)
                .map((p) => (
                  <button
                    key={p.key}
                    onClick={() => navigate(`/players/${p.key}`)}
                    className="player-row"
                    style={{ display: 'flex', width: '100%', padding: '4px 6px', textAlign: 'left', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: POS_BADGE[p.pos].fg, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{p.x.toFixed(1)}/{p.y.toFixed(1)}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
