# Cross-user aggregation for the operator, not a single user's stats —
# see routes/stats.py for the per-user equivalent. Every metric here is
# picked for a specific business reason (see the plan/memory notes), not
# just "because the data exists":
# - policy_drift: the one insight that's genuinely unique to having
#   historical data rather than a snapshot — did a specific company's
#   policy actually get worse (or better) between two real scans. Real
#   signal even with just 2 scans of one domain, unlike the aggregate
#   counts below which need real volume to mean anything.
# - best_performers: the inverse of worst_offenders — domains that have
#   NEVER scored above "Low" risk. Proof-of-concept for a "Privacy
#   Verified" badge program a company could pay to display, since this
#   is literally the mechanism that would decide who qualifies.
# - worst_offenders: a proprietary "riskiest sites" list (content/lead-gen)
# - coverage_gap: domains leaning entirely on our own AI, never ToS;DR —
#   shows where to prioritize ToS;DR submissions or the ML models
# - dark_pattern_frequency / risk_trend: platform-wide "state of privacy
#   policies" signal, a real differentiator
# - scans_per_day / source_mix / unique_users: standard growth + Groq
#   API-cost-planning metrics (every "ai"-sourced scan is a paid call)
# - model_cross_check: real-world agreement rate between Groq and our
#   own trained severity model (services/ml_cross_check.py) across every
#   AI-sourced finding ever saved — the actual track record of the model
#   this project is meant to reduce Groq reliance with, not just its
#   held-out test-set numbers from training.
# - failure_rate / surface_split: from scan_attempts_collection (see
#   services/scan_tracking.py) — before this, only SUCCESSFUL scans were
#   ever recorded anywhere, so there was no visibility into how often the
#   tool actually fails a user (NOT_A_POLICY, a fetch failure, or a
#   timeout — all three collapse into the same "not_a_policy" outcome).
#   surface_split answers "extension vs website" using the same log,
#   inferred server-side from the request's Origin header rather than
#   requiring either client to self-report.
# - total_registered_users / total_downloads: growth-side metrics that
#   were previously invisible on the admin side entirely — registered
#   users (via Firebase, not just users who happened to scan something)
#   and how many times the extension zip has actually been downloaded.
from collections import defaultdict

from fastapi import APIRouter
from fastapi import Request

from database import history_collection, scan_attempts_collection, extension_downloads_collection
from utils.admin_auth import require_admin
from utils.firebase_admin import auth as firebase_auth

router = APIRouter()


def _count_registered_users():
    try:
        return sum(1 for _ in firebase_auth.list_users().iterate_all())
    except Exception as e:
        print("Firebase user count error:", e)
        return None


