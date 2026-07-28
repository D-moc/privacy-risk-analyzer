# Enforces an approximate 70% detector / 30% Groq mix in AI-sourced
# scans' findings — real data showed the split naturally running closer
# to 55/45, and the user wants our own trained models + keyword checks
# to dominate, with Groq as a smaller supplementary signal, not an equal
# or larger one. Never touches ToS;DR-sourced findings (not "AI" at all,
# already human-reviewed).
from services.ml_cross_check import SEVERITY_RANK

TARGET_GROQ_SHARE = 0.30


def cap_groq_findings(groq_findings, detector_count):
    if not groq_findings:
        return groq_findings

    # No detector baseline to weigh against — showing nothing would be
    # worse than showing Groq's findings uncapped in this one edge case.
    if detector_count == 0:
        return groq_findings

    allowed = max(1, round(detector_count * TARGET_GROQ_SHARE / (1 - TARGET_GROQ_SHARE)))
    if len(groq_findings) <= allowed:
        return groq_findings

    ranked = sorted(groq_findings, key=lambda f: SEVERITY_RANK.get(f.get("severity"), 1), reverse=True)
    return ranked[:allowed]
