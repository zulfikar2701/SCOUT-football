#!/usr/bin/env python3
"""
balldontlie scraper — prioritized, resumable, rate-limit-aware.

Trial tier = 5 requests / 60s window. We read the x-ratelimit-* headers on every
response and sleep precisely until the window resets, so we never waste budget on
429s. Highest-value bulk endpoints are scraped first so that whenever the trial
dies, we already have the most important data on disk.

Data layout:
  data/<league>/<endpoint>.jsonl   (one JSON record per line; pages appended)
  data/_state.json                 (per-task progress for resume)
  scrape.log                       (run log)
"""
import json, os, sys, time, urllib.parse, urllib.request, urllib.error, traceback

KEY = os.environ.get("BALLDONTLIE_KEY")
if not KEY:
    raise SystemExit("Set the BALLDONTLIE_KEY environment variable with your balldontlie API key.")
BASE = "https://api.balldontlie.io"
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
STATE_PATH = os.path.join(DATA, "_state.json")
LOG_PATH = os.path.join(ROOT, "scrape.log")
PER_PAGE = 100
BATCH = 25  # match/game ids per request for *-keyed endpoints
# Match-list depth cap (newest-first). Set to None to fetch full history.
# The trial's rate limit lifted from 5/min to 600/min, so full history is affordable.
MAX_MATCH_PAGES = None

os.makedirs(DATA, exist_ok=True)

def log(msg):
    line = f"[{time.strftime('%H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")

# ----------------------------- state -----------------------------
def load_state():
    if os.path.exists(STATE_PATH):
        try:
            return json.load(open(STATE_PATH))
        except Exception:
            return {}
    return {}

def save_state(st):
    tmp = STATE_PATH + ".tmp"
    json.dump(st, open(tmp, "w"))
    os.replace(tmp, STATE_PATH)

STATE = load_state()

# ----------------------------- rate-limited fetch -----------------------------
class Limiter:
    remaining = None
    reset = None  # unix ts
limiter = Limiter()

def _throttle():
    if limiter.remaining is not None and limiter.remaining <= 0 and limiter.reset:
        wait = limiter.reset - time.time() + 1.0
        if wait > 0:
            log(f"  budget exhausted; sleeping {wait:.0f}s until window reset")
            time.sleep(wait)

def fetch(path, params=None):
    """GET BASE+path with params. Returns parsed JSON dict, or None on hard error."""
    params = params or {}
    params = {**params, "per_page": PER_PAGE}
    qs = urllib.parse.urlencode(params, doseq=True)
    url = f"{BASE}{path}?{qs}" if qs else f"{BASE}{path}"
    attempt = 0
    while True:
        _throttle()
        attempt += 1
        req = urllib.request.Request(url, headers={"Authorization": KEY})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                hdr = r.headers
                _update_limiter(hdr)
                body = r.read().decode("utf-8", "replace")
                return json.loads(body)
        except urllib.error.HTTPError as e:
            hdr = e.headers
            _update_limiter(hdr)
            code = e.code
            if code == 429:
                ra = hdr.get("retry-after")
                if ra and ra.isdigit():
                    wait = int(ra) + 1
                elif limiter.reset:
                    wait = max(1, limiter.reset - time.time() + 1)
                else:
                    wait = 31
                log(f"  429 on {path}; sleeping {wait:.0f}s")
                time.sleep(wait)
                continue
            if code in (401, 403):
                log(f"  {code} FORBIDDEN {path} (tier-gated) -> skip")
                return {"__error__": code}
            if code in (500, 502, 503, 504) and attempt <= 4:
                log(f"  {code} server error {path}; retry in 5s")
                time.sleep(5)
                continue
            log(f"  HTTP {code} {path} {params} -> skip ({e.read()[:120]!r})")
            return {"__error__": code}
        except Exception as e:
            if attempt <= 4:
                log(f"  net error {path}: {e}; retry in 5s")
                time.sleep(5)
                continue
            log(f"  giving up {path}: {e}")
            return None

def _update_limiter(hdr):
    try:
        rem = hdr.get("x-ratelimit-remaining")
        rst = hdr.get("x-ratelimit-reset")
        if rem is not None:
            limiter.remaining = int(rem)
        if rst is not None:
            limiter.reset = int(rst)
    except Exception:
        pass

# ----------------------------- task runner -----------------------------
def outfile(league, name):
    d = os.path.join(DATA, league)
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, name + ".jsonl")

