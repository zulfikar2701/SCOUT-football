# SCOUT — Context Handoff for Local Coding Agent

This document is a complete pickup guide for continuing SCOUT locally. Read it top to bottom before making changes.

---

## 1. What SCOUT is

SCOUT is a retro-styled, dark-mode-only web app for browsing, comparing, and visualizing
**Big 5 European league + UCL** football (soccer) player stats. Tagline: **"Big 5 · By the Numbers"**.

Design language follows `SCOUT_SPEC.md` (the authoritative 939-line spec). The aesthetic is a
composite of Championship Manager 01/02, Football Manager 2005–2010, and Winning Eleven/PES:
CRT scanlines, grid overlay, amber/cyan/green accents, monospace + display type.

Branding rule (hard requirement): **no "AI" / "intelligence" / adjacent wording anywhere**.
SCOUT branding only. The X link `https://x.com/zulfikarsenal` must stay in the header + footer.

---

## 2. Repo layout

Repo: `https://github.com/zulfikar2701/SCOUT-football` — default branch **`scout-website`**.

```
.
├── scout/                      # the web app (React 18 + Vite + TypeScript)
│   ├── public/
│   │   ├── players.json        # 3,145 player-season rows (aggregated, committed)
│   │   ├── matchlog.json       # per-player recent match histories (committed)
│   │   └── favicon.svg
│   ├── src/
│   │   ├── lib/                # data loading, metrics, percentiles, formatters, api
│   │   ├── store/              # zustand stores (filterStore, uiStore)
│   │   ├── components/         # primitives, shell, filters, table, profile, compare, scatter, search
│   │   ├── pages/             # Boot, Players, PlayerProfile, Compare, Scatter, SearchPage, NotFound
│   │   ├── styles/            # globals.css (design tokens), animations.css
│   │   ├── router.tsx          # createHashRouter
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── SCOUT_SPEC.md               # AUTHORITATIVE design + architecture spec — follow exactly
├── scrape.py                   # original scraper (v1 leagues)
├── scrape_new.py               # match_events + team_match_stats scraper (EPL v2 + others v1)
├── fetch_players.py            # bulk roster (player names/age/DOB) collector
├── aggregate_dashboard.py      # builds players.json from raw data/
├── aggregate_matchlog.py       # builds matchlog.json from raw data/
├── aggregate_teams.py          # builds teams aggregation
├── export.py                   # builds the analysis-ready CSV/JSONL package
├── insights.py                 # example analysis (U23 chance creators)
├── status.py                   # prints scrape progress
├── README.md
└── HANDOFF.md                  # this file
```

**Not in git** (gitignored): `data/` (1.6 GB raw JSONL), `exports/` (1.7 GB), `*.tar.gz`, `node_modules/`.

---

## 3. Run it locally

Requires **Node 22** (developed on v22.12.0) and npm.

```bash
cd scout
npm install
npm run dev      # http://127.0.0.1:5173/   (hash routing, e.g. /#/players)
npm run build    # tsc -b && vite build  -> scout/dist/
npm run lint     # eslint . — must stay at 0 errors
npm run preview  # serve the production build
```

The app is **100% client-side** — there is no backend running. All data is loaded from the two
JSON files in `scout/public/` at startup. (The spec mentions a FastAPI/DuckDB backend; we chose a
client-side implementation instead because the dataset fits comfortably in the browser. If you add
a backend later, keep the `src/lib/api.ts` function signatures as the contract.)

---

## 4. Architecture notes (where to make changes)

- **Routing** — `src/router.tsx` uses `createHashRouter`. Routes: `/`, `/players`, `/players/:id`,
  `/compare`, `/scatter`, `/search`, `*`. Shell layout is `components/shell/AppShell.tsx`.
- **Data access layer** — `src/lib/data.ts` loads + caches `players.json` / `matchlog.json`.
  `src/lib/api.ts` is the query API: `queryPlayers`, `getPlayer`, `getCompare`, `getMatchLog`,
  `getScatter`, `searchPlayers`, `getRadarIndex`, `buildPercentileIndex`, `countPlayersSync`.
  **Treat these signatures as the stable contract** — pages/components depend on them.
- **Metrics** — `src/lib/metrics.ts`: `METRICS` (25 metrics in 4 categories), `RADAR_AXES` (8 axes),
  per-90 normalization, `higherIsBetter()`. Add new stats here.
- **Percentiles** — `src/lib/percentiles.ts`: `PercentileIndex` (fast lookups), `bandFor()`,
  `BAND_COLOR`, `barColor()`. Colour banding for the whole UI flows from here.
