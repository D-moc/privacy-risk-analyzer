import pytest

from services.ml_cross_check import cross_check_findings, _load_models
import services.ml_cross_check as mc


@pytest.fixture(scope="module", autouse=True)
def _ensure_models_available():
    _load_models()
    if not mc._severity_model:
        pytest.skip("Trained severity model artifact not present in this environment")


def test_confident_good_finding_mislabeled_severe_gets_corrected():
    # QA regression test: Groq mislabeled this plainly protective
    # statement as "severe". Model B scores it ~93% "good", but the old
    # code only ever ESCALATED severity, never downgraded it — so the
    # wrong "severe" label stuck around, inflating the risk score for
    # language that should reduce it.
    findings = [{
        "label": "We never sell or share your personal information with third parties",
        "detail": "",
        "severity": "severe",
    }]
    result = cross_check_findings(findings)
    assert result[0]["severity"] == "good"
    assert result[0]["verified"] is False


def test_escalation_still_works_for_genuine_disagreement():
    # A clearly bad statement Groq under-called as "moderate" should
    # still escalate — the polarity-correction fix must not break the
    # original "err toward flagging real concerns" behavior.
    findings = [{
        "label": "We sell your personal data to data brokers and third parties",
        "detail": "",
        "severity": "moderate",
    }]
    result = cross_check_findings(findings)
    assert result[0]["severity"] in ("severe", "critical")


def test_agreement_marks_verified_true():
    findings = [{
        "label": "We never sell or share your personal information with third parties",
        "detail": "",
        "severity": "good",
    }]
    result = cross_check_findings(findings)
    assert result[0]["verified"] is True
    assert result[0]["severity"] == "good"


def test_empty_findings_list_returns_empty():
    assert cross_check_findings([]) == []
