def calculate_risk(
    insights,
    dark_patterns=None
):

    score = 0

    # --------------------------
    # RISK FACTORS
    # --------------------------

    score += (
    insights.get(
        "Data Collection",
        0
    ) * 0.05
)

    score += (
        insights.get(
            "Data Sharing",
            0
        ) * 0.25
    )

    score += (
        insights.get(
            "Advertising",
            0
        ) * 0.15
    )

    score += (
        insights.get(
            "Cookies and Tracking",
            0
        ) * 0.10
    )

    score += (
        insights.get(
            "Location Access",
            0
        ) * 0.15
    )

    score += (
        insights.get(
            "Data Retention",
            0
        ) * 0.10
    )

    # --------------------------
    # POSITIVE PRIVACY SIGNALS
    # --------------------------

    score -= (
        insights.get(
            "User Rights",
            0
        ) * 0.10
    )

    score -= (
        insights.get(
            "Security",
            0
        ) * 0.15
    )

    # --------------------------
    # DARK PATTERNS
    # --------------------------

    if dark_patterns:

        score += (
            len(dark_patterns) * 5
        )

    # --------------------------
    # NORMALIZE
    # --------------------------

    score = max(
        0,
        min(
            round(score),
            100
        )
    )

    return score