# SCOUT — Football Stats Browser · Complete UI/UX Specification
**Version 1.0 · For one-shot implementation by a coding agent**

---

## 0. Document Purpose & Scope

This document is the single source of truth for building **SCOUT** — a retro-aesthetic football (soccer) statistics browser. It covers: brand identity, typography system, colour tokens, component library, page architecture, data model, API architecture recommendation, interaction behaviour, animation contracts, and accessibility requirements. A coding agent must be able to implement the full application from this document alone, cross-referencing the data manifest for field availability.

---

## 1. Brand Identity

### 1.1 Product Name & Tagline
- **Name:** `SCOUT`
- **Tagline:** `Big 5 · By the Numbers`
- **Sub-brand descriptor:** `Player Intelligence System v2.1`

### 1.2 Design Philosophy
The visual language is a **composite retro** that blends three eras:

| Influence | What we borrow |
|---|---|
| Championship Manager 01/02 | Dense monospace text tables, amber/green highlights on near-black backgrounds, zero-decoration data rows |
| Football Manager 2005–2010 | Tabbed panel chrome, inset box shadows, stat bars with numerical overlay, panel headers with embossed look |
| Winning Eleven / PES cards | High-contrast attribute grids, neon accent lines, position badge chips, rating-ring circles |

**The result:** an app that looks like it was built by a very talented programmer in 2003 who somehow had access to 2025 hardware. Pixel-sharp, dense, functional, but alive with motion.

### 1.3 Logo Mark
- Wordmark: `SCOUT` in **Space Grotesk 900 weight**, all-caps, letter-spacing `-0.04em`
- Preceding glyph: a scanline-styled football/circle SVG icon (hand-coded, not emoji) — 24×24px, single-colour, grid-cross detail inside circle
- The wordmark is always rendered in `--color-accent-amber` on `--color-bg-deep`

---

## 2. Typography System

### 2.1 Font Stack (load from Google Fonts)

```
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700;900&family=JetBrains+Mono:wght@300;400;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
```

| Role | Family | Weight | Size | Usage |
|---|---|---|---|---|
| **Display / Hero** | Space Grotesk | 900 | 48–96px | App title, section hero labels |
| **UI Label** | Space Grotesk | 700 | 11–13px | Tab labels, filter chips, column headers, badges |
| **UI Body** | Space Grotesk | 400 | 13–14px | Sidebar text, tooltip prose, nav items |
| **Data Primary** | JetBrains Mono | 700 | 14–16px | All numeric stat values in tables |
| **Data Secondary** | JetBrains Mono | 400 | 11–12px | Rank numbers, per-90 notation, small metadata |
| **Editorial / Bio** | Crimson Pro | 400/600 | 15–17px | Player bio paragraph, "about" blurb, long-form prose |
| **Editorial Italic** | Crimson Pro Italic | 400 | 14px | Nationality line, career note, comparison caption |

### 2.2 Type Scale (CSS custom properties)

```css
--font-xs:   10px;
--font-sm:   11px;
--font-base: 13px;
--font-md:   15px;
--font-lg:   18px;
--font-xl:   24px;
--font-2xl:  36px;
--font-3xl:  56px;
--font-4xl:  88px;
```

---

## 3. Colour System

### 3.1 Palette Tokens (CSS custom properties on `:root`)

```css
:root {
  /* Backgrounds — layered darkness */
  --color-bg-deep:      #0a0b0d;   /* page root, darkest */
  --color-bg-base:      #0f1114;   /* main content area */
  --color-bg-surface:   #161920;   /* panels, cards */
  --color-bg-elevated:  #1e222c;   /* table header, active tab */
  --color-bg-hover:     #252b38;   /* table row hover */
  --color-bg-selected:  #1a2540;   /* selected row / active player */

  /* Borders */
  --color-border-dim:   #1f2530;
  --color-border-mid:   #2a3347;
  --color-border-hi:    #3d4f6a;

  /* Accent — Amber (CM01/02 heritage) */
  --color-accent-amber:     #f5a623;
  --color-accent-amber-dim: #a06a10;
  --color-accent-amber-glow: rgba(245,166,35,0.15);

  /* Accent — Cyan (PES/WE neon) */
  --color-accent-cyan:      #00d4ff;
  --color-accent-cyan-dim:  #007a96;
  --color-accent-cyan-glow: rgba(0,212,255,0.12);

  /* Accent — Green (FM stat bars, positive delta) */
  --color-accent-green:     #39d353;
  --color-accent-green-dim: #1a5e26;

  /* Accent — Red (negative delta, red card, danger) */
  --color-accent-red:       #ff4d4d;
  --color-accent-red-dim:   #7a1a1a;

  /* Text */
  --color-text-primary:   #e8eaf0;
  --color-text-secondary: #8a96aa;
  --color-text-muted:     #4a5568;
  --color-text-amber:     #f5a623;
  --color-text-cyan:      #00d4ff;
  --color-text-green:     #39d353;
  --color-text-red:       #ff4d4d;

  /* Rating colour scale (1–10 or percentile bands) */
  --color-rating-elite:     #f5a623;  /* top 5%  */
  --color-rating-great:     #39d353;  /* top 15% */
  --color-rating-good:      #00d4ff;  /* top 35% */
  --color-rating-average:   #8a96aa;  /* middle  */
  --color-rating-poor:      #ff4d4d;  /* bottom 25% */
}
```

