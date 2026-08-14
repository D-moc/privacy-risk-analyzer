# Crawls ToS;DR's public API into a flat (text, severity) CSV for Model
# B (the severity classifier). Reuses the exact same classification
# mapping already in services/tosdr_lookup.py, so the trained model's
# output uses identical severity semantics to the rest of the app.
#
# ToS;DR has no clean bulk-export endpoint (their own docs call the API
# "alpha-state"). GET /service/v2/ reports `_page.total: 10392` services
# but the documented pagination params (page=, page[number]=) don't
# actually page through in testing — every call returns the same first
# ~500. Worked around by using /search/v5/?query=<term> instead: each
# single-letter/digit and two-letter query returns a different ~100-ish
# batch of services, so the UNION across many short queries surfaces far
# more of the real catalog than the broken index pagination alone
# (confirmed: 500 -> 7,958 unique service IDs, ~76% of the reported total
# 10,392, via 26 single-char + 676 two-letter queries).
#
# Fetches each service's points via the same service/v3/?id= endpoint
# tosdr_lookup.py already uses, concurrently (bounded thread pool — still
# polite, just not one-at-a-time) and cached to disk
# (data/tosdr_cache/<id>.json) so a re-run only fetches ids not already
# cached, regardless of which stage (enumeration or point-fetch) is rerun.
import csv
import json
import os
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CACHE_DIR = os.path.join(DATA_DIR, "tosdr_cache")
ID_LIST_PATH = os.path.join(DATA_DIR, "tosdr_service_ids.json")
OUT_PATH = os.path.join(DATA_DIR, "tosdr_points.csv")

SEARCH_URL = "https://api.tosdr.org/search/v5/"
SERVICE_URL = "https://api.tosdr.org/service/v3/"

# Matches services/tosdr_lookup.py's CLASSIFICATION_TO_SEVERITY exactly.
CLASSIFICATION_TO_SEVERITY = {
    "blocker": "critical",
    "bad": "severe",
    "neutral": "low",
    "good": "good",
}

SEARCH_DELAY_SECONDS = 0.12
MAX_WORKERS = 8


def discover_service_ids():
    if os.path.exists(ID_LIST_PATH):
        with open(ID_LIST_PATH, encoding="utf-8") as f:
            ids = json.load(f)
        print(f"Using cached service id list: {len(ids)} ids")
        return ids

    ids = set()
    queries = list(string.ascii_lowercase) + list(string.digits)
    queries += [a + b for a in string.ascii_lowercase for b in string.ascii_lowercase]

    for i, q in enumerate(queries):
        try:
            resp = requests.get(SEARCH_URL, params={"query": q}, timeout=10)
            for s in resp.json().get("services", []):
                ids.add(s["id"])
        except requests.RequestException:
            pass
        if i % 100 == 0:
            print(f"  discovery {i}/{len(queries)} queries, {len(ids)} unique ids so far")
        time.sleep(SEARCH_DELAY_SECONDS)

    ids = sorted(ids)
    print(f"Discovered {len(ids)} unique service ids")

    os.makedirs(DATA_DIR, exist_ok=True)
    with open(ID_LIST_PATH, "w", encoding="utf-8") as f:
        json.dump(ids, f)

    return ids


def fetch_service_points(service_id):
    cache_path = os.path.join(CACHE_DIR, f"{service_id}.json")

    if os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            return json.load(f)

    try:
        resp = requests.get(SERVICE_URL, params={"id": service_id}, timeout=15)
        if resp.status_code != 200:
            return None
        data = resp.json()
    except requests.RequestException:
        return None

    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(data, f)

    return data


def build_corpus():
    service_ids = discover_service_ids()

    rows_out = []
    completed = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(fetch_service_points, sid): sid for sid in service_ids}

        for future in as_completed(futures):
            completed += 1
            if completed % 250 == 0:
                print(f"  ...{completed}/{len(service_ids)} services fetched, {len(rows_out)} points so far")

            detail = future.result()
            if not detail:
                continue

            points = detail.get("points") or []
            for point in points:
                case = point.get("case") or {}
                severity = CLASSIFICATION_TO_SEVERITY.get(case.get("classification"))
                if not severity:
                    continue

                text = (point.get("title") or case.get("title") or "").strip()
                if len(text) < 10:
                    continue

                rows_out.append({"text": text, "severity": severity})

    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "severity"])
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Wrote {len(rows_out)} labeled points to {OUT_PATH}")

    from collections import Counter
    print("Severity distribution:", Counter(r["severity"] for r in rows_out))


if __name__ == "__main__":
    build_corpus()
