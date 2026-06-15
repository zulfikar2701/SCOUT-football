#!/usr/bin/env python3
"""Summarize scraped record counts per league/endpoint."""
import os, json, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")

def count_lines(fp):
    n = 0
    with open(fp) as f:
        for _ in f:
            n += 1
    return n

total = 0
grand = {}
for lg in sorted(os.listdir(DATA)):
    d = os.path.join(DATA, lg)
    if not os.path.isdir(d):
        continue
    files = sorted(glob.glob(os.path.join(d, "*.jsonl")))
    if not files:
        continue
    print(f"\n== {lg} ==")
    sub = 0
    for fp in files:
        n = count_lines(fp)
        sub += n
        total += n
        print(f"  {os.path.basename(fp)[:-6]:32s} {n:>8d}")
    grand[lg] = sub
    print(f"  {'TOTAL':32s} {sub:>8d}")

print("\n==== GRAND TOTAL records:", total, "====")
print("by league:", {k: v for k, v in sorted(grand.items(), key=lambda x: -x[1])})
