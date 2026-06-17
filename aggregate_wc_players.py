#!/usr/bin/env python3
"""Build aggregated World Cup player stats from ingested raw data.

Reads:
  scout/public/worldcup/players.json
  scout/public/worldcup/rosters.json
  scout/public/worldcup/matches/*.json

Writes:
  scout/public/worldcup/players_agg.json
"""

import json
import os
from pathlib import Path
from collections import defaultdict
from datetime import datetime

OUT = Path("scout/public/worldcup/players_agg.json")
MATCHES_DIR = Path("scout/public/worldcup/matches")


def load_json(path: Path):
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data.get("data", data)


def main():
    players = load_json(Path("scout/public/worldcup/players.json"))
    rosters = load_json(Path("scout/public/worldcup/rosters.json"))
    if players is None or rosters is None:
        print("[!] players.json or rosters.json missing — run wc_ingest.py first")
        return

    # Build player lookup
    player_by_id: dict[int, dict] = {p["id"]: p for p in players}

    # Build roster lookup (team_id per player + basic cumulative)
    roster_by_pid: dict[int, dict] = {}
    for r in rosters:
        pid = r["player"]["id"]
        roster_by_pid[pid] = r

    # Accumulate match stats
    agg: dict[int, dict] = defaultdict(lambda: {
        "matches": set(),
        "expected_goals": 0.0,
        "expected_assists": 0.0,
        "shots_on_target": 0,
        "passes_total": 0,
        "passes_accurate": 0,
        "key_passes": 0,
        "long_balls_total": 0,
        "long_balls_accurate": 0,
        "crosses_total": 0,
        "crosses_accurate": 0,
        "dribbles_attempted": 0,
        "dribbles_completed": 0,
        "tackles": 0,
        "tackles_won": 0,
        "interceptions": 0,
        "clearances": 0,
        "blocked_shots": 0,
        "duels_won": 0,
        "duels_lost": 0,
        "aerial_duels_won": 0,
        "aerial_duels_lost": 0,
        "fouls_committed": 0,
        "was_fouled": 0,
        "touches": 0,
        "possession_lost": 0,
        "ball_recoveries": 0,
        "big_chances_created": 0,
        "big_chances_missed": 0,
        "saves": 0,
        "saves_inside_box": 0,
        "punches": 0,
        "high_claims": 0,
    })

    if MATCHES_DIR.exists():
        for match_file in MATCHES_DIR.glob("*.json"):
            data = load_json(match_file)
            if not data:
                continue
            pms = data.get("player_match_stats")
            if pms and isinstance(pms, dict):
                for row in pms.get("data", []):
                    pid = row.get("player_id")
                    if pid is None:
                        continue
                    a = agg[pid]
                    a["matches"].add(row.get("match_id"))
                    for k in a.keys():
                        if k == "matches":
                            continue
                        v = row.get(k)
                        if isinstance(v, (int, float)):
                            a[k] += v

    # Build output
    out_rows = []
    now = datetime.now()
    for pid, p in player_by_id.items():
        r = roster_by_pid.get(pid, {})
        a = agg[pid]
        apps = r.get("appearances", len(a["matches"]))
        mins = r.get("minutes_played", 0)
        dob_str = p.get("date_of_birth")
        age = None
        if dob_str:
            try:
                dob = datetime.fromisoformat(dob_str.replace("Z", "+00:00"))
                age = now.year - dob.year - ((now.month, now.day) < (dob.month, dob.day))
            except Exception:
                pass
        out_rows.append({
            "player": p,
            "team_id": r.get("team_id"),
            "team_abbreviation": None,  # filled by client lookup
            "age": age,
            "appearances": apps,
            "starts": r.get("starts", 0),
            "minutes_played": mins,
            "goals": r.get("goals", 0),
            "assists": r.get("assists", 0),
            "yellow_cards": r.get("yellow_cards", 0),
            "red_cards": r.get("red_cards", 0),
            "avg_rating": r.get("avg_rating"),
            "expected_goals": round(a["expected_goals"], 2),
            "expected_assists": round(a["expected_assists"], 2),
            "shots_on_target": a["shots_on_target"],
            "passes_total": a["passes_total"],
            "passes_accurate": a["passes_accurate"],
            "key_passes": a["key_passes"],
            "tackles": a["tackles"],
            "interceptions": a["interceptions"],
            "clearances": a["clearances"],
            "duels_won": a["duels_won"],
            "duels_lost": a["duels_lost"],
            "aerial_duels_won": a["aerial_duels_won"],
            "aerial_duels_lost": a["aerial_duels_lost"],
            "fouls_committed": a["fouls_committed"],
            "was_fouled": a["was_fouled"],
            "touches": a["touches"],
            "possession_lost": a["possession_lost"],
            "ball_recoveries": a["ball_recoveries"],
            "big_chances_created": a["big_chances_created"],
            "big_chances_missed": a["big_chances_missed"],
            "saves": a["saves"],
            "saves_inside_box": a["saves_inside_box"],
            "dribbles_attempted": a["dribbles_attempted"],
            "dribbles_completed": a["dribbles_completed"],
            "crosses_total": a["crosses_total"],
            "crosses_accurate": a["crosses_accurate"],
            "long_balls_total": a["long_balls_total"],
            "long_balls_accurate": a["long_balls_accurate"],
            "blocked_shots": a["blocked_shots"],
            "punches": a["punches"],
            "high_claims": a["high_claims"],
            # Per-match averages
            "minutes_per_match": round(mins / max(apps, 1), 1),
            "goals_per_match": round(r.get("goals", 0) / max(apps, 1), 2),
            "assists_per_match": round(r.get("assists", 0) / max(apps, 1), 2),
            "xg_per_match": round(a["expected_goals"] / max(apps, 1), 2),
            "xa_per_match": round(a["expected_assists"] / max(apps, 1), 2),
            "key_passes_per_match": round(a["key_passes"] / max(apps, 1), 2),
            "shots_on_target_per_match": round(a["shots_on_target"] / max(apps, 1), 2),
            "tackles_per_match": round(a["tackles"] / max(apps, 1), 2),
            "saves_per_match": round(a["saves"] / max(apps, 1), 2),
        })

    out_rows.sort(key=lambda x: x["minutes_played"], reverse=True)

    OUT.write_text(json.dumps({"data": out_rows}, indent=2), encoding="utf-8")
    print(f"[aggregate] wrote {len(out_rows)} players to {OUT}")


if __name__ == "__main__":
    main()
