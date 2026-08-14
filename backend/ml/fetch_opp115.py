# Downloads + parses the OPP-115 corpus (CMU Usable Privacy Policy
# Project, CC BY-NC — research/teaching/scholarship only) into a flat
# (text, categories[]) CSV for Model A (the practice-presence classifier).
#
# Corpus layout (confirmed by inspecting the real zip, not just docs):
# - annotations/<policy>.csv — one row per RAW annotated data practice
#   (all 3 annotators, no deduplication): columns are annotation id,
#   batch id, annotator id, policy id, segment id, category name,
#   attribute-value JSON, policy URL, date (see documentation/manual.txt).
# - sanitized_policies/<policy>.html — the same policy's text, segmented
#   with "|||" as the separator; segment_id in the CSV indexes into this
#   split (0-indexed).
#
# Uses raw annotations/ rather than a single consolidation/ threshold —
# confirmed by counting rows across all four options (23,194 raw vs
# 17,291-21,510 consolidated) that raw has the most independent-annotator
# coverage. Multiple data practices already share a segment (different
# annotators, or multiple categories in one paragraph); grouping by
# segment and taking the SET of categories naturally collapses exact
# duplicates while keeping every distinct category any annotator caught
# — more real signal than any single consolidation threshold discards.
import csv
import io
import os
import re
import zipfile

import requests
from bs4 import BeautifulSoup

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ZIP_PATH = os.path.join(DATA_DIR, "opp115.zip")
OUT_PATH = os.path.join(DATA_DIR, "opp115_segments.csv")
DOWNLOAD_URL = "https://www.usableprivacy.org/static/data/OPP-115_v1_0.zip"

ANNOTATIONS_DIR = "OPP-115/annotations/"
SANITIZED_DIR = "OPP-115/sanitized_policies/"


def ensure_downloaded():
    if os.path.exists(ZIP_PATH) and os.path.getsize(ZIP_PATH) > 50_000_000:
        print(f"Using cached {ZIP_PATH}")
        return

    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"Downloading {DOWNLOAD_URL} ...")
    resp = requests.get(DOWNLOAD_URL, timeout=120)
    resp.raise_for_status()
    with open(ZIP_PATH, "wb") as f:
        f.write(resp.content)
    print(f"Saved {len(resp.content)} bytes to {ZIP_PATH}")


def clean_segment_text(raw_html_segment):
    text = BeautifulSoup(raw_html_segment, "html.parser").get_text(separator=" ")
    return re.sub(r"\s+", " ", text).strip()


def parse_corpus():
    z = zipfile.ZipFile(ZIP_PATH)

    annotation_files = [
        n for n in z.namelist()
        if n.startswith(ANNOTATIONS_DIR) and n.endswith(".csv")
    ]

    rows_out = []
    skipped_no_sanitized = 0

    for csv_name in annotation_files:
        stem = csv_name[len(ANNOTATIONS_DIR):-len(".csv")]
        sanitized_name = f"{SANITIZED_DIR}{stem}.html"

        try:
            sanitized_raw = z.read(sanitized_name).decode("utf-8", errors="replace")
        except KeyError:
            skipped_no_sanitized += 1
            continue

        segments = sanitized_raw.split("|||")

        raw_csv = z.read(csv_name).decode("utf-8", errors="replace")
        reader = csv.reader(io.StringIO(raw_csv))

        categories_by_segment = {}
        policy_id = None

        for row in reader:
            if len(row) < 6:
                continue
            policy_id = row[3]
            try:
                segment_id = int(row[4])
            except ValueError:
                continue
            category = row[5].strip()
            if not category:
                continue
            categories_by_segment.setdefault(segment_id, set()).add(category)

        for segment_id, categories in categories_by_segment.items():
            if segment_id < 0 or segment_id >= len(segments):
                continue
            text = clean_segment_text(segments[segment_id])
            if len(text) < 20:
                continue
            rows_out.append({
                "policy_id": policy_id,
                "segment_id": segment_id,
                "text": text,
                "categories": "|".join(sorted(categories)),
            })

    print(f"Skipped {skipped_no_sanitized} consolidation files with no matching sanitized policy")

    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["policy_id", "segment_id", "text", "categories"])
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Wrote {len(rows_out)} labeled segments to {OUT_PATH}")

    from collections import Counter
    cat_counts = Counter()
    for r in rows_out:
        for c in r["categories"].split("|"):
            cat_counts[c] += 1
    print("Category distribution:")
    for cat, count in cat_counts.most_common():
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    ensure_downloaded()
    parse_corpus()