def append_records(fp, records):
    with open(fp, "a") as f:
        for rec in records:
            f.write(json.dumps(rec, separators=(",", ":")) + "\n")

def run_task(task_id, league, name, path, params=None, paginate=True, max_pages=None):
    """Fetch (optionally paginated) and append all data records to <league>/<name>.jsonl.
    max_pages caps pagination (results are newest-first, so this keeps the most recent)."""
    params = dict(params or {})
    tstate = STATE.get(task_id, {})
    if tstate.get("done"):
        return tstate.get("count", 0)
    fp = outfile(league, name)
    cursor = tstate.get("cursor")
    total = tstate.get("count", 0)
    pages = total // PER_PAGE  # approx pages already fetched (for resume)
    # NOTE: many tasks (batched match-detail endpoints) intentionally share one output
    # file, so we never truncate here. Resume is driven by per-task cursor in STATE;
    # any rare duplicate page after a hard crash is removed by export.py's dedup.
    while True:
        p = dict(params)
        if cursor is not None:
            p["cursor"] = cursor
        resp = fetch(path, p)
        if resp is None:
            STATE[task_id] = {"done": False, "cursor": cursor, "count": total, "error": "net"}
            save_state(STATE); return total
        if "__error__" in resp:
            STATE[task_id] = {"done": True, "count": total, "error": resp["__error__"]}
            save_state(STATE); return total
        data = resp.get("data", [])
        if isinstance(data, dict):
            data = [data]
        append_records(fp, data)
        total += len(data)
        meta = resp.get("meta") or {}
        nxt = meta.get("next_cursor")
        log(f"  {name}[{league}] +{len(data)} (total {total}) cursor={cursor}->{nxt}")
        if not paginate or not nxt or nxt == cursor:
            STATE[task_id] = {"done": True, "count": total}
            save_state(STATE)
            return total
        pages += 1
        if max_pages and pages >= max_pages:
            log(f"  {name}[{league}] reached max_pages={max_pages}; stopping (kept newest {total})")
            STATE[task_id] = {"done": True, "count": total, "capped": True}
            save_state(STATE)
            return total
        cursor = nxt
        STATE[task_id] = {"done": False, "cursor": cursor, "count": total}
        save_state(STATE)

# ----------------------------- discovery helpers -----------------------------
def read_field_values(league, name, fields):
    fp = outfile(league, name)
    vals = {f: set() for f in fields}
    if not os.path.exists(fp):
        return vals
    for line in open(fp):
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except Exception:
            continue
        for f in fields:
            v = rec.get(f)
            if v is not None:
                vals[f].add(v)
    return vals

def ids_from(league, name, id_field="id"):
    return sorted(read_field_values(league, name, [id_field])[id_field], reverse=True)

# ----------------------------- league configs -----------------------------
# European soccer only (NFL/NCAAF, MLS [US], FIFA World Cup [intl] intentionally excluded)
SOCCER = [
    ("epl", "/epl/v2"),
    ("laliga", "/laliga/v1"),
    ("bundesliga", "/bundesliga/v1"),
    ("seriea", "/seriea/v1"),
    ("ligue1", "/ligue1/v1"),
    ("ucl", "/ucl/v1"),
]

SOCCER_MATCH_ENDPOINTS = [
    "match_events", "match_lineups", "player_match_stats", "team_match_stats",
    "match_shots", "match_momentum", "match_best_players", "match_avg_positions",
    "match_heatmaps", "match_pregame_forms",
]
FIFA_MATCH_ENDPOINTS = [
    "match_lineups", "match_events", "player_match_stats", "team_match_stats",
    "match_shots", "match_momentum", "match_best_players", "match_avg_positions",
    "match_team_form",
]

def batched(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]

# Match-detail endpoints ordered by value for building PLAYER PROFILES.
PLAYER_DETAIL_ORDER = [
    "player_match_stats",   # per-player per-match box score  (most important)
    "match_lineups",        # starters/subs, position, jersey, minutes
    "match_events",         # goals / assists / cards / subs (embeds players)
    "match_shots",          # per-shot, per-player
    "match_heatmaps",       # per-player positional heatmaps
    "match_avg_positions",  # per-player average position
    "match_best_players",   # standout player ratings
    "team_match_stats",     # team context per match
    "match_momentum",       # momentum timeline
    "match_pregame_forms",  # pre-match form
]