@router.get("/admin/analytics")
def admin_analytics(request: Request):
    if not require_admin(request):
        return {"error": "Unauthorized"}

    docs = list(history_collection.find({}))

    scans_by_policy = defaultdict(list)
    never_above_low = defaultdict(lambda: True)
    high_counts = defaultdict(int)
    ai_only_counts = defaultdict(int)
    has_tosdr = defaultdict(bool)
    dark_pattern_counts = defaultdict(int)
    scans_per_day = defaultdict(int)
    risk_per_day = defaultdict(list)
    source_mix = defaultdict(int)
    unique_users = set()
    verified_agree = 0
    verified_disagree = 0
    not_yet_checked = 0

    for doc in docs:
        policy_name = doc.get("policy_name", "Unknown")
        source = doc.get("source", "ai")
        created_at = doc.get("created_at")

        if source == "ai":
            for finding in doc.get("findings", []):
                verified = finding.get("verified")
                if verified is True:
                    verified_agree += 1
                elif verified is False:
                    verified_disagree += 1
                else:
                    not_yet_checked += 1

        if doc.get("risk_level") == "High":
            high_counts[policy_name] += 1

        if doc.get("risk_level") != "Low":
            never_above_low[policy_name] = False

        if source == "tosdr":
            has_tosdr[policy_name] = True
        else:
            ai_only_counts[policy_name] += 1

        for pattern in doc.get("dark_patterns", []):
            dark_pattern_counts[pattern] += 1

        source_mix[source] += 1

        if doc.get("user_id"):
            unique_users.add(doc["user_id"])

        if created_at:
            day = created_at.strftime("%Y-%m-%d")
            scans_per_day[day] += 1
            risk_per_day[day].append(doc.get("risk_score", 0))
            scans_by_policy[policy_name].append((created_at, doc.get("risk_score", 0)))

    # Policy drift: compare each domain's two most recent scans. Only
    # meaningful for domains actually scanned more than once — most
    # won't qualify yet, which is fine, this isn't supposed to be dense.
    worsened = []
    improved = []
    for policy_name, scans in scans_by_policy.items():
        if len(scans) < 2:
            continue
        scans.sort(key=lambda s: s[0])
        previous_score, latest_score = scans[-2][1], scans[-1][1]
        delta = latest_score - previous_score
        if delta > 0:
            worsened.append({"policy_name": policy_name, "previous_score": previous_score, "latest_score": latest_score, "delta": delta})
        elif delta < 0:
            improved.append({"policy_name": policy_name, "previous_score": previous_score, "latest_score": latest_score, "delta": delta})

    worsened.sort(key=lambda x: x["delta"], reverse=True)
    improved.sort(key=lambda x: x["delta"])

    worst_offenders = sorted(
        [{"policy_name": name, "high_risk_scans": count} for name, count in high_counts.items()],
        key=lambda x: x["high_risk_scans"],
        reverse=True,
    )[:10]

    best_performers = sorted(
        [
            {
                "policy_name": name,
                "avg_score": round(sum(s[1] for s in scans) / len(scans)),
                "scans": len(scans),
            }
            for name, scans in scans_by_policy.items()
            if never_above_low[name]
        ],
        key=lambda x: x["avg_score"],
    )[:10]

    coverage_gap = sorted(
        [
            {"policy_name": name, "ai_only_scans": count}
            for name, count in ai_only_counts.items()
            if not has_tosdr[name]
        ],
        key=lambda x: x["ai_only_scans"],
        reverse=True,
    )[:10]

    sorted_days = sorted(scans_per_day.keys())
    dark_pattern_ranked = sorted(dark_pattern_counts.items(), key=lambda x: x[1], reverse=True)
    ai_calls = source_mix.get("ai", 0)

    total_checked = verified_agree + verified_disagree
    agreement_rate = round(100 * verified_agree / total_checked) if total_checked else None

    # Failure rate + extension/website split — from the attempt log, which
    # (unlike history_collection) records every attempt, not just the
    # successful ones.
    attempts = list(scan_attempts_collection.find({}))
    total_attempts = len(attempts)
    failed_attempts = sum(1 for a in attempts if a.get("outcome") != "success")
    failure_rate_pct = round(100 * failed_attempts / total_attempts) if total_attempts else None

    surface_counts = defaultdict(int)
    for a in attempts:
        surface_counts[a.get("surface", "website")] += 1

    total_registered_users = _count_registered_users()
    total_downloads = extension_downloads_collection.count_documents({})

    # Plain-English narrative, generated from the same numbers above —
    # turns raw charts into read-in-10-seconds conclusions, not just data.
    summary = []
    if worsened:
        top = worsened[0]
        summary.append(
            f"{len(worsened)} domain(s) got riskier between scans — worst is "
            f"\"{top['policy_name']}\" ({top['previous_score']} → {top['latest_score']})."
        )
    if improved:
        summary.append(f"{len(improved)} domain(s) improved their policy since the last scan.")
    if coverage_gap:
        summary.append(
            f"{len(coverage_gap)} domain(s) rely entirely on our AI with no ToS;DR match — "
            "candidates to submit for human review."
        )
    if dark_pattern_ranked:
        name, count = dark_pattern_ranked[0]
        summary.append(f"\"{name}\" is the most common dark pattern seen so far, in {count} scan(s).")
    if ai_calls:
        summary.append(f"{ai_calls} scan(s) so far required a paid Groq call (no ToS;DR coverage).")
    if best_performers:
        summary.append(
            f"{len(best_performers)} domain(s) have never scored above \"Low\" risk — "
            "candidates for a Privacy Verified badge program."
        )
    if total_checked:
        summary.append(
            f"Our trained model agrees with Groq on {agreement_rate}% of AI-sourced "
            f"findings so far ({verified_agree}/{total_checked} checked)."
        )
    if total_attempts:
        summary.append(
            f"{failed_attempts} of {total_attempts} scan attempt(s) so far "
            f"({failure_rate_pct}%) didn't find a usable privacy policy."
        )
    if not summary:
        summary.append("Not enough scans yet for a meaningful summary — check back after more usage.")

    return {
        "total_scans": len(docs),
        "unique_users": len(unique_users),
        "executive_summary": summary,
        "policy_drift": {"worsened": worsened[:10], "improved": improved[:10]},
        "best_performers": best_performers,
        "model_cross_check": {
            "verified_agree": verified_agree,
            "verified_disagree": verified_disagree,
            "not_yet_checked": not_yet_checked,
            "agreement_rate": agreement_rate,
        },
        "worst_offenders": worst_offenders,
        "coverage_gap": coverage_gap,
        "dark_pattern_frequency": [
            {"pattern": pattern, "count": count} for pattern, count in dark_pattern_ranked
        ],
        "source_mix": dict(source_mix),
        "scans_per_day": [{"date": day, "count": scans_per_day[day]} for day in sorted_days],
        "risk_trend": [
            {"date": day, "avg_risk": round(sum(risk_per_day[day]) / len(risk_per_day[day]))}
            for day in sorted_days
        ],
        # Users & growth — total registered users (Firebase, not just
        # users who happened to scan something), extension downloads,
        # failure rate, and extension-vs-website usage split.
        "total_registered_users": total_registered_users,
        "total_downloads": total_downloads,
        "failure_rate": {
            "total_attempts": total_attempts,
            "failed": failed_attempts,
            "succeeded": total_attempts - failed_attempts,
            "failure_rate_pct": failure_rate_pct,
        },
        "surface_split": dict(surface_counts),
    }