### 3.2 Dark Mode Only
The application is **dark-mode only**. No light mode toggle. The deep background evokes CRT monitor aesthetics.

### 3.3 Scanline Overlay
Apply a subtle repeating scanline texture to the page root using a CSS `::before` pseudo-element:
```css
body::before {
  content: '';
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
}
```

---

## 4. Iconography & Visual Language

### 4.1 No Emoji — Custom SVG Glyphs Only
All icons must be hand-coded SVG inline components. Never use system emoji (🏴󠁧󠁢󠁥󠁮󠁧󠁿, ⚽, etc.).

### 4.2 Flag System
Country / league flags are rendered as **2-letter ISO 3166 rectangle SVG badges** with a fill from a hardcoded flag colour map. Dimensions: 18×12px, 1px border `--color-border-mid`, rounded 1px. Store a `LEAGUE_FLAGS` constant mapping league keys to their national colours.

```
EPL   → red + white cross (England)
La Liga → red + yellow stripes (Spain)
Bundesliga → black + red + gold (Germany)
Serie A → green + white + red (Italy)
Ligue 1 → blue + white + red (France)
UCL → dark blue + yellow star ring
```

Implement as a `<LeagueFlag league="epl" />` React component.

### 4.3 Position Badge Chips
Small rectangular chip, 4px border-radius, monospace font, uppercase 2-letter code.

| Position Group | Label | Background | Text |
|---|---|---|---|
| Goalkeeper | GK | `#1a3a2a` | `--color-accent-green` |
| Defender | DF | `#1a2240` | `--color-accent-cyan` |
| Midfielder | MF | `#2a1a10` | `--color-accent-amber` |
| Forward | FW | `#3a1010` | `--color-accent-red` |
| Unknown | ? | `--color-bg-elevated` | `--color-text-muted` |

### 4.4 Star Rating (Player Quality Indicator)
Rendered as 5 custom SVG diamond shapes (◆), not stars. Filled in `--color-accent-amber`, empty in `--color-border-mid`. Half-filled variant via clip-path.

### 4.5 Retro UI Borders
All panels use a 1px solid border with a very subtle top-edge highlight:
```css
border: 1px solid var(--color-border-mid);
border-top-color: var(--color-border-hi);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
```

### 4.6 Attribute Bar (FM-style)
For stat bars in player profiles:
- Total width: 100%
- Bar fill: coloured by value (green > 14, amber 10–14, red < 10, on a 1–20 FM scale; or percentile on raw data)
- Foreground bar has a 1px top-edge highlight `rgba(255,255,255,0.3)`
- Numerical value right-aligned in JetBrains Mono 700

---

## 5. Architecture Recommendation

### 5.1 Stack

**Recommended:** Monorepo with a lightweight Python backend + React SPA frontend.

**Reason:** 1.87M records across ~10 CSVs cannot be bundled client-side without extreme load time and memory issues. A thin API layer enables server-side filtering, sorting, and pagination, making the UI feel instant.

```
/
├── backend/           # FastAPI (Python)
│   ├── main.py
│   ├── routers/
│   │   ├── players.py
│   │   ├── stats.py
│   │   └── compare.py
│   ├── data/          # CSV files loaded at startup into DuckDB or Polars
│   └── models/        # Pydantic schemas
└── frontend/          # React 18 + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── hooks/
    │   ├── store/       # Zustand
    │   └── lib/
    └── index.html
```

### 5.2 Backend: FastAPI + DuckDB

- Load all CSVs at startup into **DuckDB** in-memory database (DuckDB handles ~2M rows trivially)
- Expose REST endpoints (listed in Section 8)
- All numeric aggregation (per-90 calculation, season totals) happens server-side
- CORS open to `localhost:5173` in dev; configured via env in prod

### 5.3 Frontend: React 18 + TypeScript + Vite

- State management: **Zustand** (lightweight, no boilerplate)
- Data fetching: **TanStack Query** (React Query v5) for caching and pagination
- Routing: **React Router v6**
- Table: **TanStack Table v8** (headless, enables virtual scrolling)
- Charts: **D3.js** for the radar + **Recharts** for bar/scatter (D3 gives full control for retro styling)
- Build: **Vite** with `@vitejs/plugin-react`
- CSS: **Tailwind CSS** (only for layout/spacing utilities) + CSS custom properties for all colours/typography (no Tailwind colour classes — use our token system)

### 5.4 Virtual Scrolling Requirement
The player table can contain ~13,500 rows. Implement **TanStack Virtual** for the table body. Only render visible rows + 20-row overscan. This is non-negotiable for performance.

---

## 6. Data Model

### 6.1 Primary Data Sources (from manifest)

