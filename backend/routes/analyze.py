from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File
from fastapi import Form
from fastapi import Request

from services.analysis_pipeline import run_full_analysis
from services.history_service import save_analysis
from services.ledger_service import record_grants
from services.file_reader import read_file, FileReadError
from services.scan_tracking import detect_surface, log_scan_attempt

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
    # Authentication (optional — e.g. the browser extension can scan
    # anonymously; results are only saved to history when signed in)
    auth_header = request.headers.get(
        "Authorization"
    )

    uid = None

    if auth_header:
        token = auth_header.replace(
            "Bearer ",
            ""
        )

        decoded = verify_firebase_token(
            token
        )

        if decoded:
            uid = decoded["uid"]

    # Input
    if file:
        try:
            input_data = read_file(file)
        except FileReadError as e:
            return {"error": str(e)}
    else:
        input_data = input

    if not input_data:
        return {
            "error": "No input provided"
        }

    surface = detect_surface(request)

    result = await run_full_analysis(policy_name, input_data, preference)

    if result.get("error"):
        log_scan_attempt(policy_name, surface, "not_a_policy" if result["error"] == "NOT_A_POLICY" else "error")
        return result

    log_scan_attempt(policy_name, surface, "success")

    # Save History (only when signed in)
    if uid:
        try:
            save_analysis({
                "user_id": uid,
                "policy_name": policy_name,
                "risk_score": result["risk_score"],
                "risk_level": result["risk_level"],
                "privacy_report": result["privacy_report"],
                "dark_patterns": result["dark_patterns"],
                "clauses": result["clauses"],
                "insights": result["insights"],
                "data_practices": result["data_practices"],
                "findings": result["findings"],
                "source": result["source"],
            })
        except Exception as e:
            print("Mongo Save Error:", e)

        # Feeds the Data Exposure Ledger — best-effort, same as history
        # above, since a ledger write failing shouldn't break the scan.
        try:
            record_grants(uid, policy_name, result["data_practices"])
        except Exception as e:
            print("Ledger Save Error:", e)

    return result
