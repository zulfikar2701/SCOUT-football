import type { Player, StatCategory } from './types';

// A metric kind controls per-90 behaviour and formatting.
//  - count: a tally that can be normalised per-90 when the toggle is on
//  - rate:  an average / ratio / percentage — never per-90'd
//  - delta: a signed difference (e.g. Goals − xG) — never per-90'd
export type MetricKind = 'count' | 'rate' | 'delta';

export interface MetricDef {
  key: string;
  label: string; // column header (short)
  full: string; // full descriptive name
  category: StatCategory;
  kind: MetricKind;
  decimals: number;
  // raw season value for the player
  raw: (p: Player) => number;
}

const div = (a: number, b: number) => (b > 0 ? a / b : 0);

export const METRICS: MetricDef[] = [
  // GENERAL
  { key: 'rating', label: 'Rating', full: 'Average Match Rating', category: 'general', kind: 'rate', decimals: 2, raw: (p) => p.rating ?? 0 },
  { key: 'goals', label: 'Goals', full: 'Goals', category: 'general', kind: 'count', decimals: 0, raw: (p) => p.goals },
  { key: 'assists', label: 'Assists', full: 'Assists', category: 'general', kind: 'count', decimals: 0, raw: (p) => p.assists },
  { key: 'ga', label: 'G+A', full: 'Goals + Assists', category: 'general', kind: 'count', decimals: 0, raw: (p) => p.goals + p.assists },
  { key: 'yellow', label: 'Yel', full: 'Yellow Cards', category: 'general', kind: 'count', decimals: 0, raw: (p) => p.yellow },
  { key: 'red', label: 'Red', full: 'Red Cards', category: 'general', kind: 'count', decimals: 0, raw: (p) => p.red },

  // ATTACKING
  { key: 'shots', label: 'Shots', full: 'Shots', category: 'attacking', kind: 'count', decimals: 0, raw: (p) => p.shots },
  { key: 'shots_on_t', label: 'SoT', full: 'Shots on Target', category: 'attacking', kind: 'count', decimals: 0, raw: (p) => p.shots_on_t },
  { key: 'shot_acc', label: 'Shot%', full: 'Shot Accuracy %', category: 'attacking', kind: 'rate', decimals: 0, raw: (p) => div(p.shots_on_t, p.shots) * 100 },
  { key: 'xg', label: 'xG', full: 'Expected Goals', category: 'attacking', kind: 'count', decimals: 1, raw: (p) => p.xg },
  { key: 'xg_per_shot', label: 'xG/Sh', full: 'xG per Shot', category: 'attacking', kind: 'rate', decimals: 2, raw: (p) => div(p.xg, p.shots) },
  { key: 'vs_xg', label: 'vs xG', full: 'Goals vs xG', category: 'attacking', kind: 'delta', decimals: 1, raw: (p) => p.goals - p.xg },

  // CREATING
  { key: 'key_passes', label: 'KeyP', full: 'Key Passes', category: 'creating', kind: 'count', decimals: 0, raw: (p) => p.key_passes },
  { key: 'chances', label: 'Chances', full: 'Big Chances Created', category: 'creating', kind: 'count', decimals: 0, raw: (p) => p.big_chances_created },
  { key: 'xa', label: 'xA', full: 'Expected Assists', category: 'creating', kind: 'count', decimals: 1, raw: (p) => p.xa },
  { key: 'vs_xa', label: 'vs xA', full: 'Assists vs xA', category: 'creating', kind: 'delta', decimals: 1, raw: (p) => p.assists - p.xa },

  // DEFENDING
  { key: 'tackles', label: 'Tkl', full: 'Tackles', category: 'defending', kind: 'count', decimals: 0, raw: (p) => p.tackles },
  { key: 'interceptions', label: 'Int', full: 'Interceptions', category: 'defending', kind: 'count', decimals: 0, raw: (p) => p.interceptions },
  { key: 'aerials_won', label: 'Aer', full: 'Aerials Won', category: 'defending', kind: 'count', decimals: 0, raw: (p) => p.aerials_won },
  { key: 'clearances', label: 'Clr', full: 'Clearances', category: 'defending', kind: 'count', decimals: 0, raw: (p) => p.clearances },
  { key: 'blocked_shots', label: 'Blk', full: 'Blocks', category: 'defending', kind: 'count', decimals: 0, raw: (p) => p.blocked_shots },
];

export const METRIC_BY_KEY: Record<string, MetricDef> = Object.fromEntries(
  METRICS.map((m) => [m.key, m]),
);

export const CATEGORY_METRICS: Record<StatCategory, MetricDef[]> = {
  general: METRICS.filter((m) => m.category === 'general'),
  attacking: METRICS.filter((m) => m.category === 'attacking'),
  creating: METRICS.filter((m) => m.category === 'creating'),
  defending: METRICS.filter((m) => m.category === 'defending'),
};

export const CATEGORIES: { key: StatCategory; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'attacking', label: 'Attacking' },
  { key: 'creating', label: 'Creating' },
  { key: 'defending', label: 'Defending' },
];

// Metric value with optional per-90 normalisation applied.
export function metricValue(m: MetricDef, p: Player, per90: boolean): number {
  const v = m.raw(p);
  if (per90 && m.kind === 'count') {
    return p.minutes > 0 ? (v / p.minutes) * 90 : 0;
  }
  return v;
}

// Does this metric show a "/90" suffix in the given mode?
export function isPer90Active(m: MetricDef, per90: boolean): boolean {
  return per90 && m.kind === 'count';
}

// Cards: lower is better. Everything else higher is better.
export function higherIsBetter(key: string): boolean {
  return key !== 'yellow' && key !== 'red';
}

// 8 radar axes per §9.4.3 (all per-90, percentile-normalised)
export const RADAR_AXES = [
  'goals',
  'assists',
  'xg',
  'xa',
  'chances',
  'tackles',
  'interceptions',
  'aerials_won',
] as const;
