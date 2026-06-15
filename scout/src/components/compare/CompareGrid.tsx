import type { Player, StatCategory } from '../../lib/types';
import { CATEGORIES, CATEGORY_METRICS, higherIsBetter, isPer90Active, metricValue } from '../../lib/metrics';
import { fmtNum, fmtSigned } from '../../lib/formatters';

export function CompareGrid({ players, colors, per90 }: { players: Player[]; colors: string[]; per90: boolean }) {
  const cats: StatCategory[] = CATEGORIES.map((c) => c.key);
  return (
    <div>
      {cats.map((cat) => (
        <div key={cat} style={{ marginBottom: 14 }}>
          <div className="label" style={{ fontSize: 10, color: 'var(--color-accent-amber)', marginBottom: 4 }}>
            {CATEGORIES.find((c) => c.key === cat)!.label}
          </div>
          {CATEGORY_METRICS[cat].map((m) => {
            const vals = players.map((p) => metricValue(m, p, per90));
            const best = higherIsBetter(m.key) ? Math.max(...vals) : Math.min(...vals);
            return (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--color-border-dim)' }}>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {m.full}{isPer90Active(m, per90) ? ' /90' : ''}
                </span>
                {vals.map((v, i) => {
                  const isBest = players.length > 1 && v === best;
                  const text = m.kind === 'delta' ? fmtSigned(v, m.decimals) : fmtNum(v, m.decimals);
                  return (
                    <span
                      key={i}
                      className="mono-bold"
                      style={{
                        width: 92,
                        textAlign: 'right',
                        fontSize: 13,
                        color: isBest ? colors[i] : 'var(--color-text-primary)',
                        fontWeight: isBest ? 700 : 400,
                      }}
                    >
                      {text}
                      {isBest && <span style={{ color: colors[i] }}> ◄</span>}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
