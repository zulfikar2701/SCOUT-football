import Fuse from 'fuse.js';
import type {
  FIFAMatch,
  FIFATeam,
  FIFAPlayer,
  WCPlayerAgg,
  WCMatchesFilter,
  WCPlayersFilter,
  TimelineEntry,
} from './types';
import {
  loadWCTeams,
  loadWCMatches,
  loadWCPlayersAgg,
  loadWCMatchDetail,
} from './data';

/* ---------- Match helpers ---------- */
export function formatMatchTime(dt: string): string {
  const d = new Date(dt);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function teamName(m: FIFAMatch, side: 'home' | 'away'): string {
  if (side === 'home') {
    return m.home_team?.name ?? m.home_team_source?.description ?? 'TBD';
  }
  return m.away_team?.name ?? m.away_team_source?.description ?? 'TBD';
}

export function teamAbbr(m: FIFAMatch, side: 'home' | 'away'): string {
  if (side === 'home') {
    return m.home_team?.abbreviation ?? m.home_team?.country_code ?? m.home_team_source?.placeholder ?? 'TBD';
  }
  return m.away_team?.abbreviation ?? m.away_team?.country_code ?? m.away_team_source?.placeholder ?? 'TBD';
}

export function matchScoreLine(m: FIFAMatch): string {
  if (m.status === 'scheduled') return 'v';
  const h = m.home_score ?? 0;
  const a = m.away_score ?? 0;
  const hp = m.home_score_penalties;
  const ap = m.away_score_penalties;
  if (hp != null && ap != null) return `${h}–${a} (${hp}–${ap})`;
  return `${h}–${a}`;
}

export function matchStatusLabel(status: string): string {
  switch (status) {
    case 'in_progress': return 'LIVE';
    case 'completed': return 'FT';
    case 'scheduled': return 'UPCOMING';
    case 'postponed': return 'PPD';
    case 'cancelled': return 'CANC';
    default: return status.toUpperCase();
  }
}

export function matchStatusColor(status: string): string {
  switch (status) {
    case 'in_progress': return 'var(--color-accent-green)';
    case 'completed': return 'var(--color-text-muted)';
    case 'scheduled': return 'var(--color-accent-cyan)';
    case 'postponed': return 'var(--color-accent-amber)';
    case 'cancelled': return 'var(--color-accent-red)';
    default: return 'var(--color-text-muted)';
  }
}

/* ---------- Matches list ---------- */
export async function listMatches(filter: WCMatchesFilter): Promise<FIFAMatch[]> {
  const all = await loadWCMatches();
  return all.filter((m) => {
    if (filter.stage && m.stage?.name !== filter.stage) return false;
    if (filter.group && m.group?.name !== filter.group) return false;
    if (filter.team) {
      const involved = m.home_team?.id === filter.team || m.away_team?.id === filter.team;
      if (!involved) return false;
    }
    if (filter.status && m.status !== filter.status) return false;
    if (filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      const h = teamName(m, 'home').toLowerCase();
      const a = teamName(m, 'away').toLowerCase();
      if (!h.includes(q) && !a.includes(q)) return false;
    }
    return true;
  });
}

export async function getMatch(id: number): Promise<FIFAMatch | undefined> {
  const all = await loadWCMatches();
  return all.find((m) => m.id === id);
}

/* ---------- Timeline ---------- */
export async function getMatchTimeline(matchId: number): Promise<TimelineEntry[]> {
  const bundle = await loadWCMatchDetail(matchId);
  const entries: TimelineEntry[] = [];

  // Events
  const events = bundle.events?.data ?? [];
  for (const e of events) {
    entries.push({
      time_minute: e.time_minute ?? 0,
      added_time: e.added_time,
      period: e.period,
      type: 'event',
      description: buildEventDescription(e),
      is_home: e.is_home,
      home_score: e.home_score,
      away_score: e.away_score,
      data: e,
    });
  }

  // Shots
  const shots = bundle.shots?.data ?? [];
  for (const s of shots) {
    entries.push({
      time_minute: s.time_minute,
      added_time: s.added_time,
      period: null,
      type: 'shot',
      description: buildShotDescription(s),
      is_home: s.is_home,
      home_score: null,
      away_score: null,
      data: s,
    });
  }

  entries.sort((a, b) => {
    if (a.time_minute !== b.time_minute) return a.time_minute - b.time_minute;
    return (a.added_time ?? 0) - (b.added_time ?? 0);
  });

  return entries;
}

function buildEventDescription(e: { incident_type: string; player: FIFAPlayer | null; assist_player: FIFAPlayer | null; player_in: FIFAPlayer | null; player_out: FIFAPlayer | null; reason: string | null }): string {
  const pn = (player: FIFAPlayer | null) => player?.short_name ?? player?.name ?? 'Unknown';
  switch (e.incident_type) {
    case 'goal': return `Goal — ${pn(e.player)}${e.assist_player ? ` (assist: ${pn(e.assist_player)})` : ''}`;
    case 'card': return `Card — ${pn(e.player)}${e.reason ? ` (${e.reason})` : ''}`;
    case 'substitution': return `Sub — ${pn(e.player_out)} off, ${pn(e.player_in)} on`;
    case 'period': return e.reason ?? 'Period';
    case 'injuryTime': return e.reason ?? 'Injury time';
    case 'penaltyShootout': return e.reason ?? 'Penalty';
    default: return e.reason ?? e.incident_type;
  }
}

function buildShotDescription(s: { shot_type: string; player_id: number; xg: number | null }): string {
  return `Shot (${s.shot_type}) — xG ${s.xg?.toFixed(2) ?? '–'}`;
}

/* ---------- Players ---------- */
export async function listPlayers(filter: WCPlayersFilter): Promise<WCPlayerAgg[]> {
  const all = await loadWCPlayersAgg();
  const now = new Date();
  return all.filter((p) => {
    if (filter.position && p.player.position !== filter.position) return false;
    if (filter.team && p.team_id !== filter.team) return false;
    if (p.player.date_of_birth) {
      const dob = new Date(p.player.date_of_birth);
      const age = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (age < filter.ageMin || age > filter.ageMax) return false;
    }
    if (filter.search.trim()) {
      const q = filter.search.trim().toLowerCase();
      if (!p.player.name.toLowerCase().includes(q) && !(p.team_abbreviation?.toLowerCase().includes(q) ?? false)) return false;
    }
    return true;
  }).sort((a, b) => {
    const va = (a as unknown as Record<string, number | string>)[filter.sortBy];
    const vb = (b as unknown as Record<string, number | string>)[filter.sortBy];
    if (typeof va === 'number' && typeof vb === 'number') {
      return filter.sortDir === 'asc' ? va - vb : vb - va;
    }
    if (typeof va === 'string' && typeof vb === 'string') {
      return filter.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return 0;
  });
}

export async function getPlayerProfile(id: number): Promise<WCPlayerAgg | undefined> {
  const all = await loadWCPlayersAgg();
  return all.find((p) => p.player.id === id);
}

/* ---------- Search ---------- */
let fusePlayers: Fuse<WCPlayerAgg> | null = null;
export async function searchWCPlayers(q: string, limit = 40): Promise<WCPlayerAgg[]> {
  const all = await loadWCPlayersAgg();
  if (!fusePlayers) {
    fusePlayers = new Fuse(all, { keys: ['player.name', 'team_abbreviation'], threshold: 0.34, ignoreLocation: true });
  }
  if (!q.trim()) return [];
  return fusePlayers.search(q, { limit }).map((r) => r.item);
}

/* ---------- Teams map ---------- */
let teamMapCache: Record<number, FIFATeam> | null = null;
export async function getTeamMap(): Promise<Record<number, FIFATeam>> {
  if (teamMapCache) return teamMapCache;
  const teams = await loadWCTeams();
  teamMapCache = {};
  for (const t of teams) teamMapCache[t.id] = t;
  return teamMapCache;
}
