# balldontlie — European Soccer scrape (for player profiles)

Data harvested from the balldontlie API across **6 European competitions**:
EPL, La Liga, Bundesliga, Serie A, Ligue 1, and the UEFA Champions League.

The collection is optimized for **building player profiles**: the centerpiece is
`player_match_stats` (per-player, per-match box score), which is **complete** for
every league. Match lineups were captured for recent matches until the premium
trial's match-detail access closed. Reference tables (matches, teams, standings,
players) round out the dataset.

## Layout

```
exports/
  <league>/
    player_match_stats.csv   # per-player, per-match stats  (CORE)
    match_lineups.csv        # starters/subs, position, jersey, minutes (recent matches)
    matches.csv              # one row per match: date, teams, score, season, status
    teams.csv                # current team reference
    standings.csv            # current standings
    *.jsonl                  # same data, newline-delimited JSON (lossless)
  players_master.csv         # de-duplicated player id -> name / bio (join key)
  MANIFEST.md                # exact record counts per league/endpoint
```

## How to build a player profile

`player_match_stats` rows are keyed by `player_id`, `match_id`, `team_id`.

1. **Names / bio:** join `player_match_stats.player_id` -> `players_master.id`
   (`display_name`, `first_name`, `last_name`, `position`, ...).
2. **Match context:** join `player_match_stats.match_id` -> `<league>/matches.csv`
   (`date`, `home_team`, `away_team`, `home_score`, `away_score`, `season`).
3. **Aggregate** per `player_id` across matches for career/season profiles, e.g.
   `goals`, `assists`, `minutes_played`, `rating`, `expected_goals` (xG),
   `expected_assists` (xA), `key_passes`, `passes_accurate`, `tackles`,
   `duels_won`, `touches`, etc. (~60 stat columns per row).

Example (pandas):

```python
import pandas as pd, glob
pms = pd.concat(pd.read_csv(f).assign(league=f.split('/')[-2])
                for f in glob.glob('exports/*/player_match_stats.csv'))
players = pd.read_csv('exports/players_master.csv').rename(columns={'id':'player_id'})
df = pms.merge(players[['player_id','display_name','position']], on='player_id', how='left')

profile = (df.groupby(['player_id','display_name'])
             .agg(matches=('match_id','nunique'),
                  goals=('goals','sum'), assists=('assists','sum'),
                  minutes=('minutes_played','sum'), avg_rating=('rating','mean'),
                  xg=('expected_goals','sum'), xa=('expected_assists','sum'))
             .reset_index().sort_values('goals', ascending=False))
```

## Notes / caveats

- The API trial began at **5 requests/min**, then lifted to **600/min**, then
  reverted to **5/min** when the premium trial closed. We captured all
  `player_match_stats` during the high-rate window.
- After the trial closed, deeper match-detail endpoints (events, shots, heatmaps,
  average positions, best players, team match stats, momentum, pregame forms)
  became tier-gated (HTTP 401) and could not be retrieved.
- `match_lineups` covers the most recent ~2,800 matches per league (recent-first).
- Some older `player_id`s in `player_match_stats` may lack a name in
  `players_master` if that player never appeared in a captured lineup or player
  list. Coverage of bulk player lists was still being collected at 5/min.
