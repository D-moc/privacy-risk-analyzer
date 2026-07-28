import random

from services.risk_engine import calculate_risk


def f(severity):
    return {"severity": severity}


def test_no_findings_scores_zero():
    assert calculate_risk([]) == 0


def test_worked_examples_match_design():
    # These exact values are called out in the QA report / plan as the
    # intended behavior of the saturating-sum formula.
    assert calculate_risk([f("critical")]) == 53
    assert calculate_risk([f("critical"), f("severe")]) == 70
    assert calculate_risk([f("critical")] * 3 + [f("severe")] * 2) == 96
    assert calculate_risk([f("critical"), f("good"), f("good"), f("good")]) == 31


def test_low_severity_findings_are_neutral():
    # QA regression test: under the OLD averaging formula, adding "low"
    # findings to a lone critical finding dropped the score from 100 to
    # 53 — a strictly worse policy scoring better. Low findings must be
    # neutral: adding any number of them changes nothing.
    base = calculate_risk([f("critical")])
    with_lows = calculate_risk([f("critical"), f("low"), f("low"), f("low")])
    assert with_lows == base


def test_monotonicity_never_regresses():
    # QA regression test: adding any additional critical/severe/moderate/
    # low finding to ANY existing findings list must never DECREASE the
    # score. This is the core property the old averaging formula broke.
    random.seed(1)
    severities = ["critical", "severe", "moderate", "low", "good"]
    for _ in range(500):
        base = [f(random.choice(severities)) for _ in range(random.randint(0, 8))]
        base_score = calculate_risk(base)
        for sev in ["critical", "severe", "moderate", "low"]:
            extended_score = calculate_risk(base + [f(sev)])
            assert extended_score >= base_score, (
                f"Monotonicity violated: {base} + {sev} went from "
                f"{base_score} to {extended_score}"
            )


def test_score_stays_within_bounds():
    random.seed(2)
    severities = ["critical", "severe", "moderate", "low", "good"]
    for _ in range(200):
        findings = [f(random.choice(severities)) for _ in range(random.randint(0, 20))]
        score = calculate_risk(findings)
        assert 0 <= score <= 100
