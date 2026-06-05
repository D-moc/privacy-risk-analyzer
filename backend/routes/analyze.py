from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Form
from fastapi import Request

from services.fetcher import fetch_policy
from services.cleaner import clean_text
from services.analyzer import analyze_policy
from services.risk_engine import calculate_risk
from services.bert_classifier import classify_clauses
from services.dark_pattern import detect_dark_patterns
from services.preference import adjust_risk
from services.report_generator import generate_privacy_report
from services.history_service import save_analysis
from services.file_reader import read_file

from utils.firebase_admin import (
    verify_firebase_token
)

router = APIRouter()

@router.post("/analyze")
async def analyze(
    request: Request,
    policy_name: str = Form(...),
    input: str = Form(""),
    preference: str = Form("moderate"),
    file: UploadFile = File(None)
):
    # Authentication
    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:
        return {
            "error": "Unauthorized"
        }

    token = auth_header.replace(
        "Bearer ",
        ""
    )

    decoded = verify_firebase_token(
        token
    )

    if not decoded:
        return {
            "error": "Invalid Token"
        }
    uid = decoded["uid"]
    
    # Input
    if file:
        input_data = read_file(file)
    else:
        input_data = input

    if not input_data:
        return {
            "error": "No input provided"
        }

    # Fetch & Clean
    raw_text = fetch_policy(input_data)
    clean = clean_text(raw_text)
    clean = clean[:15000]

    print("Policy Length:", len(clean))
    print(clean[:500])

    #Clause Analysis
    clauses = analyze_policy(clean)
    insights = classify_clauses(clean)

    
    #Dark Patterns
    dark_patterns = detect_dark_patterns(
        clean
    )

    #Risk Score
    risk = calculate_risk(
        insights,
        dark_patterns
    )

    final_risk = adjust_risk(
        risk,
        preference
    )

    # AI Report
    privacy_report = generate_privacy_report(
        final_risk,
        clauses,
        dark_patterns
    )

    # Risk Level
    risk_level = (
    "Low"
    if final_risk < 35
    else "Medium"
    if final_risk < 70
    else "High"
)

    # Save History
    try:
        save_analysis({
    "user_id": uid,
    "policy_name": policy_name,
    "risk_score": final_risk,
    "risk_level": risk_level,
    "privacy_report": privacy_report,
    "dark_patterns": dark_patterns,
    "clauses": clauses,
    "insights": insights
})

    except Exception as e:
        print("Mongo Save Error:", e)

    # Response
    return {
        "privacy_report": privacy_report,
        "risk_score": final_risk,
        "clauses": clauses,
        "insights": insights,
        "dark_patterns": dark_patterns
    }