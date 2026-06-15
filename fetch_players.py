#!/usr/bin/env python3
"""Free-tier (5/min) collection of bulk player lists + injuries for all 6 European
leagues, to attach names/bio to the player_ids in player_match_stats. Resumable."""
import scrape

scrape.log("#### fetch_players start ####")
try:
    for lg, pre in scrape.SOCCER:
        scrape.run_task(f"{lg}:players", lg, "players", f"{pre}/players")
        scrape.run_task(f"{lg}:player_injuries", lg, "player_injuries", f"{pre}/player_injuries")
    scrape.log("#### fetch_players DONE ####")
except KeyboardInterrupt:
    scrape.log("fetch_players interrupted")
