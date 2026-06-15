import type { LeagueKey, PositionGroup } from './types';

export const SEASON_LABEL = '2025/26';

export interface LeagueDef {
  key: LeagueKey;
  display: string; // matches players.json league field
  name: string; // long name
  country: string;
}

export const LEAGUES: LeagueDef[] = [
  { key: 'epl', display: 'EPL', name: 'Premier League', country: 'England' },
  { key: 'laliga', display: 'La Liga', name: 'La Liga', country: 'Spain' },
  { key: 'bundesliga', display: 'Bundesliga', name: 'Bundesliga', country: 'Germany' },
  { key: 'seriea', display: 'Serie A', name: 'Serie A', country: 'Italy' },
  { key: 'ligue1', display: 'Ligue 1', name: 'Ligue 1', country: 'France' },
  { key: 'ucl', display: 'UCL', name: 'Champions League', country: 'Europe' },
];

export const DISPLAY_TO_KEY: Record<string, LeagueKey> = Object.fromEntries(
  LEAGUES.map((l) => [l.display, l.key]),
) as Record<string, LeagueKey>;

export const KEY_TO_LEAGUE: Record<LeagueKey, LeagueDef> = Object.fromEntries(
  LEAGUES.map((l) => [l.key, l]),
) as Record<LeagueKey, LeagueDef>;

// Stripe colours for the 2-colour ISO rectangle flag badges (§4.2)
export const LEAGUE_FLAGS: Record<LeagueKey, { a: string; b: string; label: string }> = {
  epl: { a: '#ffffff', b: '#cf142b', label: 'EN' },
  laliga: { a: '#c60b1e', b: '#ffc400', label: 'ES' },
  bundesliga: { a: '#000000', b: '#dd0000', label: 'DE' },
  seriea: { a: '#009246', b: '#ce2b37', label: 'IT' },
  ligue1: { a: '#0055a4', b: '#ef4135', label: 'FR' },
  ucl: { a: '#0a1a4f', b: '#f5d400', label: 'EU' },
};

export const POSITIONS: { group: PositionGroup; label: string; long: string }[] = [
  { group: 'GK', label: 'GK', long: 'Goalkeeper' },
  { group: 'DF', label: 'DF', long: 'Defender' },
  { group: 'MF', label: 'MF', long: 'Midfielder' },
  { group: 'FW', label: 'FW', long: 'Forward' },
];

export const POS_NAME_TO_GROUP: Record<string, PositionGroup> = {
  Goalkeeper: 'GK',
  Defender: 'DF',
  Midfielder: 'MF',
  Forward: 'FW',
};

// Position badge colours (§4.3)
export const POS_BADGE: Record<PositionGroup, { bg: string; fg: string }> = {
  GK: { bg: '#1a3a2a', fg: 'var(--color-accent-green)' },
  DF: { bg: '#1a2240', fg: 'var(--color-accent-cyan)' },
  MF: { bg: '#2a1a10', fg: 'var(--color-accent-amber)' },
  FW: { bg: '#3a1010', fg: 'var(--color-accent-red)' },
  '?': { bg: 'var(--color-bg-elevated)', fg: 'var(--color-text-muted)' },
};

export const MIN_APPS_OPTIONS = [5, 10, 15, 30];
export const AGE_FLOOR = 15;
export const AGE_CEIL = 40;

export const X_URL = 'https://x.com/zulfikarsenal';
