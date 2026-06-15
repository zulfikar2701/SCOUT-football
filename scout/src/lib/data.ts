import type { LeagueKey, MatchLogEntry, Player, PositionGroup, RawPlayer } from './types';
import { DISPLAY_TO_KEY, POS_NAME_TO_GROUP } from './constants';

const base = import.meta.env.BASE_URL || '/';
const url = (p: string) => `${base}${p}`.replace(/\/{2,}/g, '/');

let playersCache: Player[] | null = null;
let playersPromise: Promise<Player[]> | null = null;
let matchLogCache: Record<string, MatchLogEntry[]> | null = null;
let matchLogPromise: Promise<Record<string, MatchLogEntry[]>> | null = null;

function enrich(r: RawPlayer): Player {
  const leagueKey: LeagueKey = DISPLAY_TO_KEY[r.league] ?? 'epl';
  const posGroup: PositionGroup = POS_NAME_TO_GROUP[r.pos] ?? '?';
  return { ...r, key: `${r.id}-${leagueKey}`, leagueKey, posGroup };
}

export function loadPlayers(): Promise<Player[]> {
  if (playersCache) return Promise.resolve(playersCache);
  if (!playersPromise) {
    playersPromise = fetch(url('players.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`players.json ${res.status}`);
        return res.json() as Promise<RawPlayer[]>;
      })
      .then((rows) => {
        playersCache = rows.map(enrich);
        return playersCache;
      });
  }
  return playersPromise;
}

export function loadMatchLogs(): Promise<Record<string, MatchLogEntry[]>> {
  if (matchLogCache) return Promise.resolve(matchLogCache);
  if (!matchLogPromise) {
    matchLogPromise = fetch(url('matchlog.json'))
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, MatchLogEntry[]>) => {
        matchLogCache = data;
        return data;
      })
      .catch(() => ({}) as Record<string, MatchLogEntry[]>);
  }
  return matchLogPromise;
}

export function peekPlayers(): Player[] | null {
  return playersCache;
}