The coding agent must verify exact column names against actual CSV headers at build time. The following is the expected schema based on the balldontlie API structure:

#### `player_match_stats` (per match, per player)
Expected columns to verify:
```
player_id, player_name, team_id, team_name, match_id, date,
league, season, position, minutes_played,
goals, assists, shots, shots_on_target,
passes, key_passes, chances_created,
tackles, interceptions, clearances, blocks,
aerials_won, aerials_total,
yellow_cards, red_cards,
xg, xa, xg_per_shot,
rating (if available)
```

#### `players_master` (13,569 distinct players)
Expected columns:
```
player_id, player_name, nationality, position,
date_of_birth, age (computed), club (current), league
```

#### `teams` (per league)
```
team_id, team_name, league, short_name
```

#### `standings`
```
team_id, league, season, position, played, won, drawn, lost,
goals_for, goals_against, goal_difference, points
```

### 6.2 Derived / Computed Fields (server-side, DuckDB)

All these are computed in the API layer, never in the frontend:

```sql
-- Season aggregate per player per league
SELECT
  player_id,
  player_name,
  league,
  season,
  SUM(minutes_played)                              AS minutes_played,
  COUNT(DISTINCT match_id)                         AS matches_played,
  SUM(goals)                                       AS goals,
  SUM(assists)                                     AS assists,
  SUM(shots)                                       AS shots,
  SUM(shots_on_target)                             AS shots_on_target,
  SUM(xg)                                          AS xg,
  SUM(xa)                                          AS xa,
  SUM(key_passes)                                  AS key_passes,
  SUM(chances_created)                             AS chances_created,
  SUM(tackles)                                     AS tackles,
  SUM(interceptions)                               AS interceptions,
  SUM(aerials_won)                                 AS aerials_won,
  SUM(yellow_cards)                                AS yellow_cards,
  SUM(red_cards)                                   AS red_cards,
  -- Per 90 values (only meaningful if minutes_played > 0)
  ROUND(SUM(goals)        / SUM(minutes_played) * 90, 2) AS goals_p90,
  ROUND(SUM(assists)      / SUM(minutes_played) * 90, 2) AS assists_p90,
  ROUND(SUM(xg)           / SUM(minutes_played) * 90, 2) AS xg_p90,
  ROUND(SUM(xa)           / SUM(minutes_played) * 90, 2) AS xa_p90,
  ROUND(SUM(shots)        / SUM(minutes_played) * 90, 2) AS shots_p90,
  ROUND(SUM(key_passes)   / SUM(minutes_played) * 90, 2) AS key_passes_p90,
  ROUND(SUM(chances_created) / SUM(minutes_played) * 90, 2) AS chances_created_p90,
  ROUND(SUM(tackles)      / SUM(minutes_played) * 90, 2) AS tackles_p90,
  ROUND(SUM(interceptions)/ SUM(minutes_played) * 90, 2) AS interceptions_p90,
  ROUND(SUM(aerials_won)  / SUM(minutes_played) * 90, 2) AS aerials_won_p90,
  AVG(rating)                                      AS avg_rating
FROM player_match_stats
GROUP BY player_id, player_name, league, season
```

### 6.3 Stat Category Definitions

**⚠️ CODING AGENT INSTRUCTION:** Before finalising these columns, execute `SELECT column_name FROM information_schema.columns WHERE table_name = 'player_match_stats'` on the loaded DuckDB table and map actual column names to these logical names. If a column does not exist, hide its UI element rather than showing null/error.

#### Category: General
| Display Label | Raw Field | Per-90 Field | Notes |
|---|---|---|---|
| Rating | `avg_rating` | — | Average match rating |
| Goals | `goals` | `goals_p90` | |
| Assists | `assists` | `assists_p90` | |
| G+A | computed | computed | Goals + Assists |
| Yellow Cards | `yellow_cards` | — | |
| Red Cards | `red_cards` | — | |

#### Category: Attacking
| Display Label | Raw Field | Per-90 Field |
|---|---|---|
| Shots | `shots` | `shots_p90` |
| Shots on Target | `shots_on_target` | — |
| Shot Accuracy % | computed | — |
| xG | `xg` | `xg_p90` |
| xG per Shot | `xg_per_shot` | — |
| Goals vs xG | computed (goals − xg) | — |

#### Category: Creating
| Display Label | Raw Field | Per-90 Field |
|---|---|---|
| Key Passes | `key_passes` | `key_passes_p90` |
| Chances Created | `chances_created` | `chances_created_p90` |
| xA | `xa` | `xa_p90` |
| Assists vs xA | computed (assists − xa) | — |

#### Category: Defending
| Display Label | Raw Field | Per-90 Field |
|---|---|---|
| Tackles | `tackles` | `tackles_p90` |
| Interceptions | `interceptions` | `interceptions_p90` |
| Aerials Won | `aerials_won` | `aerials_won_p90` |
| Clearances | `clearances` | — |
| Blocks | `blocks` | — |

---

## 7. Page Architecture & Routing