def played_match_ids(lg):
    """Return match ids that have actually been played (have scores), most recent first.
    Avoids spending the tiny request budget on unplayed/future fixtures."""
    fp = outfile(lg, "matches")
    rows = []
    if not os.path.exists(fp):
        return []
    for line in open(fp):
        line = line.strip()
        if not line:
            continue
        try:
            m = json.loads(line)
        except Exception:
            continue
        if m.get("home_score") is None and m.get("away_score") is None:
            continue  # unplayed
        rows.append((m.get("date") or "", m.get("id")))
    rows.sort(reverse=True)  # newest date first
    seen, out = set(), []
    for _, mid in rows:
        if mid is not None and mid not in seen:
            seen.add(mid); out.append(mid)
    return out

# ----------------------------- phase plan -----------------------------
def phaseA_prereq():
    """Match lists (needed to enumerate match ids) + tiny team/standings reference."""
    log("=== PHASE A: match lists + team reference (prereq for match detail) ===")
    for lg, pre in SOCCER:
        run_task(f"{lg}:teams", lg, "teams", f"{pre}/teams", paginate=False)
        run_task(f"{lg}:standings", lg, "standings", f"{pre}/standings", paginate=False)
    for lg, pre in SOCCER:
        run_task(f"{lg}:matches", lg, "matches", f"{pre}/matches", max_pages=MAX_MATCH_PAGES)

def phaseB_match_detail():
    """The focus: match-level player data, endpoint-by-endpoint, recent matches first.
    Iterate by endpoint priority OUTERMOST so player_match_stats is captured across all
    leagues before moving to the next endpoint type."""
    log("=== PHASE B: match-level player detail (recent-first, round-robin leagues) ===")
    pre_by_lg = dict(SOCCER)
    mids_by_lg = {lg: played_match_ids(lg) for lg, _ in SOCCER}
    batches_by_lg = {lg: list(batched(mids_by_lg[lg], BATCH)) for lg in mids_by_lg}
    for lg in mids_by_lg:
        log(f"  {lg}: {len(mids_by_lg[lg])} played matches -> {len(batches_by_lg[lg])} batches")
    max_b = max((len(b) for b in batches_by_lg.values()), default=0)
    # Endpoint priority outermost; within an endpoint, round-robin batch index across
    # all leagues so the newest matches of EVERY league are enriched before older ones.
    for ep in PLAYER_DETAIL_ORDER:
        log(f"--- endpoint: {ep} ---")
        for bi in range(max_b):
            for lg, pre in SOCCER:
                bl = batches_by_lg[lg]
                if bi < len(bl):
                    run_task(f"{lg}:{ep}:b{bi}", lg, ep, f"{pre}/{ep}", {"match_ids": bl[bi]})

def phaseC_reference():
    """Lowest priority: bulk player lists, rosters, per-season standings/teams, injuries."""
    log("=== PHASE C: reference data (low priority) ===")
    for lg, pre in SOCCER:
        run_task(f"{lg}:players", lg, "players", f"{pre}/players")
        run_task(f"{lg}:player_injuries", lg, "player_injuries", f"{pre}/player_injuries")
    for lg, pre in SOCCER:
        seasons = sorted(read_field_values(lg, "matches", ["season"])["season"], reverse=True)
        team_ids = ids_from(lg, "teams")
        cur = seasons[0] if seasons else None
        for tid in team_ids:
            params = {"team_id": tid}
            if cur is not None:
                params["season"] = cur
            run_task(f"{lg}:roster:{tid}:{cur}", lg, "rosters", f"{pre}/rosters", params, paginate=False)
        for s in seasons:
            run_task(f"{lg}:standings:{s}", lg, f"standings_s{s}", f"{pre}/standings", {"season": s}, paginate=False)
            run_task(f"{lg}:teams:{s}", lg, f"teams_s{s}", f"{pre}/teams", {"season": s}, paginate=False)

def main():
    start = time.time()
    log(f"#### scrape start (pid {os.getpid()}) ####")
    try:
        phaseA_prereq()
        phaseB_match_detail()
        phaseC_reference()
        log("#### ALL PHASES COMPLETE ####")
    except KeyboardInterrupt:
        log("interrupted")
    except Exception:
        log("FATAL:\n" + traceback.format_exc())
    log(f"#### scrape stopped after {(time.time()-start)/60:.1f} min ####")

if __name__ == "__main__":
    main()
