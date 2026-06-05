def detect_dark_patterns(text):
    patterns = []

    t = text.lower()

    # Forced Consent
    forced_consent_keywords = [
        "by continuing you agree",
        "must accept",
        "required to accept",
        "cannot use the service without agreeing",
        "agree to all terms"
    ]

    if any(k in t for k in forced_consent_keywords):
        patterns.append(
            "Forced Consent"
        )

    # Vagure Data Sharing
    vague_sharing_keywords = [
        "share with partners",
        "share with third parties",
        "trusted partners",
        "business partners",
        "affiliates"
    ]

    if any(k in t for k in vague_sharing_keywords):
        patterns.append(
            "Vague Data Sharing"
        )

    # NO OPT OUT
    no_opt_out_keywords = [
        "cannot opt out",
        "no opt out",
        "unable to disable",
        "required for service",
        "mandatory collection"
    ]

    if any(k in t for k in no_opt_out_keywords):
        patterns.append(
            "No Opt-Out"
        )

    # Data Hoarding
    data_hoarding_keywords = [
        "retain indefinitely",
        "keep your data indefinitely",
        "store permanently",
    ]

    if any(k in t for k in data_hoarding_keywords):
        patterns.append(
            "Data Hoarding"
        )

    # User Profiling
    profiling_keywords = [
        "combine information",
        "combine data from partners",
        "profile you",
        "profiling purposes"
    ]

    if any(k in t for k in profiling_keywords):
        patterns.append(
            "User Profiling"
        )

    # Data Sale
    data_sale_keywords = [
        "sell your data",
        "sell personal information",
        "data brokers"
    ]

    if any(k in t for k in data_sale_keywords):
        patterns.append(
            "Data Sale"
        )

    # Tracking Heavily
    tracking_keywords = [
        "tracking technologies",
        "behavioral advertising",
        "cross-site tracking",
        "personalized advertising"
    ]

    if any(k in t for k in tracking_keywords):
        patterns.append(
            "Extensive Tracking"
        )

    return list(set(patterns))