import type {
  FIFAMatch,
  FIFATeam,
  FIFAStadium,
  FIFAStanding,
  FIFAPlayer,
  MatchDetailBundle,
  WCPlayerAgg,
} from './types';

const base = import.meta.env.BASE_URL || '/';
const url = (p: string) => `${base}worldcup/${p}`.replace(/\/{2,}/g, '/');

/* ---------- Caches ---------- */
let teamsCache: FIFATeam[] | null = null;
let teamsPromise: Promise<FIFATeam[]> | null = null;

let stadiumsCache: FIFAStadium[] | null = null;
let stadiumsPromise: Promise<FIFAStadium[]> | null = null;

let standingsCache: FIFAStanding[] | null = null;
let standingsPromise: Promise<FIFAStanding[]> | null = null;

let matchesCache: FIFAMatch[] | null = null;
let matchesPromise: Promise<FIFAMatch[]> | null = null;

let playersCache: FIFAPlayer[] | null = null;
let playersPromise: Promise<FIFAPlayer[]> | null = null;

let playersAggCache: WCPlayerAgg[] | null = null;
let playersAggPromise: Promise<WCPlayerAgg[]> | null = null;

const matchDetailCache: Record<number, MatchDetailBundle> = {};
const matchDetailPromise: Record<number, Promise<MatchDetailBundle>> = {};

/* ---------- Loaders ---------- */
export function loadWCTeams(): Promise<FIFATeam[]> {
  if (teamsCache) return Promise.resolve(teamsCache);
  if (!teamsPromise) {
    teamsPromise = fetch(url('teams.json'))
      .then((r) => { if (!r.ok) throw new Error(`teams.json ${r.status}`); return r.json(); })
      .then((d) => { teamsCache = d.data ?? d; return teamsCache!; });
  }
  return teamsPromise;
}

export function loadWCStadiums(): Promise<FIFAStadium[]> {
  if (stadiumsCache) return Promise.resolve(stadiumsCache);
  if (!stadiumsPromise) {
    stadiumsPromise = fetch(url('stadiums.json'))
      .then((r) => { if (!r.ok) throw new Error(`stadiums.json ${r.status}`); return r.json(); })
      .then((d) => { stadiumsCache = d.data ?? d; return stadiumsCache!; });
  }
  return stadiumsPromise;
}

export function loadWCStandings(): Promise<FIFAStanding[]> {
  if (standingsCache) return Promise.resolve(standingsCache);
  if (!standingsPromise) {
    standingsPromise = fetch(url('standings.json'))
      .then((r) => { if (!r.ok) throw new Error(`standings.json ${r.status}`); return r.json(); })
      .then((d) => { standingsCache = d.data ?? d; return standingsCache!; });
  }
  return standingsPromise;
}

export function loadWCMatches(): Promise<FIFAMatch[]> {
  if (matchesCache) return Promise.resolve(matchesCache);
  if (!matchesPromise) {
    matchesPromise = fetch(url('matches.json'))
      .then((r) => { if (!r.ok) throw new Error(`matches.json ${r.status}`); return r.json(); })
      .then((d) => { matchesCache = d.data ?? d; return matchesCache!; });
  }
  return matchesPromise;
}

export function loadWCPlayers(): Promise<FIFAPlayer[]> {
  if (playersCache) return Promise.resolve(playersCache);
  if (!playersPromise) {
    playersPromise = fetch(url('players.json'))
      .then((r) => { if (!r.ok) throw new Error(`players.json ${r.status}`); return r.json(); })
      .then((d) => { playersCache = d.data ?? d; return playersCache!; });
  }
  return playersPromise;
}

export function loadWCPlayersAgg(): Promise<WCPlayerAgg[]> {
  if (playersAggCache) return Promise.resolve(playersAggCache);
  if (!playersAggPromise) {
    playersAggPromise = fetch(url('players_agg.json'))
      .then((r) => { if (!r.ok) throw new Error(`players_agg.json ${r.status}`); return r.json(); })
      .then((d) => { playersAggCache = d.data ?? d; return playersAggCache!; });
  }
  return playersAggPromise;
}

export async function loadWCMatchDetail(matchId: number): Promise<MatchDetailBundle> {
  if (matchDetailCache[matchId]) return matchDetailCache[matchId];
  if (!matchDetailPromise[matchId]) {
    matchDetailPromise[matchId] = fetch(url(`matches/${matchId}.json`))
      .then((r) => { if (!r.ok) throw new Error(`match ${matchId} ${r.status}`); return r.json(); })
      .then((d) => { matchDetailCache[matchId] = d; return d; });
  }
  return matchDetailPromise[matchId];
}

/* ---------- Peek (sync) ---------- */
export function peekWCMatches(): FIFAMatch[] | null { return matchesCache; }
export function peekWCPlayersAgg(): WCPlayerAgg[] | null { return playersAggCache; }
