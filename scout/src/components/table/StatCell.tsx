import { BAND_COLOR, bandFor } from '../../lib/percentiles';
import { fmtNum, fmtSigned } from '../../lib/formatters';
import type { MetricDef } from '../../lib/metrics';

export function StatCell({ metric, value, percentile, width }: { metric: MetricDef; value: number; percentile: number; width: number }) {
  const color = BAND_COLOR[bandFor(percentile)];
  const text = metric.kind === 'delta' ? fmtSigned(value, metric.decimals) : fmtNum(value, metric.decimals);
  return (
    <div
      className="mono-bold"
      style={{
        width,
        flexShrink: 0,
        textAlign: 'right',
        padding: '0 10px',
        fontSize: 14,
        color,
        lineHeight: '34px',
      }}
    >
      {text}
    </div>
  );
}
