# The complete hybrid analysis pipeline (fetch/auto-discover -> policy
# gate -> ToS;DR or Groq+Model B -> disclosure gaps -> Model A
# protections -> dark patterns -> 30/70 balance -> risk score), extracted
# so /api/analyze and /api/compare share ONE implementation. Compare used
# to run its own standalone copy (services/comparator.py, pre-session) that
# never got any of this session's upgrades — no ToS;DR, no model
# cross-checks, no disclosure gaps, no auto-discovery — since nothing
# forced the two to stay in sync. Extracting this instead of just
# "fixing" comparator.py in place removes that drift risk going forward:
# any future pipeline change here reaches both callers automatically.
from services.fetcher import fetch_policy
from services.cleaner import clean_text
from services.analyzer import analyze_policy
from services.risk_engine import calculate_risk
from services.clause_classifier import classify_clauses
from services.keyword_scorer import compute_data_practices, as_score_dict
from services.dark_pattern import detect_dark_patterns, DARK_PATTERN_DESCRIPTIONS
from services.tosdr_lookup import lookup as tosdr_lookup
from services.preference import adjust_risk
from services.report_generator import generate_privacy_report
from services.ml_cross_check import cross_check_findings, strengthen_protections
from services.disclosure_checks import detect_disclosure_gaps
from services.policy_gate import looks_like_privacy_policy
from services.finding_balance import cap_groq_findings

SEVERITY_ORDER = {"critical": 0, "severe": 1, "moderate": 2, "low": 3, "good": 4}


async def run_full_analysis(policy_name, input_data, preference="moderate"):
    raw_text = await fetch_policy(input_data)
    clean = clean_text(raw_text)
    clean = clean[:15000]

    clauses = analyze_policy(clean)

    # Hybrid scoring: check ToS;DR's human-reviewed database first (real
    # volunteers already read this policy) for the FINDINGS list; only ask
    # our own AI to judge those from scratch when the site isn't covered
    # there.
    tosdr_result = tosdr_lookup(policy_name, input_data)

    # Refuse to analyze text that doesn't look like a policy at all —
    # unless ToS;DR already has real coverage for this domain regardless
    # of which page got scanned (that lookup is by domain, not by the
    # captured text, so it's unaffected by this check).
    if not tosdr_result and not looks_like_privacy_policy(clean):
        return {"error": "NOT_A_POLICY"}

    classification = classify_clauses(clean)

    disclosure_gap_findings = []

    if tosdr_result:
        source = "tosdr"
        classifier_findings = tosdr_result["findings"]
        for f in classifier_findings:
            f["origin"] = "tosdr"
    else:
        source = "ai"
        classifier_findings = classification["findings"]
        for f in classifier_findings:
            f["origin"] = "groq"

        # Cross-check Groq's own findings against Model B — never runs on
        # ToS;DR-sourced findings above, since those are already
        # human-reviewed ground truth.
        classifier_findings = cross_check_findings(classifier_findings)

        # Deterministic disclosure-gap checks (retention, deletion
        # rights, international transfer, contact info, purpose).
        disclosure_gap_findings = detect_disclosure_gaps(clean, classifier_findings)

    # Data Practices breakdown: fully deterministic (no AI). Always runs
    # regardless of source, so it looks the same whether or not the site
    # was covered by ToS;DR.
    data_practices = compute_data_practices(clean)

    # Model A OR-combines with the keyword-based protections check above
    # — either method catching a protection is enough to mark it present.
    data_practices["protections"] = strengthen_protections(data_practices["protections"], clean)

    insights = as_score_dict(data_practices)  # kept for the web dashboard's chart

    dark_patterns = detect_dark_patterns(clean)

    # Dark patterns are manipulative-by-definition, so they're folded in
    # as "critical" findings alongside the classifier's own findings —
    # everything feeding the score comes from one severity-tagged list.
    dark_pattern_findings = [
        {
            "label": pattern,
            "category": "Manipulative Design",
            "severity": "critical",
            "origin": "detector",
            "detail": DARK_PATTERN_DESCRIPTIONS.get(
                pattern,
                "This practice can make it harder to understand or "
                "control how your data is used."
            ),
        }
        for pattern in dark_patterns
    ]

    # Keep Groq to roughly 30% of an AI-sourced scan's findings, our own
    # detection (dark patterns + disclosure gaps) the rest. Never applies
    # to ToS;DR findings, which aren't "AI" at all.
    if source == "ai":
        detector_count = len(dark_pattern_findings) + len(disclosure_gap_findings)
        classifier_findings = cap_groq_findings(classifier_findings, detector_count)

    findings = classifier_findings + dark_pattern_findings + disclosure_gap_findings
    findings.sort(key=lambda f: SEVERITY_ORDER.get(f.get("severity"), 3))

    risk = calculate_risk(findings)
    final_risk = adjust_risk(risk, preference)

    privacy_report = generate_privacy_report(final_risk, clauses, dark_patterns)

    risk_level = (
        "Low" if final_risk < 35
        else "Medium" if final_risk < 70
        else "High"
    )

    return {
        "privacy_report": privacy_report,
        "risk_score": final_risk,
        "risk_level": risk_level,
        "clauses": clauses,
        "insights": insights,
        "data_practices": data_practices,
        "dark_patterns": dark_patterns,
        "findings": findings,
        "source": source,
        "tosdr_rating": tosdr_result["tosdr_rating"] if tosdr_result else None,
        "tosdr_service_url": tosdr_result["service_url"] if tosdr_result else None,
    }
