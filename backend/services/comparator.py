from services.analysis_pipeline import run_full_analysis


async def compare_policies(policy1_input, policy2_input, preference="moderate"):
    result1 = await run_full_analysis("Policy 1", policy1_input, preference)
    result2 = await run_full_analysis("Policy 2", policy2_input, preference)

    if result1.get("error") or result2.get("error"):
        return {
            "error": result1.get("error") or result2.get("error"),
            "policy1_error": result1.get("error"),
            "policy2_error": result2.get("error"),
        }

    if result1["risk_score"] < result2["risk_score"]:
        winner = "Policy 1"
    elif result2["risk_score"] < result1["risk_score"]:
        winner = "Policy 2"
    else:
        winner = "Tie"

    return {
        "policy1": result1,
        "policy2": result2,
        "winner": winner,
    }
