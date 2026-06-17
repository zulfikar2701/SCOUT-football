#!/usr/bin/env python3
"""World Cup 2026 data ingestion — fetch everything while GOAT tier access lasts.

Respects 5 req/min rate limit. Safe to interrupt and resume.
Output: scout/public/worldcup/ static JSON files.
"""

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("BALLDONTLIE_KEY")
if not API_KEY:
    raise RuntimeError("BALLDONTLIE_KEY not set in environment")

SEASON = os.getenv("WC_SEASON", "2026")
BASE = os.getenv("WC_API_BASE", "https://api.balldontlie.io")
OUT_DIR = Path(os.getenv("WC_OUTPUT_DIR", "scout/public/worldcup"))
STATE_FILE = Path("_ingest_state.json")

HEADERS = {"Authorization": API_KEY}
RATE_DELAY = 12.5  # seconds between requests for 5 req/min ceiling


def _req(path: str, params: dict | None = None) -> dict | list:
    url = f"{BASE}{path}"
    time.sleep(RATE_DELAY)
    r = requests.get(url, headers=HEADERS, params=params or {}, timeout=60)
    if r.status_code == 429:
        retry = int(r.headers.get("retry-after", 60))
        print(f"  [429] rate limited, sleeping {retry}s")
        time.sleep(retry)
        return _req(path, params)
    r.raise_for_status()
    return r.json()


def load_state() -> dict:
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"completed_match_ids": [], "players_done": False, "rosters_done": False}


def save_state(state: dict):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def fetch_teams():
    print("[ingest] teams …")
    data = _req("/fifa/worldcup/v1/teams")
    (OUT_DIR / "teams.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"  -> {len(data.get('data', data))} teams")


def fetch_stadiums():
    print("[ingest] stadiums …")
    data = _req("/fifa/worldcup/v1/stadiums")
    (OUT_DIR / "stadiums.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"  -> {len(data.get('data', data))} stadiums")


def fetch_group_standings():
    print("[ingest] group_standings …")
    data = _req("/fifa/worldcup/v1/group_standings")
    (OUT_DIR / "standings.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"  -> {len(data.get('data', data))} groups")


def fetch_matches() -> list[dict]:
    print("[ingest] matches (cursor pagination) …")
    all_matches = []
    cursor = None
    while True:
        params = {"per_page": 100, "season": SEASON}
        if cursor:
            params["cursor"] = cursor
        data = _req("/fifa/worldcup/v1/matches", params)
        batch = data.get("data", [])
        all_matches.extend(batch)
        meta = data.get("meta", {})
        cursor = meta.get("next_cursor")
        print(f"  -> batch {len(batch)}, total so far {len(all_matches)}, next_cursor={cursor}")
        if not cursor:
            break
    (OUT_DIR / "matches.json").write_text(json.dumps({"data": all_matches}, indent=2), encoding="utf-8")
    print(f"  -> wrote {len(all_matches)} matches")
    return all_matches


def fetch_match_detail(match_id: str) -> dict:
    bundle = {}
    endpoints = [
        ("events", "/fifa/worldcup/v1/match_events"),
        ("shots", "/fifa/worldcup/v1/match_shots"),
        ("momentum", "/fifa/worldcup/v1/match_momentum"),
        ("best_players", "/fifa/worldcup/v1/match_best_players"),
        ("avg_positions", "/fifa/worldcup/v1/match_avg_positions"),
        ("lineups", "/fifa/worldcup/v1/match_lineups"),
        ("team_form", "/fifa/worldcup/v1/match_team_form"),
        ("team_match_stats", "/fifa/worldcup/v1/team_match_stats"),
        ("player_match_stats", "/fifa/worldcup/v1/player_match_stats"),
    ]
    for key, path in endpoints:
        try:
            data = _req(f"{path}", {"match_id": match_id})
            bundle[key] = data
        except Exception as e:
            print(f"  [!] {key} failed for match {match_id}: {e}")
            bundle[key] = None
    return bundle


def ingest_match_details(matches: list[dict], state: dict):
    completed = set(state.get("completed_match_ids", []))
    targets = [m for m in matches if m.get("status") == "completed" and m.get("id") not in completed]
    scheduled_live = [m for m in matches if m.get("status") in ("scheduled", "in_progress")]

    print(f"[ingest] match details: {len(targets)} completed to fetch, {len(scheduled_live)} scheduled/live to refresh")

    for m in targets:
        mid = m["id"]
        print(f"  match {mid} …")
        bundle = fetch_match_detail(mid)
        (OUT_DIR / "matches" / f"{mid}.json").write_text(json.dumps(bundle, indent=2), encoding="utf-8")
        completed.add(mid)
        state["completed_match_ids"] = sorted(completed)
        save_state(state)

    for m in scheduled_live:
        mid = m["id"]
        print(f"  match {mid} (scheduled/live) refresh …")
        bundle = fetch_match_detail(mid)
        (OUT_DIR / "matches" / f"{mid}.json").write_text(json.dumps(bundle, indent=2), encoding="utf-8")


def fetch_players() -> list[dict]:
    print("[ingest] players (cursor pagination) …")
    all_players = []
    cursor = None
    while True:
        params = {"per_page": 100, "season": SEASON}
        if cursor:
            params["cursor"] = cursor
        data = _req("/fifa/worldcup/v1/players", params)
        batch = data.get("data", [])
        all_players.extend(batch)
        meta = data.get("meta", {})
        cursor = meta.get("next_cursor")
        print(f"  -> batch {len(batch)}, total so far {len(all_players)}, next_cursor={cursor}")
        if not cursor:
            break
    (OUT_DIR / "players.json").write_text(json.dumps({"data": all_players}, indent=2), encoding="utf-8")
    print(f"  -> wrote {len(all_players)} players")
    return all_players


def fetch_rosters():
    print("[ingest] rosters …")
    data = _req("/fifa/worldcup/v1/rosters", {"season": SEASON, "per_page": 100})
    # Cursor paginate if needed
    all_rosters = list(data.get("data", []))
    cursor = data.get("meta", {}).get("next_cursor")
    while cursor:
        data = _req("/fifa/worldcup/v1/rosters", {"season": SEASON, "per_page": 100, "cursor": cursor})
        all_rosters.extend(data.get("data", []))
        cursor = data.get("meta", {}).get("next_cursor")
        print(f"  -> rosters batch, total {len(all_rosters)}")
    (OUT_DIR / "rosters.json").write_text(json.dumps({"data": all_rosters}, indent=2), encoding="utf-8")
    print(f"  -> wrote {len(all_rosters)} roster entries")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "matches").mkdir(exist_ok=True)
    state = load_state()

    print("=" * 60)
    print("SCOUT World Cup 2026 Ingestion")
    print(f"Output: {OUT_DIR.resolve()}")
    print("=" * 60)

    fetch_teams()
    fetch_stadiums()
    fetch_group_standings()
    matches = fetch_matches()
    ingest_match_details(matches, state)

    if not state.get("players_done"):
        fetch_players()
        state["players_done"] = True
        save_state(state)

    if not state.get("rosters_done"):
        fetch_rosters()
        state["rosters_done"] = True
        save_state(state)

    print("=" * 60)
    print("Ingestion complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
