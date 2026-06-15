// Number display helpers

export function fmtNum(v: number, decimals: number): string {
  if (!isFinite(v)) return '–';
  return v.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtSigned(v: number, decimals: number): string {
  const s = fmtNum(Math.abs(v), decimals);
  if (v > 0) return `+${s}`;
  if (v < 0) return `-${s}`;
  return s;
}

export function fmtPct(p: number): string {
  return `${Math.round(p * 100)}%`;
}

export function fmtMinutes(m: number): string {
  return `${Math.round(m).toLocaleString('en-GB')}'`;
}

// "Better than 87% of players"
export function betterThan(p: number): string {
  return `Better than ${Math.round(p * 100)}% of players`;
}

export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
