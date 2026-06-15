#!/usr/bin/env python3
"""Per-player recent match log (current season) for SCOUT player profiles.
Output: scout/public/matchlog.json keyed by "<player_id>-<league>" ->
list of up to 12 most recent matches: {date, opp, comp, venue, mins, g, a, rating}."""
import json, os
from collections import defaultdict

LEAGUES = [("epl", "EPL"), ("laliga", "La Liga"), ("bundesliga", "Bundesliga"),
           ("seriea", "Serie A"), ("ligue1", "Ligue 1"), ("ucl", "UCL")]
CURRENT_SEASON = 2025
MAX_MATCHES = 12

out = defaultdict(list)
for lg, lgname in LEAGUES:
    teams = {}
    tf = f"data/{lg}/teams.jsonl"
    if os.path.exists(tf):
        for l in open(tf):
            t = json.loads(l)
            teams[t["id"]] = t.get("short_name") or t.get("name")
    matches = {}
    mf = f"data/{lg}/matches.jsonl"
    if os.path.exists(mf):
        for l in open(mf):
            m = json.loads(l)
            if m.get("season") != CURRENT_SEASON:
                continue
            matches[m["id"]] = m
    pf = f"data/{lg}/player_match_stats.jsonl"
    if not os.path.exists(pf):
        continue
    rows = defaultdict(list)
    for l in open(pf):
        r = json.loads(l)
        if r.get("rating") is None:
            continue
        m = matches.get(r.get("match_id"))
        if not m:
            continue
        tid = r.get("team_id")
        home, away = m.get("home_team_id"), m.get("away_team_id")
        if tid == home:
            opp, venue = teams.get(away, "?"), "H"
            gf, ga = m.get("home_score"), m.get("away_score")
        else:
            opp, venue = teams.get(home, "?"), "A"
            gf, ga = m.get("away_score"), m.get("home_score")
        rows[r["player_id"]].append({
            "date": (m.get("date") or "")[:10],
            "opp": opp, "comp": lgname, "venue": venue,
            "score": f"{gf}-{ga}" if gf is not None else "",
            "mins": r.get("minutes_played") or 0,
            "g": r.get("goals") or 0, "a": r.get("assists") or 0,
            "rating": r.get("rating"),
        })
    for pid, lst in rows.items():
        lst.sort(key=lambda x: x["date"], reverse=True)
        out[f"{pid}-{lgname}"] = lst[:MAX_MATCHES]

os.makedirs("scout/public", exist_ok=True)
json.dump(out, open("scout/public/matchlog.json", "w"), separators=(",", ":"))
print(f"wrote scout/public/matchlog.json: {len(out)} player-league logs")
print("size:", os.path.getsize("scout/public/matchlog.json"), "bytes")