```
/                      → Landing / Splash screen (boot sequence animation)
/players               → Main Player Table (primary view)
/players/:id           → Player Profile Page
/compare               → Player Comparison Page (up to 3 players)
/scatter               → Scatter Plot Explorer
/search                → Full-text search results
```

All routes are **client-side** (React Router). The `404` page uses the retro "CONNECTION LOST" screen treatment.

---

## 8. API Endpoints (FastAPI)

```
GET  /api/players
     ?league=epl,laliga
     &position=FW,MF
     &season=2023
     &min_matches=10
     &age_min=18&age_max=35
     &sort_by=goals&sort_dir=desc
     &per90=true
     &page=1&page_size=50
     → { total, page, players: [...] }

GET  /api/players/:id
     ?season=2023
     → { player_info, season_stats, match_log }

GET  /api/players/:id/matches
     → [{ match_id, date, opponent, stats }]

GET  /api/compare
     ?ids=123,456,789&season=2023
     → { players: [...] }

GET  /api/scatter
     ?x_metric=xg_p90&y_metric=shots_p90&league=epl&season=2023
     → [{ player_id, player_name, x, y, position, team }]

GET  /api/search
     ?q=mbappe
     → [{ player_id, player_name, team, league, position }]

GET  /api/meta/seasons    → [list of available seasons per league]
GET  /api/meta/leagues    → [{ key, display_name, teams_count }]
```

All responses are JSON. All list endpoints are paginated (default 50, max 200). Server applies per-90 normalization when `per90=true` is passed.

---

## 9. Page Specifications

---

### 9.1 LAYER 1 — Boot / Splash Screen (`/`)

**Purpose:** First impression. Sets the retro tone immediately.

**Layout:** Full-viewport, centered content, `--color-bg-deep` background.

**Boot Sequence Animation (750ms total, runs once per session, skippable):**
1. `0ms` — Screen is black
2. `50ms` — Scanline sweep down (a bright horizontal line CSS animation, 120ms duration)
3. `170ms` — SCOUT logo fades in (JetBrains Mono, letter-by-letter, `--color-accent-amber`)
4. `300ms` — Below logo: monospace typewriter text appears line by line:
   ```
   PLAYER INTELLIGENCE SYSTEM v2.1
   LOADING DATABASE........... OK
   INDEXING 13,569 PLAYERS.... OK
   CONNECTING TO SCOUTING NET. OK
   ```
5. `650ms` — "PRESS ANY KEY TO CONTINUE" blink (500ms blink cycle, `--color-accent-cyan`)
6. Any keypress / click → navigate to `/players` with a brief flash-to-white → fade-in

**Skip:** `sessionStorage` flag `scout_booted`; if set, redirect immediately to `/players`.

---

### 9.2 LAYER 2 — Application Shell (Persistent)

All pages `/players`, `/players/:id`, `/compare`, `/scatter` share a persistent shell.

#### 9.2.1 Top Navigation Bar
- Height: 44px
- Background: `--color-bg-surface`, bottom border `--color-border-mid`
- Left: SCOUT logo mark (SVG football glyph + wordmark, Space Grotesk 900)
- Center: Nav tabs — `PLAYERS` · `COMPARE` · `SCATTER` · `SEARCH` — Space Grotesk 700 12px uppercase, letter-spacing `0.08em`
  - Active tab: bottom border 2px `--color-accent-amber`, text `--color-text-amber`
  - Hover: text `--color-text-primary`, transition 120ms
- Right: Season selector dropdown (custom retro-styled `<select>` replacement) + a small "database status" indicator (green dot + record count in JetBrains Mono)

