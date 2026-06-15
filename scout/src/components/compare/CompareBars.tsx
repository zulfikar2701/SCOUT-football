import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { Player } from '../../lib/types';
import { CATEGORY_METRICS, metricValue } from '../../lib/metrics';
import type { StatCategory } from '../../lib/types';

export function CompareBars({ players, colors, category, per90 }: { players: Player[]; colors: string[]; category: StatCategory; per90: boolean }) {
  const metrics = CATEGORY_METRICS[category];
  const data = metrics.map((m) => {
    const row: Record<string, number | string> = { metric: m.label };
    players.forEach((p, i) => {
      row[`p${i}`] = Number(metricValue(m, p, per90).toFixed(2));
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="2 3" stroke="var(--color-border-dim)" vertical={false} />
        <XAxis dataKey="metric" tick={{ fill: 'var(--color-text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="var(--color-border-mid)" />
        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="var(--color-border-mid)" />
        <Tooltip
          contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-hi)', fontSize: 12, fontFamily: 'JetBrains Mono' }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
        {players.map((p, i) => (
          <Bar key={i} dataKey={`p${i}`} name={p.name} fill={colors[i]} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
