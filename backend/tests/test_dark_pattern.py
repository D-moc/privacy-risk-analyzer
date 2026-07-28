from services.dark_pattern import detect_dark_patterns


def test_negated_sharing_language_does_not_flag():
    # QA regression test: this exact sentence used to falsely flag
    # "Vague Data Sharing" as a critical finding despite explicitly
    # DENYING the practice, because detect_dark_patterns had zero
    # negation handling (plain substring search).
    text = "We do not share with third parties or affiliates under any circumstances."
    assert detect_dark_patterns(text) == []


def test_positive_sharing_language_still_flags():
    text = "We share with third parties including trusted partners and affiliates."
    assert "Vague Data Sharing" in detect_dark_patterns(text)


def test_self_negating_keyword_categories_still_fire():
    # "No Opt-Out" and "Forced Consent"'s OWN keywords contain negation
    # words as part of their intended meaning ("cannot opt out", "cannot
    # use ... without agreeing"). The negation-aware matcher must not
    # cancel these out — only text appearing BEFORE the phrase counts as
    # a negation context, not negation words that are part of the
    # matched phrase itself.
    assert "No Opt-Out" in detect_dark_patterns(
        "There is no opt out available and you cannot opt out of tracking."
    )
    assert "Forced Consent" in detect_dark_patterns(
        "You cannot use the service without agreeing to all terms."
    )


def test_retained_indefinitely_word_form_matches():
    # QA regression test: "retain indefinitely" (exact word form) missed
    # the very common past-tense phrasing "retained indefinitely".
    assert "Data Hoarding" in detect_dark_patterns("Your data is retained indefinitely.")


def test_multiple_real_patterns_detected_together():
    text = (
        "We sell your data to data brokers. We share with third parties and affiliates. "
        "Data is retained indefinitely."
    )
    patterns = detect_dark_patterns(text)
    assert "Data Sale" in patterns
    assert "Vague Data Sharing" in patterns
    assert "Data Hoarding" in patterns


def test_empty_text_returns_no_patterns():
    assert detect_dark_patterns("") == []