#### 9.2.2 Status Bar (bottom, persistent)
- Height: 22px
- Background: `--color-bg-deep`, top border `--color-border-dim`
- Left: current filter summary in JetBrains Mono 300 10px — e.g. `EPL · 2023/24 · FW · min 10 apps · 342 players`
- Right: `SCOUT v2.1` in muted monospace + animated loading indicator (spinning `|/-\` ASCII-style) when any fetch is in progress

---

### 9.3 LAYER 3 — Main Player Table (`/players`)

This is the primary, most-used view. Treat it with the most care.

#### 9.3.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR (44px)                                          │
├──────────┬──────────────────────────────────────────────┤
│ FILTER   │  STAT CATEGORY TABS                          │
│ PANEL    │  ┌──────────────────────────────────────────┐│
│ (220px)  │  │ PLAYER TABLE (virtualized, scrollable)   ││
│          │  │                                          ││
│          │  └──────────────────────────────────────────┘│
│          │  PAGINATION / ROW COUNT BAR                  │
├──────────┴──────────────────────────────────────────────┤
│  STATUS BAR (22px)                                      │
└─────────────────────────────────────────────────────────┘
```

#### 9.3.2 Filter Panel (left, 220px wide, fixed)
Background: `--color-bg-surface`. Each filter group has a collapsible header (Space Grotesk 700 11px, all caps, `--color-text-muted`, `▶ LEAGUE` toggle with 180ms rotation animation).

**Filter Groups:**

1. **LEAGUE** — Multi-checkbox
   - [ ] EPL (England)
   - [ ] La Liga (Spain)
   - [ ] Bundesliga (Germany)
   - [ ] Serie A (Italy)
   - [ ] Ligue 1 (France)
   - [ ] UCL (Europe)
   Each row: `<LeagueFlag />` + name + current player count in muted mono

2. **SEASON** — Single-select radio buttons listing available seasons from `/api/meta/seasons`

3. **POSITION** — Multi-chip select (not checkboxes)
   Chips: `GK` · `DF` · `MF` · `FW` styled as position badges (Section 4.3). Multiple selectable.

4. **AGE** — Dual-thumb range slider, 15–40, step 1
   - Custom styled: track `--color-border-mid`, fill `--color-accent-amber`, thumb 12px circle

5. **MIN. APPEARANCES** — Segmented control buttons: `5` · `10` · `15` · `30`
   Active: background `--color-accent-amber`, text `--color-bg-deep`

6. **PER 90 TOGGLE** — Large toggle switch, amber when ON
   Label: `PER 90 MINUTES` in Space Grotesk 700 11px
   When active, all stat columns switch to per-90 values and column headers show `/90` suffix

**Reset Filters** — bottom of panel, full-width button, 1px border `--color-border-hi`, hover: border-color `--color-accent-amber`

#### 9.3.3 Stat Category Tabs (above table)
Four tabs: `GENERAL` · `ATTACKING` · `CREATING` · `DEFENDING`
- Tab bar background: `--color-bg-elevated`
- Active: `--color-accent-amber` bottom-border 2px, amber text
- Switching tabs changes the visible columns in the table. The first 6 columns (rank, name, club, position, age, apps, mins) are always pinned left.

#### 9.3.4 Player Table

**Column Configuration:**

Always-visible (pinned left, sticky):
| # | Column | Width | Font | Align |
|---|---|---|---|---|
| 1 | Rank `#` | 42px | JetBrains Mono 400 10px, `--color-text-muted` | center |
| 2 | Player Name | 180px | Space Grotesk 700 13px, `--color-text-primary` | left |
| 3 | Club | 120px | Space Grotesk 400 12px + mini club badge (16px SVG circle) | left |
| 4 | Pos | 48px | Position Badge chip | center |
| 5 | Age | 40px | JetBrains Mono 400 12px | center |
| 6 | Apps | 48px | JetBrains Mono 700 13px | center |
| 7 | Mins | 56px | JetBrains Mono 400 12px, `--color-text-secondary` | right |

Stat columns (switch per tab, all right-aligned, JetBrains Mono 700 14px):

**GENERAL tab columns:** Rating · Goals · Assists · G+A · Yel · Red

**ATTACKING tab columns:** Shots · SoT · Shot% · xG · xG/Shot · vs xG

**CREATING tab columns:** Key Pass · Chances · xA · vs xA

**DEFENDING tab columns:** Tackles · Interceptions · Aerials · Clearances · Blocks

**Column Header Behaviour:**
- Space Grotesk 700 10px, all-caps, `--color-text-muted`, letter-spacing `0.1em`
- Click to sort (asc/desc toggle). Sorted column header: `--color-text-amber` + `▲`/`▼` glyph
- On hover: `--color-text-primary` transition 100ms

**Row Behaviour:**
- Row height: 34px
- Alternating row backgrounds: odd `--color-bg-base`, even `--color-bg-surface` (very subtle difference, ~3% lighter)
- Hover: `--color-bg-hover`, transition 80ms, full-row highlight
- Click: Navigate to `/players/:id`
- Selected row (if navigating back): `--color-bg-selected`, left-edge 3px accent bar `--color-accent-cyan`

**Stat Value Colouring (percentile-based against visible dataset):**
- Top 5%: `--color-rating-elite` (amber)
- Top 15%: `--color-rating-great` (green)
- Top 35%: `--color-rating-good` (cyan)
- Middle: `--color-text-primary` (default)
- Bottom 25%: `--color-text-muted`
Recalculate on every filter change.

**Pagination / Load More:**
- Show rows `1–50 of 342 players` in JetBrains Mono 400 11px
- `PREV` · page numbers · `NEXT` — retro rectangular buttons, 1px border
- Alternatively: "Load 50 more" infinite-scroll trigger at bottom of virtual list (preferred for table UX)

---

### 9.4 LAYER 4 — Player Profile Page (`/players/:id`)

#### 9.4.1 Layout
```
┌─────────────────────────────────────────────────────────┐
│ TOPBAR                                                  │
├──────────────────────┬──────────────────────────────────┤
│ PLAYER HEADER PANEL  │  RADAR CHART PANEL               │
│ (left 40%)           │  (right 60%)                     │
├──────────────────────┴──────────────────────────────────┤
│ STAT TABS: GENERAL · ATTACKING · CREATING · DEFENDING   │
├─────────────────────────────────────────────────────────┤
│ STAT DETAIL PANEL (FM-style attribute grid)             │
├─────────────────────────────────────────────────────────┤
│ MATCH LOG TABLE (recent matches, scrollable, 10 rows)   │
├─────────────────────────────────────────────────────────┤
│ ACTION BAR: [+ ADD TO COMPARE] [← BACK TO TABLE]       │
└─────────────────────────────────────────────────────────┘
```

#### 9.4.2 Player Header Panel
- Large player name: Space Grotesk 900, 36px, `--color-text-primary`
- Club + League on next line: Space Grotesk 400 14px + `<LeagueFlag />`
- Position badge (large, 24px height version)
- Age · Nationality (JetBrains Mono 300 12px, `--color-text-secondary`) — nationality as text, no emoji
- Season selector dropdown (if player appears in multiple seasons)
- **Overall Rating Ring** (if `avg_rating` exists): SVG circular ring, 72px diameter, arc fill proportional to rating/10, colour from rating scale, JetBrains Mono 700 24px rating number in centre
- **Diamond quality indicators** (Section 4.4): 5 diamonds

#### 9.4.3 Radar Chart Panel — Hybrid Radar + Bar Breakdown

**Radar (spider web polygon), D3.js:**
- 8 axes: Goals/90 · Assists/90 · xG/90 · xA/90 · Chances Created/90 · Tackles/90 · Interceptions/90 · Aerials/90
- All axes normalized 0–1 against full dataset percentile (not absolute values)
- Background: concentric polygon rings at 20%, 40%, 60%, 80% — stroke `--color-border-dim`, dashed
- Axis lines: `--color-border-mid`
- Axis labels: JetBrains Mono 400 10px, `--color-text-secondary`
- Player polygon fill: `rgba(245,166,35,0.2)` (amber tint), stroke `--color-accent-amber` 2px
- If comparison player loaded (from compare page context): second polygon in `rgba(0,212,255,0.15)`, stroke `--color-accent-cyan`
- Size: 280px × 280px SVG viewBox
- Animation: polygon vertices animate from centre outward on mount (600ms, ease-out cubic bezier)

**On Hover (any axis vertex):**
- A tooltip panel slides in from right edge (200px wide, 280ms slide + fade)
- Shows the hovered metric's **horizontal bar breakdown**:
  - Metric name (Space Grotesk 700 11px amber)
  - Player's raw value (JetBrains Mono 700 20px)
  - Percentile rank: "Better than 87% of players" (JetBrains Mono 400 11px green)
  - Horizontal bar: full width, fill coloured by percentile, height 8px, background `--color-border-mid`
  - Comparison player bar below (if present, cyan coloured)
- Tooltip disappears 300ms after mouse leaves vertex (debounced)

#### 9.4.4 Stat Detail Panel (FM Attribute Grid)
Four columns, one per stat category. Each category is a labelled group:

```
┌─────────────────────────────────────┐
│ GENERAL                             │
│ Rating     ████████░░  7.8          │
│ Goals      ██████████  23           │
│ Assists    ████████░░  11           │
└─────────────────────────────────────┘
```
- Label: Space Grotesk 400 12px, `--color-text-secondary`, fixed 140px wide
- Bar: flex-grow, height 6px, `--color-bg-elevated` background, fill coloured by percentile
- Value: JetBrains Mono 700 13px, right-aligned, coloured by percentile
- Row height: 28px, 4px gap between rows
- Group header: Space Grotesk 700 10px, all-caps, `--color-text-muted`, `--color-border-dim` bottom-border, 8px margin below

#### 9.4.5 Match Log Table
10 most recent matches. Columns: Date · Opponent · Competition · Mins · Goals · Assists · Rating
- Same table styling as main table but smaller (28px row height, 12px font)
- Rating coloured by value
- "VIEW ALL MATCHES" link at bottom (loads full match history via pagination)

---

### 9.5 LAYER 5 — Player Comparison Page (`/compare`)

**Purpose:** Side-by-side comparison of 2–3 players.

#### 9.5.1 Layout
```
┌──────────────────────────────────────────────────┐
│ PLAYER SELECTOR BAR (3 slots)                    │
│ [PLAYER 1 ×]  [PLAYER 2 ×]  [+ ADD PLAYER]      │
├──────────────────────────────────────────────────┤
│ OVERLAID RADAR (all polygons on single chart)    │
├──────────────────────────────────────────────────┤
│ STAT COMPARISON GRID                             │
│ Metric       | Player 1 | Player 2 | Player 3   │
│ Goals/90     |  0.62 ▲  |  0.41    |  0.55      │
├──────────────────────────────────────────────────┤
│ BAR CHART COLUMNS (Recharts grouped bar chart)   │
└──────────────────────────────────────────────────┘
```

**Player Selector Slots:**
- Each slot: 200px wide card, amber dashed border when empty (`border: 2px dashed --color-accent-amber-dim`)
- When filled: player name + club + position badge + `×` remove button
- "+ ADD PLAYER" opens a search modal (Section 9.7)
- Persist selected IDs in URL query params (`?ids=123,456,789`) for shareability

**Overlaid Radar:**
- Same D3 radar as profile page, 360px × 360px
- Player 1: amber polygon
- Player 2: cyan polygon
- Player 3: green polygon
- Legend strip below chart: coloured name badges

**Stat Comparison Grid:**
- All metrics from all four categories
- Winning value per row (highest across selected players) shown in `--color-accent-amber` with `▲` glyph
- Percentage delta shown in small muted text: `+22%` / `-8%`

**Grouped Bar Chart (Recharts):**
- Grouped bars per metric, one bar per player
- Custom bar fills per player colour scheme
- Retro-styled: no rounded corners on bars (square), thin 1px border on each bar, custom legend

---

### 9.6 LAYER 6 — Scatter Plot Explorer (`/scatter`)

**Purpose:** Visualise any two metrics plotted against each other for all players.

#### 9.6.1 Layout
```
┌──────────────────────────────────────────────────┐
│ X-AXIS selector  ↔  Y-AXIS selector              │
│ [xG/90 ▼]           [Goals/90 ▼]                 │
│ Colour by: [Position ▼]   Size by: [Apps ▼]      │
├──────────────────────────────────────────────────┤
│ SCATTER PLOT (D3, full width, 500px height)      │
│ Each dot = 1 player, interactive hover tooltip   │
├──────────────────────────────────────────────────┤
│ Legend + filter chips (position, league)         │
└──────────────────────────────────────────────────┘
```

**Scatter Plot (D3):**
- Axis lines: `--color-border-mid`, tick labels: JetBrains Mono 400 10px `--color-text-muted`
- Grid lines: `--color-border-dim` dashed
- Dots: 6px radius base, colour by position (GK=green, DF=cyan, MF=amber, FW=red)
- Size optionally scaled by another metric (e.g. minutes played)
- Hover tooltip: player name + club + both axis values + position badge
- Click dot: navigate to `/players/:id`
- Brush selection (D3 brush): drag to select a region, shows selected players in a mini list below
- Axis dropdowns: all available metrics from the four categories

**Regression line toggle:** optional best-fit line (SVG `<line>` + `<text>` r² value)

---

### 9.7 LAYER 7 — Search

**Two entry points:**
1. Nav bar `SEARCH` link → `/search` page
2. Modal triggered from compare player-slot or any `⌘K` / `Ctrl+K` hotkey

**Search Modal:**
- Full-screen overlay, `rgba(0,0,0,0.85)` backdrop, `--color-bg-surface` panel 480px wide centered
- JetBrains Mono input, 16px, no border-radius, `2px solid --color-border-hi`, amber caret, amber focus ring
- Results appear below as a virtualized list (up to 100 results): player name + club + league flag + position badge
- Fuzzy search client-side on player name (Fuse.js) for instant results + debounced server search for thorough results
- `ESC` to close, arrow keys to navigate results, `Enter` to navigate to player profile

---

## 10. Animation & Motion Contracts

All animations must maintain 60fps. Use `will-change: transform` and `transform`/`opacity` only (no `width`/`height` animation).

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Boot typewriter text | Character-by-character opacity 0→1 | 8ms/char | linear |
| Boot scanline sweep | translateY -100% → 100% | 120ms | ease-in |
| Page route transition | Opacity fade 0→1 | 180ms | ease-out |
| Table row hover | Background-color transition | 80ms | linear |
| Filter panel collapse | Height + opacity | 200ms | ease-in-out |
| Radar polygon draw | Scale(0)→scale(1) from center | 600ms | cubic-bezier(0.34,1.56,0.64,1) |
| Radar hover tooltip | translateX(-8px)→0 + opacity | 200ms | ease-out |
| Stat bar fill | Width 0→final | 400ms | ease-out (staggered 30ms per row) |
| Search modal open | Scale(0.96)→1 + opacity | 180ms | ease-out |
| Column sort change | Row reorder (layout animation) | 250ms | ease-in-out |
| Position badge appear | Scale(0.8)→1 | 120ms | ease-out |

**Loading States:**
- Table skeleton: animated shimmer rows (CSS `@keyframes shimmer` linear-gradient sweep, `--color-bg-elevated` on `--color-bg-surface`)
- Use 8 skeleton rows matching actual row height
- Shimmer speed: 1200ms cycle

---

## 11. Responsive Behaviour

The primary target is **desktop (1280px+)** but must not break on 1024px.

| Breakpoint | Change |
|---|---|
| < 1280px | Filter panel collapses to icon-only sidebar (28px), expand on click |
| < 1024px | Radar chart moves below header panel (stacked layout) |
| < 768px | Show a "DESKTOP RECOMMENDED" banner but keep basic functionality; hide match log; reduce visible table columns to name + position + 3 stat columns |

No mobile-first design — this is intentionally desktop-centric, matching the management game feel.

---

## 12. Accessibility Requirements

- All interactive elements keyboard-navigable (tab order logical)
- `role="grid"` on main table, `role="row"` on rows, `aria-sort` on sorted column
- Colour is never the ONLY differentiator — percentile rank always has text value
- `aria-label` on all icon-only buttons
- `prefers-reduced-motion`: disable all animations, replace with instant transitions
- Focus ring: 2px solid `--color-accent-cyan`, 2px offset — never hidden

---

## 13. Component File Structure (Frontend)

```
src/
├── components/
│   ├── shell/
│   │   ├── TopBar.tsx
│   │   ├── StatusBar.tsx
│   │   └── NavTabs.tsx
│   ├── filters/
│   │   ├── FilterPanel.tsx
│   │   ├── LeagueFilter.tsx
│   │   ├── PositionChips.tsx
│   │   ├── AgeRangeSlider.tsx
│   │   ├── MinAppsControl.tsx
│   │   └── Per90Toggle.tsx
│   ├── table/
│   │   ├── PlayerTable.tsx          # TanStack Table + Virtual
│   │   ├── TableHeader.tsx
│   │   ├── PlayerRow.tsx
│   │   ├── StatCell.tsx             # Handles percentile colouring
│   │   └── SkeletonRows.tsx
│   ├── profile/
│   │   ├── PlayerHeader.tsx
│   │   ├── RatingRing.tsx           # SVG arc ring
│   │   ├── RadarChart.tsx           # D3 spider chart
│   │   ├── RadarTooltip.tsx         # Hover bar breakdown
│   │   ├── StatAttributeGrid.tsx    # FM-style bars
│   │   └── MatchLog.tsx
│   ├── compare/
│   │   ├── PlayerSlot.tsx
│   │   ├── CompareRadar.tsx
│   │   ├── StatCompareGrid.tsx
│   │   └── CompareBarChart.tsx
│   ├── scatter/
│   │   ├── ScatterPlot.tsx          # D3
│   │   ├── AxisSelector.tsx
│   │   └── ScatterTooltip.tsx
│   ├── search/
│   │   ├── SearchModal.tsx
│   │   └── SearchResultItem.tsx
│   └── primitives/
│       ├── LeagueFlag.tsx           # SVG flags
│       ├── PositionBadge.tsx
│       ├── DiamondRating.tsx
│       ├── StatBar.tsx
│       ├── RetroButton.tsx
│       ├── RetroSelect.tsx
│       └── RetroToggle.tsx
├── pages/
│   ├── Boot.tsx
│   ├── Players.tsx
│   ├── PlayerProfile.tsx
│   ├── Compare.tsx
│   ├── Scatter.tsx
│   └── Search.tsx
├── hooks/
│   ├── usePlayers.ts                # TanStack Query wrapper
│   ├── usePlayerProfile.ts
│   ├── useCompare.ts
│   ├── useScatter.ts
│   └── usePercentiles.ts           # Percentile calculator
├── store/
│   └── filterStore.ts              # Zustand: all filter state
├── lib/
│   ├── api.ts                      # All fetch functions
│   ├── percentiles.ts              # Percentile maths
│   ├── formatters.ts               # Number display helpers
│   └── constants.ts               # Leagues, positions, metric defs
└── styles/
    ├── globals.css                  # CSS custom properties, scanline overlay
    ├── table.css
    └── animations.css
```

---

## 14. CSS Global Baseline

```css
/* globals.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 14px; background: var(--color-bg-deep); color: var(--color-text-primary); }

body {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Monospace data class */
.mono { font-family: 'JetBrains Mono', monospace; }
.mono-bold { font-family: 'JetBrains Mono', monospace; font-weight: 700; }

/* Retro panel */
.panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-mid);
  border-top-color: var(--color-border-hi);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-deep); }
::-webkit-scrollbar-thumb { background: var(--color-border-hi); border-radius: 0; }
::-webkit-scrollbar-thumb:hover { background: var(--color-accent-amber-dim); }

/* Selection */
::selection { background: var(--color-accent-amber-glow); color: var(--color-accent-amber); }
```

---

## 15. Coding Agent Checklist (Implementation Order)

Execute in this order to avoid dependency blocks:

1. **Backend first** — Set up FastAPI, load CSVs into DuckDB, verify actual column names, implement `/api/players` with all filters, then remaining endpoints
2. **Design tokens** — Implement `globals.css` with all CSS custom properties + scanline overlay + font imports
3. **Primitives** — Build `LeagueFlag`, `PositionBadge`, `RetroButton`, `StatBar`, `RetroToggle` — these are deps for everything else
4. **Shell** — `TopBar` + `StatusBar` + routing skeleton
5. **Boot screen** — Typewriter animation + session flag
6. **Filter store** — Zustand store with all filter fields + URL sync via `react-router` `useSearchParams`
7. **Player Table** — TanStack Table + Virtual + percentile colouring + sort + all columns
8. **Filter Panel** — All filter controls wired to Zustand store
9. **Player Profile** — Header + D3 Radar + hover tooltip + FM stat grid + match log
10. **Compare page** — Multi-player slots + overlaid radar + grid
11. **Scatter page** — D3 scatter + axis selectors + brush
12. **Search modal** — Fuse.js + debounced API search + keyboard nav
13. **Polish** — Animations, skeleton loading, `prefers-reduced-motion`, keyboard accessibility

---

*SCOUT Spec Sheet v1.0 — End of Document*
