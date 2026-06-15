// Core domain types for SCOUT

export type LeagueKey = 'epl' | 'laliga' | 'bundesliga' | 'seriea' | 'ligue1' | 'ucl';
export type PositionGroup = 'GK' | 'DF' | 'MF' | 'FW' | '?';
export type StatCategory = 'general' | 'attacking' | 'creating' | 'defending';

// Shape of a row in players.json (per player, current season, per league)
export interface RawPlayer {
  id: number;
  name: string;
  league: string; // display name e.g. "EPL"
  pos: string; // "Forward" | "Midfielder" | "Defender" | "Goalkeeper" | "?"
  team: string;
  age: number | null;
  foot: string | null;
  nat: string | null;
  matches: number;
  minutes: number;
  rating: number | null;
  xa: number;
  key_passes: number;
  assists: number;
  big_chances_created: number;
  crosses_acc: number;
  goals: number;
  shots: number;
  shots_on_t: number;
  xg: number;
  dribbles: number;
  big_chances_missed: number;
  np_goals: number;
  pen_goals: number;
  header_goals: number;
  fk_goals: number;
  tackles: number;
  tackles_won: number;
  interceptions: number;
  clearances: number;
  blocked_shots: number;
  duels_won: number;
  aerials_won: number;
  recoveries: number;
  passes_acc: number;
  touches: number;
  yellow: number;
  red: number;
}

// Player enriched with a stable composite key + league key
export interface Player extends RawPlayer {
  key: string; // `${id}-${leagueKey}`
  leagueKey: LeagueKey;
  posGroup: PositionGroup;
}

export interface MatchLogEntry {
  date: string;
  opp: string;
  comp: string;
  venue: 'H' | 'A';
  score: string;
  mins: number;
  g: number;
  a: number;
  rating: number | null;
}

export interface PlayerFilters {
  leagues: LeagueKey[];
  positions: PositionGroup[];
  ageMin: number;
  ageMax: number;
  minApps: number;
  per90: boolean;
  search: string;
  category: StatCategory;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}