- **State** — `src/store/filterStore.ts` (zustand) holds league/position/age/minApps/per90/sort/search;
  `src/store/uiStore.ts` holds search-modal open state.
- **Design tokens** — `src/styles/globals.css` holds ALL CSS custom properties (colors, type scale,
  scanline overlay, animations). Do not hardcode colours in components; use the tokens.
- **Charts** — radar (`components/profile/RadarChart.tsx`) and scatter
  (`components/scatter/ScatterPlot.tsx`) are hand-rolled D3-in-React (SVG). Compare bars use recharts.

### Known gotchas (already fixed, don't reintroduce)
- RadarChart: render polygons inside a single translated `<g>`; do NOT mix an SVG `transform`
  attribute with a CSS `transform` animation (it drops the translate and shifts polygons to origin).
- SearchModal: keep the outer/inner split (inner mounts only while open) to avoid setState-in-effect
  render loops.
- StatusBar player count uses `countPlayersSync(filters)` so it's live on every route, not just Players.

---

## 5. The data

`scout/public/players.json` — 3,145 distinct **player-season** profiles (2025/26 season), 6 leagues:
EPL 485, La Liga 512, Bundesliga 442, Serie A 520, Ligue 1 472, UCL 714.

**Important data caveats (carry these into any analysis/UI):**
- Advanced metrics (xA, xG, key passes, big chances, tackles, duels, interceptions, etc.) exist for
  the **2025/26 season only**. Older seasons in the raw data carry only basics (goals, assists,
  shots, minutes, cards). The committed `players.json` is built around current-season coverage.
- The static `age` field is **age today**, correct for active players but wrong for retired ones.
  For historical age filtering, compute age-at-match from `date_of_birth`.
- Deep endpoints `match_shots`, `match_heatmaps`, `match_avg_positions`, `match_best_players`,
  `match_momentum`, `match_pregame_forms` **do not exist** in the soccer API (404).
- `match_events` and `team_match_stats` DO exist with an all-access key and a background scrape was
  pulling them (newest-first, ~5 req/min) but did not finish before the trial/session ended.

### Regenerating data (only if you have an API key)
API keys are **not** hardcoded — scripts read `BALLDONTLIE_KEY` from the environment.
```bash
export BALLDONTLIE_KEY=<your_key>
python scrape.py            # or scrape_new.py for match_events + team_match_stats
python fetch_players.py     # rosters (names/age/DOB)
python aggregate_dashboard.py   # rebuild scout/public/players.json
python aggregate_matchlog.py    # rebuild scout/public/matchlog.json
```
Note: the rate limit on the trial key was 5 requests/min; a full 6-league pull of the deep endpoints
takes ~8–12 h. The user no longer has API access, so raw data is effectively frozen — see below.

### Raw data archives (no API key needed)
The raw scraped JSONL and the analysis-ready package are NOT in git (too large). They were delivered
as downloads in the session. If you need them locally, ask the user for:
- `scout_raw_data_euro.tar.gz` (~49 MB) — raw paginated JSONL for all 6 euro leagues.
- `balldontlie_euro_soccer.tar.gz` (~76 MB) — deduped analysis-ready CSV/JSONL + README/data-dictionary.

---

## 6. Deployment

Current public deploy (devinapps, static build of `scout/dist/`): https://dist-njrfffyy.devinapps.com

To redeploy anywhere static: `cd scout && npm run build`, then serve `scout/dist/`. Because routing is
hash-based, no server rewrite rules are required (works on any static host / GitHub Pages).

---

## 7. Status / what's left

Done: all 5 sections implemented and verified (Players table, Player Profile, Compare, Scatter,
Search), retro design per spec, branding sweep (zero AI wording), X link in header + footer,
lint clean, production build passing, deployed, pushed to GitHub.

Possible next steps:
- Fold `match_events` (goal/assist/card/sub timelines) + `team_match_stats` into profiles once that
  scrape is completed (needs API access again).
- Backfill advanced metrics for older seasons (blocked — data only exists for 2025/26).
- Optional: real backend (FastAPI/DuckDB) per spec §ref, keeping `src/lib/api.ts` signatures.

---

## 8. Hard rules (do not violate)

- Follow `SCOUT_SPEC.md` exactly — this project is reviewed against Claude's original spec.
- No "AI" / "intelligence" / adjacent branding. SCOUT only. Keep the X link.
- No emoji in the UI — custom SVG icons only (`components/primitives/Icons.tsx`).
- Never hardcode API keys — use the `BALLDONTLIE_KEY` env var.
- Do not commit `data/`, `exports/`, or `*.tar.gz`.
