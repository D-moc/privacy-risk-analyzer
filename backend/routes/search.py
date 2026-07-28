from fastapi import APIRouter
from fastapi import Request

from database import history_collection

from utils.firebase_admin import (
    verify_firebase_token
)

router = APIRouter()

@router.get("/search")
def search_reports(
    q: str,
    request: Request
):

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:
        return []

    token = auth_header.replace(
        "Bearer ",
        ""
    )

    decoded = verify_firebase_token(
        token
    )

    if not decoded:
        return []

    uid = decoded["uid"]

    items = history_collection.find({

        "user_id": uid,

        "$or": [

            {
                "policy_name": {
                    "$regex": q,
                    "$options": "i"
                }
            },

            {
                "privacy_report": {
                    "$regex": q,
                    "$options": "i"
                }
            },

            {
                "risk_level": {
                    "$regex": q,
                    "$options": "i"
                }
            }

        ]

    }).limit(10)

    results = []

    for item in items:

        results.append({
            "id": str(item["_id"]),
            "policy_name": item.get(
                "policy_name"
            ),

            "risk_level": item.get(
                "risk_level"
            )
        })

    return results