def detect_dark_patterns(text):
    patterns = []

    t = text.lower()

    if "by continuing you agree" in t:
        patterns.append("Forced Consent")

    if "we may share your data with partners" in t:
        patterns.append("Vague Data Sharing")

    if "cannot opt out" in t:
        patterns.append("No Opt-Out")

    return patterns