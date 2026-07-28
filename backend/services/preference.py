def adjust_risk(score, preference):

    if preference == "strict":
        return min(score + 20, 100)

    elif preference == "relaxed":
        return max(score - 20, 0)

    return score