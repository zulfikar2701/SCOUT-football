import type { Player } from '../../lib/types';
import { CATEGORIES, CATEGORY_METRICS, higherIsBetter, isPer90Active, metricValue } from '../../lib/metrics';
import type { PercentileIndex } from '../../lib/percentiles';
import { StatBar } from '../primitives/StatBar';
import { fmtNum, fmtSigned } from '../../lib/formatters';

export function StatAttributeGrid({ player, index, per90 }: { player: Player; index: PercentileIndex; per90: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
      {CATEGORIES.map((cat) => (
        <div key={cat.key} style={{ marginBottom: 18 }}>
          <div className="label" style={{ fontSize: 10, color: 'var(--color-accent-amber)', marginBottom: 8, borderBottom: '1px solid var(--color-border-dim)', paddingBottom: 4 }}>
            {cat.label}
          </div>
          {CATEGORY_METRICS[cat.key].map((m, i) => {
            const v = metricValue(m, player, per90);
            const pct = index.pct(m.key, v, higherIsBetter(m.key));
            const text = m.kind === 'delta' ? fmtSigned(v, m.decimals) : fmtNum(v, m.decimals);
            return (
              <StatBar
                key={m.key}
                label={m.full + (isPer90Active(m, per90) ? ' /90' : '')}
                value={text}
                percentile={pct}
                delay={i * 40}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
