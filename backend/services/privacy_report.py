def generate_privacy_report(
    summary,
    risk_score,
    clauses,
    dark_patterns=None
):
    report = []

    # Risk Level
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    report.append(f"PrivacyLens Assessment")
    report.append(f"Risk Level: {risk_level}")

    # AI Summary
    report.append("")
    report.append("Summary:")
    report.append(summary)

    # Findings
    report.append("")
    report.append("Key Findings:")

    if clauses.get("data_collection"):
        report.append(
            "• The policy collects personal user information."
        )

    if clauses.get("data_sharing"):
        report.append(
            "• Information may be shared with third parties."
        )

    if clauses.get("cookies"):
        report.append(
            "• Tracking technologies and cookies are used."
        )

    if clauses.get("retention"):
        report.append(
            "• User data may be retained for future use."
        )

    if dark_patterns:
        report.append(
            f"• {len(dark_patterns)} potential dark pattern(s) detected."
        )

    # Recommendation
    report.append("")
    report.append("Recommendation:")

    if risk_score >= 70:
        report.append(
            "Review permissions carefully before accepting this policy."
        )

    elif risk_score >= 40:
        report.append(
            "Review privacy settings and opt-out options where available."
        )

    else:
        report.append(
            "This policy appears relatively privacy-friendly, but users should still review the terms carefully."
        )

    return "\n".join(report)