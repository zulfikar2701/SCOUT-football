# SCOUT — Big 5, By the Numbers

A retro-styled football statistics browser for the Big 5 European leagues plus
the UEFA Champions League (2025/26). Built from the `SCOUT_SPEC.md` design
language: a composite of Championship Manager 01/02, Football Manager
2005–2010, and Winning Eleven/PES — dark-mode only, CRT scanlines, amber/cyan/
green accents.

Live data covers **3,145 player-season profiles** across EPL, La Liga,
Bundesliga, Serie A, Ligue 1 and the Champions League, scraped from the
[balldontlie](https://balldontlie.io) API.

## Repository layout

```
scout/                 React + Vite + TypeScript web app (the SCOUT website)
  src/                 Components, pages, lib (metrics, percentiles, data)
  public/              players.json + matchlog.json (aggregated, committed)
scrape.py              Phase A scraper (player_match_stats, lineups, matches…)
scrape_new.py          Phase B scraper (match_events, team_match_stats)
aggregate_dashboard.py Builds public/players.json (per-player season rows)
aggregate_matchlog.py  Builds public/matchlog.json (recent match logs)
aggregate_teams.py     Team aggregates
export.py / insights.py  CSV/JSONL export + worked-example insights
openapi.yml            balldontlie OpenAPI reference
```

The multi-GB raw `data/` directory and the export tarball are **git-ignored**;
regenerate them with the scrapers below.

## Running the website

```bash
cd scout
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # production build to scout/dist
```

The app is fully client-side — it loads `public/players.json` and
`public/matchlog.json` and does all filtering, sorting, percentile and per-90
computation in the browser.

### Pages
- **Players** — virtualized table, filter panel (league/position/age/min-apps),
  per-90 toggle, percentile-coloured stat columns across General / Attacking /
  Creating / Defending.
- **Player profile** — rating ring, 8-axis percentile radar with hover
  breakdown, full FM-style attribute grid, recent match log.
- **Compare** — up to three players, overlaid radar, grouped bars, full stat
  comparison grid with best-value highlighting.
- **Scatter** — any metric vs any metric, position-coloured points, drag-to-
  brush selection, click-through to profiles.
- **Search** — fuzzy search (Ctrl+K from anywhere).

## Regenerating data

```bash
export BALLDONTLIE_KEY=your-api-key
python scrape.py            # core stats, lineups, matches (resumable)
python scrape_new.py        # match_events + team_match_stats (resumable)
python aggregate_dashboard.py   # -> scout/public/players.json
python aggregate_matchlog.py    # -> scout/public/matchlog.json
```

API keys are read from the `BALLDONTLIE_KEY` environment variable only — no
credentials are stored in the repo.

## Notes
- Advanced metrics (xG, xA, key passes, tackles, etc.) are populated for the
  current 2025/26 season; older seasons in the raw data carry basic stats only.
- Built by [@zulfikarsenal](https://x.com/zulfikarsenal).
