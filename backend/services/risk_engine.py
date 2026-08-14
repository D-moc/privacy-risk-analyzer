# Scoring methodology
# --------------------
# Each finding is already tagged with a severity by the classifier (see
# clause_classifier.py). Points accumulate per finding — critical and
# severe findings contribute real weight, "low" stays at 0 on purpose
# (see below), "good" findings earn a credit — then the total is passed
# through a saturating curve so the score approaches 100 as issues pile
# up, rather than growing without bound.
#
# This replaced a severity-weighted AVERAGE (kept here as a `git blame`
# breadcrumb for why): averaging meant a policy could score BETTER by
# having MORE things wrong with it — e.g. a single "critical" finding
# alone averaged to the max (100), but that same critical finding plus
# 3 "low" findings averaged down to ~53, even though the second policy
# objectively has more concerns recorded, not fewer. A correct scoring
# model must be monotonic: adding another concerning finding should
# never lower the score. Summing (not averaging) fixes that, but a plain
# sum would then make a long, thorough policy score as "riskier" than a
# short vague one purely for recording more findings — the saturating
# curve below avoids that by making returns diminish as points grow,
# and "low" severity stays neutral (0 points) so merely mentioning minor
# things never counts against a policy on its own, matching the original
# design's intent for that tier.
#
# References used to ground this:
# - ToS;DR classification (github.io/tosdr.org/classification.html):
#   individual points scored by severity.
# - CMU Usable Privacy Policy Project / OPP-115 corpus + Polisis:
#   practices are labeled per fine-grained category rather than judged
#   as one lump sum.
# - GDPR Article 13: specific mandatory disclosures a policy must make;
#   missing ones are folded in as their own "severe" findings upstream.
import math

SEVERITY_POINTS = {
    "critical": 30,
    "severe": 18,
    "moderate": 8,
    "low": 0,
    "good": -5,
}

SATURATION_SCALE = 40  # tuning constant — shapes how fast the curve saturates toward 100


def calculate_risk(findings):
    if not findings:
        return 0

    raw_points = max(
        0,
        sum(SEVERITY_POINTS.get(f.get("severity", "low"), 0) for f in findings),
    )

    score = round(100 * (1 - math.exp(-raw_points / SATURATION_SCALE)))

    return max(0, min(score, 100))
