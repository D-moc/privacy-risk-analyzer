from services.disclosure_checks import detect_disclosure_gaps


def _labels(gaps):
    return {g["label"] for g in gaps}


def test_negated_contact_phrase_still_flags_gap():
    # QA regression test: disclosure_checks.py's own _matches_any_group
    # had no negation handling (a weaker, independently-duplicated
    # version of keyword_scorer.py's matcher) — "you cannot contact us"
    # would have counted as "covered" for the contact check.
    text = "You cannot contact us and there is no way to reach our support team. " * 3
    gaps = detect_disclosure_gaps(text)
    assert "Doesn't say who to contact about privacy" in _labels(gaps)


def test_positive_contact_phrase_does_not_flag_gap():
    text = "You can contact us at any time via our support team for privacy questions."
    gaps = detect_disclosure_gaps(text)
    assert "Doesn't say who to contact about privacy" not in _labels(gaps)


def test_email_address_alone_counts_as_contact_method():
    text = "For any questions, reach out at privacy@example.com regarding this policy."
    gaps = detect_disclosure_gaps(text)
    assert "Doesn't say who to contact about privacy" not in _labels(gaps)


def test_empty_text_returns_no_gaps():
    assert detect_disclosure_gaps("") == []
