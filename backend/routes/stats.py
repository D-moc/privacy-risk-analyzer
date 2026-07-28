from fastapi import APIRouter
from fastapi import Request
from database import history_collection
from utils.firebase_admin import (
    verify_firebase_token
)

router = APIRouter()

@router.get("/stats")
def get_stats(request: Request):
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

    reports = list(
        history_collection.find({
            "user_id": uid
        })
    )

    total_scans = len(reports)

    threats_found = len([
        r for r in reports
        if r.get("risk_level") == "High"
    ])

    if total_scans > 0:
        avg_risk = sum(
            r.get("risk_score", 0)
            for r in reports
        ) / total_scans

        privacy_score = round(
            100 - avg_risk
        )

    else:
        privacy_score = 100

    return {
        "total_scans":
            total_scans,

        "reports_generated":
            total_scans,

        "threats_found":
            threats_found,

        "privacy_score":
            privacy_score
    }