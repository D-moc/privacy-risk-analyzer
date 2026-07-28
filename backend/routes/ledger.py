from fastapi import APIRouter
from fastapi import Request

from services.ledger_service import get_ledger
from utils.firebase_admin import (
    verify_firebase_token
)

router = APIRouter()

@router.get("/ledger")
def ledger(request: Request):

    auth_header = request.headers.get(
        "Authorization"
    )

    if not auth_header:

        return {
            "error":
            "Unauthorized"
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
            "error":
            "Invalid Token"
        }

    uid = decoded["uid"]

    return get_ledger(uid)
