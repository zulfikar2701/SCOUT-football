#!/usr/bin/env python3
"""
Focused scraper for the newly-unlocked endpoints (all-access key):
  - team_match_stats  (fast: ~2 rows/match)
  - match_events      (slow: ~16 events/match; carries assist provider, goal type)

European soccer, all 6 leagues. Throttled to the key's 5 req / 60s window
(reads x-ratelimit-* headers). Resume is driven by the OUTPUT FILES themselves:
on startup we read which match_ids are already saved and skip them, so restarts
never duplicate and never lose work.

Ordering maximises dashboard value: CURRENT season (2025) for all leagues first
(both endpoints), then historical backfill.

Data layout (append-only JSONL, deduped at export time):
  data/<league>/match_events.jsonl
  data/<league>/team_match_stats.jsonl
  scrape_new.log
"""
import json, os, time, urllib.parse, urllib.request, urllib.error

KEY = os.environ.get("BALLDONTLIE_KEY")
if not KEY:
    raise SystemExit("Set the BALLDONTLIE_KEY environment variable with your balldontlie API key.")
BASE = "https://api.balldontlie.io"
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
LOG_PATH = os.path.join(ROOT, "scrape_new.log")
PER_PAGE = 100
CURRENT_SEASON = 2025

SOCCER = [
    ("epl", "/epl/v2"),
    ("laliga", "/laliga/v1"),
    ("bundesliga", "/bundesliga/v1"),
    ("seriea", "/seriea/v1"),
    ("ligue1", "/ligue1/v1"),
    ("ucl", "/ucl/v1"),
]

BATCH = {"team_match_stats": 40, "match_events": 6}

# (endpoint, season-scope) in priority order
PHASES = [
    ("team_match_stats", "current"),
    ("match_events", "current"),
    ("team_match_stats", "history"),
    ("match_events", "history"),
]


def log(msg):
    line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")


class Lim:
    remaining = None
    reset = None


def _throttle():
    if Lim.remaining is not None and Lim.remaining <= 0 and Lim.reset:
        wait = Lim.reset - time.time() + 1.0
        if wait > 0:
            log(f"  budget exhausted; sleeping {wait:.0f}s")
            time.sleep(wait)


def _upd(hdr):
    try:
        rem = hdr.get("x-ratelimit-remaining")
        rst = hdr.get("x-ratelimit-reset")
        if rem is not None:
            Lim.remaining = int(rem)
        if rst is not None:
            Lim.reset = int(rst)
    except Exception:
        pass


def fetch(path, params):
    qs = urllib.parse.urlencode(params, doseq=True)
    url = f"{BASE}{path}?{qs}"
    attempt = 0
    while True:
        _throttle()
        attempt += 1
        req = urllib.request.Request(url, headers={"Authorization": KEY})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                _upd(r.headers)
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            _upd(e.headers)
            code = e.code
            if code == 429:
                ra = e.headers.get("retry-after")
                wait = int(ra) + 1 if (ra and ra.isdigit()) else (
                    max(1, Lim.reset - time.time() + 1) if Lim.reset else 31)
                log(f"  429 {path}; sleep {wait:.0f}s")
                time.sleep(wait)
                continue
            if code in (500, 502, 503, 504) and attempt <= 5:
                log(f"  {code} server error {path}; retry 5s")
                time.sleep(5)
                continue
            body = b""
            try:
                body = e.read()[:160]
            except Exception:
                pass
            log(f"  HTTP {code} {path} -> skip ({body!r})")
            return {"__error__": code}
        except Exception as e:
            if attempt <= 5:
                log(f"  net error {path}: {e}; retry 5s")
                time.sleep(5)
                continue
            log(f"  give up {path}: {e}")
            return {"__error__": "net"}


def load_matches(league):
    """Return list of (date, id, season) for played matches."""
    fp = os.path.join(DATA, league, "matches.jsonl")
    out = []
    if not os.path.exists(fp):
        return out
    for line in open(fp):
        line = line.strip()
        if not line:
            continue
        try:
            m = json.loads(line)
        except Exception:
            continue
        if m.get("home_score") is None and m.get("away_score") is None:
            continue
        out.append((m.get("date") or "", m.get("id"), m.get("season")))
    return out


def saved_match_ids(league, endpoint):
    """Set of match_ids already present in the endpoint's output file."""
    fp = os.path.join(DATA, league, endpoint + ".jsonl")
    done = set()
    if not os.path.exists(fp):
        return done
    for line in open(fp):
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        mid = r.get("match_id")
        if mid is not None:
            done.add(mid)
    return done


def target_ids(matches, scope, done):
    """Ordered (newest-first) match ids for the scope, excluding already-saved."""
    if scope == "current":
        sel = [t for t in matches if t[2] == CURRENT_SEASON]
    else:
        sel = [t for t in matches if t[2] != CURRENT_SEASON]
    sel.sort(reverse=True)  # newest date first
    seen, out = set(), []
    for _, mid, _s in sel:
        if mid is None or mid in seen or mid in done:
            continue
        seen.add(mid)
        out.append(mid)
    return out


def batched(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def fetch_batch(prefix, endpoint, match_ids):
    out, cursor = [], None
    while True:
        params = [("match_ids[]", m) for m in match_ids]
        params.append(("per_page", PER_PAGE))
        if cursor is not None:
            params.append(("cursor", cursor))
        d = fetch(f"{prefix}/{endpoint}", params)
        if not isinstance(d, dict) or "__error__" in d:
            return out, False
        out.extend(d.get("data", []) or [])
        cursor = (d.get("meta") or {}).get("next_cursor")
        if not cursor:
            return out, True


def run_phase(endpoint, scope):
    bs = BATCH[endpoint]
    for league, prefix in SOCCER:
        matches = load_matches(league)
        done = saved_match_ids(league, endpoint)
        todo = target_ids(matches, scope, done)
        tag = f"{league}:{endpoint}:{scope}"
        if not todo:
            log(f"[{tag}] nothing to do ({len(done)} already saved)")
            continue
        fp = os.path.join(DATA, league, endpoint + ".jsonl")
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        log(f"[{tag}] {len(todo)} matches to fetch ({len(done)} already saved)")
        n = 0
        for batch in batched(todo, bs):
            recs, _ok = fetch_batch(prefix, endpoint, batch)
            if recs:
                with open(fp, "a") as f:
                    for r in recs:
                        f.write(json.dumps(r, separators=(",", ":")) + "\n")
            n += len(batch)
            if n % 600 < bs:
                log(f"[{tag}] {n}/{len(todo)} (+{len(recs)} rows last batch)")
        log(f"[{tag}] DONE ({n} matches)")


def main():
    log(f"#### scrape_new start pid {os.getpid()} ####")
    for endpoint, scope in PHASES:
        log(f"==== PHASE: {endpoint} / {scope} ====")
        run_phase(endpoint, scope)
    log("#### scrape_new finished ####")


if __name__ == "__main__":
    main()
