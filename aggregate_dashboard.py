#!/usr/bin/env python3
"""Aggregate per-player CURRENT-SEASON (2025/26) profiles for the dashboard.
A 'detailed' row = player_match_stats row with rating present (these carry the
rich stats). Sums treat missing as 0; rating is averaged over present values.
Position = most common lineup_position (G/D/M/F). Output: web/players.json"""
import json, os
from collections import defaultdict, Counter

LEAGUES = [("epl","EPL"),("laliga","La Liga"),("bundesliga","Bundesliga"),
           ("seriea","Serie A"),("ligue1","Ligue 1"),("ucl","UCL")]
POSNAME = {"G":"Goalkeeper","D":"Defender","M":"Midfielder","F":"Forward"}

def num(x):
    return x if isinstance(x,(int,float)) else 0

players_meta = {}
for lg,_ in LEAGUES:
    f=f"data/{lg}/players.jsonl"
    if os.path.exists(f):
        for l in open(f):
            p=json.loads(l)
            players_meta[p["id"]]={"name":p.get("display_name") or (f"{p.get('first_name','')} {p.get('last_name','')}").strip(),
                                   "age":p.get("age"),"foot":p.get("preferred_foot"),
                                   "nat":p.get("citizenship"),"dob":p.get("date_of_birth")}

SUM_FIELDS = ["minutes_played","goals","assists","shots_total","shots_on_target",
              "expected_goals","expected_assists","key_passes","big_chances_created",
              "big_chances_missed","crosses_accurate","dribbles_completed",
              "tackles","tackles_won","interceptions","clearances","blocked_shots",
              "duels_won","aerial_duels_won","ball_recoveries","passes_accurate",
              "passes_total","touches","fouls_committed","yellow_cards","red_cards"]

CURRENT_SEASON=2025
def event_agg(lg):
    """Per-player event-derived counts (current season) from match_events.jsonl:
    non-penalty goals, penalty goals, header/free-kick goals. Own goals excluded."""
    ev=defaultdict(lambda: defaultdict(int))
    mfp=f"data/{lg}/matches.jsonl"; cur=set()
    if os.path.exists(mfp):
        for l in open(mfp):
            m=json.loads(l)
            if m.get("season")==CURRENT_SEASON: cur.add(m.get("id"))
    efp=f"data/{lg}/match_events.jsonl"
    if not os.path.exists(efp): return ev
    for l in open(efp):
        e=json.loads(l)
        if e.get("match_id") not in cur: continue
        if e.get("event_type")!="goal" or e.get("is_own_goal"): continue
        p=e.get("player") or {}; pid=p.get("id")
        if pid is None: continue
        gt=e.get("goal_type")
        if gt=="penalty": ev[pid]["pen_goals"]+=1
        else:
            ev[pid]["np_goals"]+=1
            if gt=="header": ev[pid]["header_goals"]+=1
            elif gt=="free_kick": ev[pid]["fk_goals"]+=1
    return ev

out=[]
for lg,lgname in LEAGUES:
    teams={}
    tf=f"data/{lg}/teams.jsonl"
    if os.path.exists(tf):
        for l in open(tf):
            t=json.loads(l); teams[t["id"]]=t.get("name") or t.get("short_name")
    evagg=event_agg(lg)
    agg=defaultdict(lambda: defaultdict(float))
    ratings=defaultdict(list); pos=defaultdict(Counter); team=defaultdict(Counter); matches=defaultdict(int)
    pf=f"data/{lg}/player_match_stats.jsonl"
    if not os.path.exists(pf): continue
    for l in open(pf):
        r=json.loads(l)
        if r.get("rating") is None:   # restrict to detailed (current-season) rows
            continue
        pid=r.get("player_id")
        matches[pid]+=1
        ratings[pid].append(r["rating"])
        if r.get("lineup_position"): pos[pid][r["lineup_position"]]+=1
        if r.get("team_id") in teams: team[pid][teams[r["team_id"]]]+=1
        for k in SUM_FIELDS:
            agg[pid][k]+=num(r.get(k))
    for pid,d in agg.items():
        if matches[pid]<3:   # minimum sample
            continue
        meta=players_meta.get(pid,{})
        p=pos[pid].most_common(1)
        rec={
            "id":pid,"name":meta.get("name") or f"#{pid}","league":lgname,
            "pos":POSNAME.get(p[0][0],"?") if p else "?",
            "team":team[pid].most_common(1)[0][0] if team[pid] else "",
            "age":meta.get("age"),"foot":meta.get("foot"),"nat":meta.get("nat"),
            "matches":matches[pid],
            "minutes":round(d["minutes_played"]),
            "rating":round(sum(ratings[pid])/len(ratings[pid]),2) if ratings[pid] else None,
            # creating
            "xa":round(d["expected_assists"],2),"key_passes":round(d["key_passes"]),
            "assists":round(d["assists"]),"big_chances_created":round(d["big_chances_created"]),
            "crosses_acc":round(d["crosses_accurate"]),
            # attacking
            "goals":round(d["goals"]),"shots":round(d["shots_total"]),
            "shots_on_t":round(d["shots_on_target"]),"xg":round(d["expected_goals"],2),
            "dribbles":round(d["dribbles_completed"]),"big_chances_missed":round(d["big_chances_missed"]),
            # attacking — event-derived (current season match_events)
            "np_goals":evagg[pid]["np_goals"],"pen_goals":evagg[pid]["pen_goals"],
            "header_goals":evagg[pid]["header_goals"],"fk_goals":evagg[pid]["fk_goals"],
            # defending
            "tackles":round(d["tackles"]),"tackles_won":round(d["tackles_won"]),
            "interceptions":round(d["interceptions"]),"clearances":round(d["clearances"]),
            "blocked_shots":round(d["blocked_shots"]),"duels_won":round(d["duels_won"]),
            "aerials_won":round(d["aerial_duels_won"]),"recoveries":round(d["ball_recoveries"]),
            # general extra
            "passes_acc":round(d["passes_accurate"]),"touches":round(d["touches"]),
            "yellow":round(d["yellow_cards"]),"red":round(d["red_cards"]),
        }
        out.append(rec)

out.sort(key=lambda r:(r["league"],-(r["rating"] or 0)))
os.makedirs("web",exist_ok=True)
json.dump(out, open("web/players.json","w"), separators=(",",":"))
print(f"wrote web/players.json: {len(out)} players")
from collections import Counter as C
print("by league:", dict(C(r["league"] for r in out)))
print("by position:", dict(C(r["pos"] for r in out)))
print("size:", os.path.getsize("web/players.json"),"bytes")
