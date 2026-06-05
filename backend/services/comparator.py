from services.cleaner import clean_text
from services.bert_classifier import classify_clauses
from services.dark_pattern import detect_dark_patterns
from services.risk_engine import calculate_risk

def compare_policies(policy1, policy2):

    # Policy 1
    clean1 = clean_text(policy1)

    insights1 = classify_clauses(
        clean1
    )

    dark_patterns1 = detect_dark_patterns(
        clean1
    )

    risk1 = calculate_risk(
        insights1,
        dark_patterns1
    )

    # Policy 2
    clean2 = clean_text(policy2)

    insights2 = classify_clauses(
        clean2
    )

    dark_patterns2 = detect_dark_patterns(
        clean2
    )

    risk2 = calculate_risk(
        insights2,
        dark_patterns2
    )

    # Winenr
    if risk1 < risk2:
        winner = "Policy 1"
    elif risk2 < risk1:
        winner = "Policy 2"
    else:
        winner = "Tie"

    # Debug
    print("Policy 1 Insights:", insights1)
    print("Policy 1 Risk:", risk1)

    print("Policy 2 Insights:", insights2)
    print("Policy 2 Risk:", risk2)

    # Response
    return {
        "policy1": {
            "risk_score": risk1,
            "insights": insights1,
            "dark_patterns": dark_patterns1
        },

        "policy2": {
            "risk_score": risk2,
            "insights": insights2,
            "dark_patterns": dark_patterns2
        },

        "winner": winner
    }