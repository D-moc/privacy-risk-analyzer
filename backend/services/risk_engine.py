def calculate_risk(clauses, bert_labels=None, dark_patterns=None):
    score = 0

    # Ensure clauses is dictionary
    if isinstance(clauses, dict):
        score += len(clauses.get("data_collection", [])) * 2
        score += len(clauses.get("data_sharing", [])) * 5
        score += len(clauses.get("cookies", [])) * 1
        score += len(clauses.get("retention", [])) * 3

    elif isinstance(clauses, list):
        # fallback if analyzer returns list
        score += len(clauses) * 2

    # Dark patterns
    if dark_patterns:
        score += len(dark_patterns) * 10

    # Optional: BERT labels boost
    if bert_labels:
        score += len(bert_labels) * 2

    return min(score, 100)