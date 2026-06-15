#!/usr/bin/env python3
"""
Turn the raw JSONL scrape into a clean, analysis-ready deliverable:
  - dedups every <league>/<endpoint>.jsonl
  - writes a flattened CSV next to each JSONL (nested player objects expanded)
  - builds a players master table (id -> name/position) harvested from all sources
  - writes MANIFEST.md with record counts

Run any time; it only reads data/ and writes data/ + exports/.
"""
import os, json, csv, glob, io
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
EXPORT = os.path.join(ROOT, "exports")
os.makedirs(EXPORT, exist_ok=True)

def load_jsonl(fp):
    out = []
    with open(fp) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                pass
    return out

def flatten(rec):
    """Flatten one record: expand nested player/secondary_player/team dicts to scalar cols."""
    flat = {}
    for k, v in rec.items():
        if isinstance(v, dict):
            # nested object (e.g. player) -> prefix its scalar fields
            for kk, vv in v.items():
                if not isinstance(vv, (dict, list)):
                    flat[f"{k}_{kk}"] = vv
            if "id" in v:
                flat[f"{k}_id"] = v["id"]
        elif isinstance(v, list):
            flat[k] = json.dumps(v, separators=(",", ":"))
        else:
            flat[k] = v
    return flat

def dedup(records, keyfields=None):
    seen, out = set(), []
    for r in records:
        if keyfields:
            key = tuple(r.get(f) for f in keyfields)
        else:
            key = json.dumps(r, sort_keys=True, separators=(",", ":"))
        if key in seen:
            continue
        seen.add(key); out.append(r)
    return out

def write_csv(fp_csv, rows):
    if not rows:
        return 0
    cols = []
    seen = set()
    for r in rows:
        for k in r:
            if k not in seen:
                seen.add(k); cols.append(k)
    with open(fp_csv, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    return len(rows)

def main():
    manifest = ["# balldontlie European soccer scrape — manifest\n"]
    players = {}  # id -> {id, display_name, first_name, last_name, position, ...}

    def harvest_player(p):
        if not isinstance(p, dict):
            return
        pid = p.get("id")
        if pid is None:
            return
        cur = players.setdefault(pid, {})
        for k, v in p.items():
            if not isinstance(v, (dict, list)) and v not in (None, ""):
                cur[k] = v

    grand = 0
    for lg in sorted(os.listdir(DATA)):
        d = os.path.join(DATA, lg)
        if not os.path.isdir(d):
            continue
        files = sorted(glob.glob(os.path.join(d, "*.jsonl")))
        if not files:
            continue
        manifest.append(f"\n## {lg}\n")
        manifest.append("| endpoint | records |\n|---|---:|\n")
        for fp in files:
            name = os.path.basename(fp)[:-6]
            recs = load_jsonl(fp)
            recs = dedup(recs)
            # harvest embedded players
            for r in recs:
                for pk in ("player", "secondary_player"):
                    if pk in r:
                        harvest_player(r[pk])
                if name in ("players", "rosters") and "id" in r:
                    harvest_player(r)
            flat = [flatten(r) for r in recs]
            outdir = os.path.join(EXPORT, lg)
            os.makedirs(outdir, exist_ok=True)
            write_csv(os.path.join(outdir, name + ".csv"), flat)
            # rewrite a clean deduped jsonl too
            with open(os.path.join(outdir, name + ".jsonl"), "w") as f:
                for r in recs:
                    f.write(json.dumps(r, separators=(",", ":")) + "\n")
            manifest.append(f"| {name} | {len(recs)} |\n")
            grand += len(recs)

    # players master
    if players:
        plist = list(players.values())
        write_csv(os.path.join(EXPORT, "players_master.csv"), [flatten(p) for p in plist])
        with open(os.path.join(EXPORT, "players_master.jsonl"), "w") as f:
            for p in plist:
                f.write(json.dumps(p, separators=(",", ":")) + "\n")
        manifest.append(f"\n## players_master (harvested from all sources)\n\n**{len(plist)} distinct players**\n")

    manifest.append(f"\n---\n\n**Grand total records: {grand}**\n")
    with open(os.path.join(EXPORT, "MANIFEST.md"), "w") as f:
        f.write("".join(manifest))
    print("export complete:", grand, "records;", len(players), "distinct players")
    print("manifest:", os.path.join(EXPORT, "MANIFEST.md"))

if __name__ == "__main__":
    main()
