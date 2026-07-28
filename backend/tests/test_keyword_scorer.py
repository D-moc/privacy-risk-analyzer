from services.keyword_scorer import compute_data_practices


def _status_for(result, label):
    return next(d["status"] for d in result["data_types"] if d["label"] == label)


def test_far_apart_sharing_signal_does_not_mark_shared():
    # QA regression test: a sharing signal mentioned in a completely
    # separate, unrelated part of the document used to mark EVERY
    # collected data type as "shared", even ones never actually
    # described as being shared with anyone.
    filler = (
        "This section describes our general commitment to protecting user "
        "privacy and maintaining transparency in all our data handling "
        "practices across the organization. "
    ) * 4
    text = (
        "We collect your email address for account creation purposes only. "
        + filler
        + "Elsewhere, we may share aggregate anonymized analytics with our "
        "advertising partners and affiliates for marketing purposes."
    )
    result = compute_data_practices(text)
    assert _status_for(result, "Contact Info") == "collected"


def test_nearby_sharing_signal_marks_shared():
    text = (
        "We collect your email address and share it directly with our "
        "advertising partners and affiliates for marketing purposes."
    )
    result = compute_data_practices(text)
    assert _status_for(result, "Contact Info") == "shared"


def test_negated_protection_does_not_count_as_present():
    text = "We do not provide any way to delete your data or request deletion."
    result = compute_data_practices(text)
    deletion = next(p for p in result["protections"] if p["label"] == "You can request your data be deleted")
    assert deletion["present"] is False


def test_genuine_protection_counts_as_present():
    text = "You can request deletion of your data at any time by contacting support."
    result = compute_data_practices(text)
    deletion = next(p for p in result["protections"] if p["label"] == "You can request your data be deleted")
    assert deletion["present"] is True


def test_empty_text_returns_defaults():
    result = compute_data_practices("")
    assert all(d["status"] == "not_mentioned" for d in result["data_types"])
    assert all(p["present"] is False for p in result["protections"])
