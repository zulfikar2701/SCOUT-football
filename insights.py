#!/usr/bin/env python3
"""Bonus insight: current-season U23 chance creators per league.
Uses player_match_stats rows where advanced creation metrics (xA / key_passes)
are populated (these fall in the current 2025/26 season), joined to roster age.
Writes exports/insights/u23_chance_creators.md + .csv."""
import json, os, csv
from collections import defaultdict

LEAGUES = ('epl', 'laliga', 'bundesliga', 'seriea', 'ligue1', 'ucl')
OUT = "exports/insights"
os.makedirs(OUT, exist_ok=True)

rows_csv = []
md = ["# Current-season U23 chance creators (per league)\n",
      "Built from `player_match_stats` rows that carry advanced creation metrics "
      "(expected assists / key passes) — these fall in the **2025/26** season. "
      "U23 = roster `age` <= 23 (valid for current season). Ranked by xA.\n"]

for lg in LEAGUES:
    age = {}; name = {}
    pf = f"data/{lg}/players.jsonl"
    if os.path.exists(pf):
        for l in open(pf):
            p = json.loads(l); age[p['id']] = p.get('age')
            name[p['id']] = p.get('display_name') or (f"{p.get('first_name','')} {p.get('last_name','')}").strip()
    agg = defaultdict(lambda: defaultdict(float))
    for l in open(f"data/{lg}/player_match_stats.jsonl"):
        r = json.loads(l)
        if not r.get('appearances'):
            continue
        kp = r.get('key_passes'); xa = r.get('expected_assists')
        if kp is None and xa is None:
            continue  # restrict to covered (current-season) rows
        pid = r.get('player_id')
        agg[pid]['matches'] += 1
        agg[pid]['xa'] += xa or 0
        agg[pid]['key_passes'] += kp or 0
        agg[pid]['assists'] += r.get('assists') or 0
    ranked = []
    for pid, d in agg.items():
        a = age.get(pid)
        if a is None or a > 23:
            continue
        if d['matches'] < 5:
            continue  # minimum sample
        ranked.append((d['xa'], pid, d))
    ranked.sort(reverse=True)
    md.append(f"\n## {lg.upper()}\n")
    md.append("| # | player | age | matches | xA | key passes | assists |")
    md.append("|---:|---|---:|---:|---:|---:|---:|")
    for i, (xa, pid, d) in enumerate(ranked[:10], 1):
        nm = name.get(pid, str(pid))
        md.append(f"| {i} | {nm} | {age.get(pid)} | {int(d['matches'])} | "
                  f"{d['xa']:.2f} | {int(d['key_passes'])} | {int(d['assists'])} |")
        rows_csv.append({"league": lg, "rank": i, "player": nm, "age": age.get(pid),
                         "matches": int(d['matches']), "xa": round(d['xa'], 2),
                         "key_passes": int(d['key_passes']), "assists": int(d['assists'])})

open(f"{OUT}/u23_chance_creators.md", "w").write("\n".join(md) + "\n")
with open(f"{OUT}/u23_chance_creators.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["league", "rank", "player", "age", "matches", "xa", "key_passes", "assists"])
    w.writeheader(); w.writerows(rows_csv)
print(f"wrote {OUT}/u23_chance_creators.md and .csv ({len(rows_csv)} rows)")
