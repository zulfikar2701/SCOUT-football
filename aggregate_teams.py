#!/usr/bin/env python3
"""Aggregate per-team, current-season (2025) profiles from team_match_stats.jsonl,
joined to matches.jsonl for goals/points. Pairs the two rows of a match to derive
'against' metrics (xG against, shots against). Output: web/teams.json"""
import json, os
from collections import defaultdict

LEAGUES = [("epl","EPL"),("laliga","La Liga"),("bundesliga","Bundesliga"),
           ("seriea","Serie A"),("ligue1","Ligue 1"),("ucl","UCL")]
SEASON = 2025

def num(x):
    return x if isinstance(x,(int,float)) else 0

# average-style fields (mean over matches); the rest are summed then per-match'd
AVG_FIELDS = ["possession_pct","pass_accuracy_pct"]
SUM_FIELDS = ["shots","shots_on_target","expected_goals","corners","passes",
              "big_chances","fouls","yellow_cards","red_cards","crosses_total",
              "crosses_accurate","long_balls_total","long_balls_accurate",
              "ground_duels_won","ground_duels_total","aerial_duels_won",
              "aerial_duels_total","dribbles_completed","dribbles_total",
              "tackles","interceptions","clearances","saves","offsides"]

out=[]
for lg,lgname in LEAGUES:
    tms={}
    tf=f"data/{lg}/teams.jsonl"
    if os.path.exists(tf):
        for l in open(tf):
            t=json.loads(l); tms[t["id"]]=t.get("name") or t.get("short_name")
    mfp=f"data/{lg}/matches.jsonl"
    minfo={}
    if os.path.exists(mfp):
        for l in open(mfp):
            m=json.loads(l)
            minfo[m["id"]]={"season":m.get("season"),"h":m.get("home_team_id"),
                "a":m.get("away_team_id"),"hs":m.get("home_score"),"as":m.get("away_score")}
    sfp=f"data/{lg}/team_match_stats.jsonl"
    if not os.path.exists(sfp): continue
    # group rows by match for pairing
    by_match=defaultdict(list)
    for l in open(sfp):
        r=json.loads(l)
        mi=minfo.get(r.get("match_id"))
        if not mi or mi["season"]!=SEASON: continue
        by_match[r["match_id"]].append(r)

    agg=defaultdict(lambda: defaultdict(float))
    avg=defaultdict(lambda: defaultdict(list))
    mp=defaultdict(int); gf=defaultdict(int); ga=defaultdict(int)
    w=defaultdict(int); d=defaultdict(int); ls=defaultdict(int)
    xga=defaultdict(float); shots_ag=defaultdict(float)
    for mid,rows in by_match.items():
        mi=minfo[mid]
        for r in rows:
            tid=r.get("team_id")
            if tid is None: continue
            mp[tid]+=1
            for k in SUM_FIELDS: agg[tid][k]+=num(r.get(k))
            for k in AVG_FIELDS:
                v=r.get(k)
                if isinstance(v,(int,float)): avg[tid][k].append(v)
            # opponent rows in same match -> against metrics
            for o in rows:
                if o is r: continue
                xga[tid]+=num(o.get("expected_goals"))
                shots_ag[tid]+=num(o.get("shots"))
            # goals for/against + result from the score
            if mi["hs"] is not None and mi["as"] is not None:
                if tid==mi["h"]: my,opp=mi["hs"],mi["as"]
                elif tid==mi["a"]: my,opp=mi["as"],mi["hs"]
                else: my=opp=None
                if my is not None:
                    gf[tid]+=my; ga[tid]+=opp
                    if my>opp: w[tid]+=1
                    elif my==opp: d[tid]+=1
                    else: ls[tid]+=1
    for tid,n in mp.items():
        if n<3: continue
        def pm(k): return round(agg[tid][k]/n,2)
        def mean(k): return round(sum(avg[tid][k])/len(avg[tid][k]),1) if avg[tid][k] else None
        rec={
            "id":tid,"team":tms.get(tid,f"#{tid}"),"league":lgname,"matches":n,
            "points":w[tid]*3+d[tid],"w":w[tid],"d":d[tid],"l":ls[tid],
            "gf":gf[tid],"ga":ga[tid],"gd":gf[tid]-ga[tid],
            "possession":mean("possession_pct"),"pass_acc":mean("pass_accuracy_pct"),
            "xg":round(agg[tid]["expected_goals"],1),"xga":round(xga[tid],1),
            "xgd":round(agg[tid]["expected_goals"]-xga[tid],1),
            "shots_pm":pm("shots"),"shots_ag_pm":round(shots_ag[tid]/n,2),
            "sot_pm":pm("shots_on_target"),"corners_pm":pm("corners"),
            "big_ch_pm":pm("big_chances"),"passes_pm":pm("passes"),
            "tackles_pm":pm("tackles"),"interceptions_pm":pm("interceptions"),
            "clearances_pm":pm("clearances"),"saves_pm":pm("saves"),
            "fouls_pm":pm("fouls"),"yellow_pm":pm("yellow_cards"),
            "aerials_won_pm":pm("aerial_duels_won"),
        }
        out.append(rec)

out.sort(key=lambda r:(r["league"],-r["points"],-r["gd"]))
os.makedirs("web",exist_ok=True)
json.dump(out, open("web/teams.json","w"), separators=(",",":"))
print(f"wrote web/teams.json: {len(out)} team-season rows")
from collections import Counter
print("by league:", dict(Counter(r["league"] for r in out)))
print("size:", os.path.getsize("web/teams.json"),"bytes")
