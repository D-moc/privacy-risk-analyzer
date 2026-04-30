from fastapi import APIRouter

from services.fetcher import fetch_policy
from services.cleaner import clean_text
from services.analyzer import analyze_policy
from services.bert_classifier import classify_clauses
from services.risk_engine import calculate_risk
from services.summarizer import summarize_text
from services.dark_pattern import detect_dark_patterns
from services.preference import adjust_risk

router = APIRouter()


@router.post("/analyze")
def analyze(data: dict):

    # INPUT
    input_data = data.get("input") or data.get("text")
    preference = data.get("preference", "moderate")

    if not input_data:
        return {"error": "No input provided"}

    # FETCH + CLEAN
    raw_text = fetch_policy(input_data)
    clean = clean_text(raw_text)

    # LIMIT TEXT (IMPORTANT)
    clean = clean[:2000]

    # CLAUSE ANALYSIS
    clauses = analyze_policy(clean)

    # SAFE BERT
    try:
        bert_labels = classify_clauses(clean)
    except Exception as e:
        print("BERT Error:", e)
        bert_labels = []

    # DARK PATTERNS
    dark_patterns = detect_dark_patterns(clean)

    # RISK
    risk = calculate_risk(clauses, bert_labels, dark_patterns)
    final_risk = adjust_risk(risk, preference)

    # SUMMARY
    summary = summarize_text(clean)

    return {
        "summary": summary,
        "risk_score": final_risk,
        "clauses": clauses,
        "bert_labels": bert_labels,
        "dark_patterns": dark_patterns
    }