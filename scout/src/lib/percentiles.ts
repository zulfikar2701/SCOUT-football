// Percentile maths + rating colour bands (§9.3.5, §3.1 rating scale)

export type RatingBand = 'elite' | 'great' | 'good' | 'average' | 'poor';

// Sort ascending once, then query.
export function sortedAsc(values: number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

// Fraction of the population a value is greater-than-or-equal to (0..1).
// Uses midpoint of the equal band for stability.
export function percentileOf(sorted: number[], v: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  let lo = 0;
  let hi = 0;
  for (let i = 0; i < n; i++) {
    if (sorted[i] < v) lo++;
    else if (sorted[i] === v) hi++;
  }
  return (lo + hi / 2) / n;
}

// Returns 0..1 percentile where 1 is "best". Inverts when lower is better.
export function rankPercentile(sorted: number[], v: number, higherBetter: boolean): number {
  const p = percentileOf(sorted, v);
  return higherBetter ? p : 1 - p;
}

export function bandFor(percentile: number): RatingBand {
  if (percentile >= 0.95) return 'elite';
  if (percentile >= 0.85) return 'great';
  if (percentile >= 0.65) return 'good';
  if (percentile >= 0.25) return 'average';
  return 'poor';
}

export const BAND_COLOR: Record<RatingBand, string> = {
  elite: 'var(--color-rating-elite)',
  great: 'var(--color-rating-great)',
  good: 'var(--color-rating-good)',
  average: 'var(--color-text-primary)',
  poor: 'var(--color-text-muted)',
};

// For attribute bars: a fill colour from percentile.
export function barColor(percentile: number): string {
  return BAND_COLOR[bandFor(percentile)];
}

// A precomputed percentile index for a set of metric keys across a population.
export class PercentileIndex {
  private sorted: Record<string, number[]> = {};

  constructor(rows: Record<string, number>[], keys: string[]) {
    for (const k of keys) {
      this.sorted[k] = sortedAsc(rows.map((r) => r[k] ?? 0));
    }
  }

  pct(key: string, value: number, higherBetter = true): number {
    const arr = this.sorted[key];
    if (!arr) return 0.5;
    return rankPercentile(arr, value, higherBetter);
  }
}
