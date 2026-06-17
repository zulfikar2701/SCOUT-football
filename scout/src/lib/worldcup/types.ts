// World Cup 2026 TypeScript interfaces — mirror of FIFA OpenAPI schemas

export interface FIFAPlayer {
  id: number;
  name: string;
  short_name: string | null;
  position: string | null;
  date_of_birth: string | null;
  country_code: string | null;
  country_name: string | null;
  height_cm: number | null;
  jersey_number: string | null;
}

export interface FIFATeam {
  id: number;
  name: string;
  abbreviation: string | null;
  country_code: string | null;
  confederation: string | null;
}

export interface FIFAStadium {
  id: number;
  name: string;
  city: string | null;
  country: string | null;
  capacity: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface FIFAStage {
  id: number;
  name: string;
  order: number;
}

export interface FIFAGroup {
  id: number;
  name: string;
}

export interface FIFAMatchTeamSource {
  type: string;
  source_match_id: number | null;
  source_match_number: number | null;
  source_group_id: number | null;
  source_group_name: string | null;
  placeholder: string | null;
  description: string | null;
}

export interface FIFAMatch {
  id: number;
  match_number: number | null;
  datetime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  season: { id: number; year: number };
  stage: FIFAStage | null;
  group: FIFAGroup | null;
  stadium: FIFAStadium | null;
  home_team: FIFATeam | null;
  away_team: FIFATeam | null;
  home_team_source: FIFAMatchTeamSource | null;
  away_team_source: FIFAMatchTeamSource | null;
  home_score: number | null;
  away_score: number | null;
  home_score_penalties: number | null;
  away_score_penalties: number | null;
  first_half_home_score: number | null;
  first_half_away_score: number | null;
  second_half_home_score: number | null;
  second_half_away_score: number | null;
  extra_time_home_score: number | null;
  extra_time_away_score: number | null;
  has_extra_time: boolean | null;
  has_penalty_shootout: boolean | null;
  round_number: number | null;
  round_name: string | null;
  home_formation: string | null;
  away_formation: string | null;
  clock_display?: string | null;
  clock_seconds?: number | null;
}

export interface FIFAMatchEvent {
  id: number;
  match_id: number;
  incident_type: 'goal' | 'card' | 'substitution' | 'period' | 'injuryTime' | 'penaltyShootout';
  incident_class: string | null;
  time_minute: number | null;
  added_time: number | null;
  period: string | null;
  is_home: boolean | null;
  player: FIFAPlayer | null;
  assist_player: FIFAPlayer | null;
  player_in: FIFAPlayer | null;
  player_out: FIFAPlayer | null;
  home_score: number | null;
  away_score: number | null;
  shootout_sequence: number | null;
  shootout_description: string | null;
  rescinded: boolean | null;
  reason: string | null;
}

export interface FIFAMatchShot {
  id: number;
  match_id: number;
  player_id: number;
  team_id: number;
  is_home: boolean;
  shot_type: 'goal' | 'save' | 'miss' | 'block' | 'post';
  situation: string | null;
  body_part: string | null;
  goal_type: string | null;
  xg: number | null;
  xgot: number | null;
  player_x: number | null;
  player_y: number | null;
  goal_mouth_x: number | null;
  goal_mouth_y: number | null;
  block_x: number | null;
  block_y: number | null;
  time_minute: number;
  added_time: number | null;
  time_seconds: number | null;
}

export interface FIFAMatchMomentumPoint {
  match_id: number;
  minute: number;
  value: number;
}

export interface FIFAMatchBestPlayer {
  match_id: number;
  player_id: number;
  team_id: number;
  is_home: boolean;
  side_rank: number;
  is_man_of_match: boolean;
  rating: number | null;
  reason: string | null;
}

export interface FIFAMatchAvgPosition {
  match_id: number;
  player_id: number;
  team_id: number;
  is_home: boolean;
  avg_x: number;
  avg_y: number;
}

export interface FIFAMatchLineup {
  match_id: number;
  team_id: number;
  player: FIFAPlayer;
  is_starter: boolean;
  is_substitute: boolean;
  shirt_number: number | null;
  position: string | null;
  formation: string | null;
}

export interface FIFAMatchTeamForm {
  match_id: number;
  team_id: number;
  is_home: boolean;
  avg_rating: number | null;
  position: number | null;
  value: string | null;
}

export interface FIFAPlayerMatchStats {
  match_id: number;
  player_id: number;
  team_id: number;
  is_home: boolean;
  rating: number | null;
  minutes_played: number | null;
  expected_goals: number | null;
  expected_assists: number | null;
  goals: number | null;
  assists: number | null;
  shots_on_target: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  key_passes: number | null;
  long_balls_total: number | null;
  long_balls_accurate: number | null;
  crosses_total: number | null;
  crosses_accurate: number | null;
  dribbles_attempted: number | null;
  dribbles_completed: number | null;
  tackles: number | null;
  tackles_won: number | null;
  interceptions: number | null;
  clearances: number | null;
  blocked_shots: number | null;
  duels_won: number | null;
  duels_lost: number | null;
  aerial_duels_won: number | null;
  aerial_duels_lost: number | null;
  fouls_committed: number | null;
  was_fouled: number | null;
  touches: number | null;
  possession_lost: number | null;
  ball_recoveries: number | null;
  big_chances_created: number | null;
  big_chances_missed: number | null;
  saves: number | null;
  saves_inside_box: number | null;
  punches: number | null;
  high_claims: number | null;
}

export interface FIFATeamMatchStats {
  match_id: number;
  team_id: number;
  is_home: boolean;
  possession_pct: number | null;
  expected_goals: number | null;
  big_chances: number | null;
  big_chances_missed: number | null;
  shots_total: number | null;
  shots_on_target: number | null;
  shots_off_target: number | null;
  shots_blocked: number | null;
  shots_inside_box: number | null;
  shots_outside_box: number | null;
  hit_woodwork: number | null;
  corners: number | null;
  offsides: number | null;
  fouls: number | null;
  yellow_cards: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  passes_final_third: number | null;
  long_balls_total: number | null;
  long_balls_accurate: number | null;
  crosses_total: number | null;
  crosses_accurate: number | null;
  tackles: number | null;
  interceptions: number | null;
  clearances: number | null;
  saves: number | null;
  ground_duels_won: number | null;
  ground_duels_total: number | null;
  aerial_duels_won: number | null;
  aerial_duels_total: number | null;
  dribbles_completed: number | null;
  dribbles_total: number | null;
  throw_ins: number | null;
  goal_kicks: number | null;
  free_kicks: number | null;
}

export interface FIFARoster {
  season: { id: number; year: number };
  team_id: number;
  player: FIFAPlayer;
  position: string | null;
  appearances: number;
  starts: number;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  avg_rating: number | null;
}

export interface FIFAStanding {
  season: { id: number; year: number };
  team: FIFATeam;
  group: FIFAGroup;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

/* ---------- Aggregated / App-specific ---------- */

export interface MatchDetailBundle {
  events: { data: FIFAMatchEvent[] } | null;
  shots: { data: FIFAMatchShot[] } | null;
  momentum: { data: FIFAMatchMomentumPoint[] } | null;
  best_players: { data: FIFAMatchBestPlayer[] } | null;
  avg_positions: { data: FIFAMatchAvgPosition[] } | null;
  lineups: { data: FIFAMatchLineup[] } | null;
  team_form: { data: FIFAMatchTeamForm[] } | null;
  team_match_stats: { data: FIFATeamMatchStats[] } | null;
  player_match_stats: { data: FIFAPlayerMatchStats[] } | null;
}

export interface WCPlayerAgg {
  player: FIFAPlayer;
  team_id: number;
  team_abbreviation: string | null;
  age: number | null;
  appearances: number;
  starts: number;
  minutes_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  avg_rating: number | null;
  // Derived from summing player_match_stats
  expected_goals: number;
  expected_assists: number;
  shots_on_target: number;
  passes_total: number;
  passes_accurate: number;
  key_passes: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  duels_won: number;
  duels_lost: number;
  aerial_duels_won: number;
  aerial_duels_lost: number;
  fouls_committed: number;
  was_fouled: number;
  touches: number;
  possession_lost: number;
  ball_recoveries: number;
  big_chances_created: number;
  big_chances_missed: number;
  saves: number;
  saves_inside_box: number;
  dribbles_attempted: number;
  dribbles_completed: number;
  crosses_total: number;
  crosses_accurate: number;
  long_balls_total: number;
  long_balls_accurate: number;
  blocked_shots: number;
  punches: number;
  high_claims: number;
  // Per-match averages
  minutes_per_match: number;
  goals_per_match: number;
  assists_per_match: number;
  xg_per_match: number;
  xa_per_match: number;
  key_passes_per_match: number;
  shots_on_target_per_match: number;
  tackles_per_match: number;
  saves_per_match: number;
}

export type WCMatchesFilter = {
  stage: string | null;
  group: string | null;
  team: number | null;
  status: string | null;
  search: string;
};

export type WCPlayersFilter = {
  position: string | null;
  team: number | null;
  ageMin: number;
  ageMax: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
};

export type TimelineEntry = {
  time_minute: number;
  added_time: number | null;
  period: string | null;
  type: 'event' | 'shot';
  description: string;
  is_home: boolean | null;
  home_score: number | null;
  away_score: number | null;
  data: FIFAMatchEvent | FIFAMatchShot;
};
