// Client-side data provider mirroring the spec's REST API (§8).
// The dataset is already aggregated to ~3.1k per-player season rows, so it is
// served and queried entirely client-side for instant interaction. The same
// function signatures map 1:1 to the FastAPI endpoints in /backend.
import Fuse from 'fuse.js';
import type { LeagueKey, MatchLogEntry, Player, PlayerFilters, PositionGroup } from './types';
import { loadMatchLogs, loadPlayers, peekPlayers } from './data';
import { METRIC_BY_KEY, metricValue, higherIsBetter } from './metrics';
import { PercentileIndex } from './percentiles';
import { LEAGUES } from './constants';

export interface PlayersResult {
  rows: Player[];
  total: number;
}

function matchesFilters(p: Player, f: PlayerFilters): boolean {
  if (f.leagues.length && !f.leagues.includes(p.leagueKey)) return false;
  if (f.positions.length && !f.positions.includes(p.posGroup)) return false;
  const age = p.age ?? -1;
  if (age >= 0 && (age < f.ageMin || age > f.ageMax)) return false;
  if (p.matches < f.minApps) return false;
  if (f.search.trim()) {
    const q = f.search.trim().toLowerCase();
    if (!p.name.toLowerCase().includes(q) && !p.team.toLowerCase().includes(q)) return false;
  }
  return true;
}

// Synchronous count of players matching the current filters (ignoring search),
// used by the status bar so the summary is accurate on every route.
export function countPlayersSync(f: PlayerFilters): number | null {
  const all = peekPlayers();
  if (!all) return null;
  return all.filter((p) => matchesFilters(p, { ...f, search: '' })).length;
}

export async function queryPlayers(f: PlayerFilters): Promise<PlayersResult> {
  const all = await loadPlayers();
  const rows = all.filter((p) => matchesFilters(p, f));
  const m = METRIC_BY_KEY[f.sortBy];
  if (m) {
    const dir = f.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => (metricValue(m, a, f.per90) - metricValue(m, b, f.per90)) * dir);
  } else if (f.sortBy === 'age') {
    const dir = f.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => ((a.age ?? 0) - (b.age ?? 0)) * dir);
  } else if (f.sortBy === 'matches' || f.sortBy === 'minutes') {
    const dir = f.sortDir === 'asc' ? 1 : -1;
    const k = f.sortBy as 'matches' | 'minutes';
    rows.sort((a, b) => (a[k] - b[k]) * dir);
  } else if (f.sortBy === 'name') {
    const dir = f.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => a.name.localeCompare(b.name) * dir);
  }
  return { rows, total: rows.length };
}

// Build a percentile index over a given population for a set of metric keys,
// in the current per90 mode.
export function buildPercentileIndex(
  population: Player[],
  metricKeys: string[],
  per90: boolean,
): PercentileIndex {
  const rows = population.map((p) => {
    const o: Record<string, number> = {};
    for (const k of metricKeys) {
      const m = METRIC_BY_KEY[k];
      if (m) o[k] = metricValue(m, p, per90);
    }
    return o;
  });
  return new PercentileIndex(rows, metricKeys);
}

export async function getPlayer(key: string): Promise<Player | undefined> {
  const all = await loadPlayers();
  return all.find((p) => p.key === key);
}

export async function getCompare(keys: string[]): Promise<Player[]> {
  const all = await loadPlayers();
  return keys.map((k) => all.find((p) => p.key === k)).filter((p): p is Player => !!p);
}

export async function getMatchLog(key: string): Promise<MatchLogEntry[]> {
  const logs = await loadMatchLogs();
  // matchlog.json is keyed by `${id}-${DisplayName}`; key here is `${id}-${leagueKey}`
  const all = await loadPlayers();
  const p = all.find((x) => x.key === key);
  if (!p) return [];
  return logs[`${p.id}-${p.league}`] ?? [];
}

export interface ScatterPoint {
  key: string;
  name: string;
  team: string;
  pos: PositionGroup;
  league: LeagueKey;
  x: number;
  y: number;
  size: number;
}

export async function getScatter(
  xMetric: string,
  yMetric: string,
  sizeKey: 'matches' | 'minutes' | 'none',
  f: PlayerFilters,
): Promise<ScatterPoint[]> {
  const all = await loadPlayers();
  const mx = METRIC_BY_KEY[xMetric];
  const my = METRIC_BY_KEY[yMetric];
  if (!mx || !my) return [];
  return all
    .filter((p) => matchesFilters(p, { ...f, search: '' }))
    .map((p) => ({
      key: p.key,
      name: p.name,
      team: p.team,
      pos: p.posGroup,
      league: p.leagueKey,
      x: metricValue(mx, p, f.per90),
      y: metricValue(my, p, f.per90),
      size: sizeKey === 'none' ? 1 : p[sizeKey],
    }));
}

let fuse: Fuse<Player> | null = null;
export async function searchPlayers(q: string, limit = 60): Promise<Player[]> {
  const all = await loadPlayers();
  if (!fuse) {
    fuse = new Fuse(all, { keys: ['name', 'team'], threshold: 0.34, ignoreLocation: true });
  }
  if (!q.trim()) return [];
  return fuse.search(q, { limit }).map((r) => r.item);
}

// Radar percentile index over the full dataset (always per-90) for the 8 axes.
let radarIndexCache: PercentileIndex | null = null;
export async function getRadarIndex(axisKeys: string[]): Promise<PercentileIndex> {
  if (radarIndexCache) return radarIndexCache;
  const all = await loadPlayers();
  radarIndexCache = buildPercentileIndex(all, axisKeys, true);
  return radarIndexCache;
}

export async function metaLeagues(): Promise<{ key: LeagueKey; display: string; count: number }[]> {
  const all = await loadPlayers();
  return LEAGUES.map((l) => ({
    key: l.key,
    display: l.display,
    count: all.filter((p) => p.leagueKey === l.key).length,
  }));
}

export { higherIsBetter };
